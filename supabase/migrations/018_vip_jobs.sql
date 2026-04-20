-- VIP/Premium job system
-- vip_level: 'normal' (default), 'silver', 'gold'
-- vip_until: when VIP expires (null = not VIP)

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS vip_level TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS vip_until TIMESTAMPTZ;

-- Index for fast VIP filtering + sorting
CREATE INDEX IF NOT EXISTS idx_jobs_vip ON public.jobs(vip_level, vip_until DESC) WHERE vip_level != 'normal';
