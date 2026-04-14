-- Phase 12: Email templates for application status notifications
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('accepted', 'rejected')),
  subject TEXT NOT NULL,
  subject_ka TEXT,
  body TEXT NOT NULL,
  body_ka TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, type)
);

-- RLS: employer owns templates via company
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employer can manage own templates"
  ON email_templates FOR ALL
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Default templates (inserted per company on first use, not globally)
-- App code handles defaults when no custom template exists
