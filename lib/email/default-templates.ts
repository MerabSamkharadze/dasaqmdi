// Default email templates for application status notifications
// Used when employer hasn't customized their templates

export const DEFAULT_TEMPLATES = {
  accepted: {
    subject: "🎉 Congratulations! Your application has been accepted",
    subject_ka: "🎉 გილოცავთ! თქვენი განაცხადი მიღებულია",
    body: `Dear {applicant_name},

We are pleased to inform you that your application for the {job_title} position at {company_name} has been accepted!

Our team will contact you shortly with the next steps.

Best regards,
{company_name}`,
    body_ka: `ძვირფასო {applicant_name},

სიამოვნებით გაცნობებთ, რომ {company_name}-ში {job_title} პოზიციაზე თქვენი განაცხადი მიღებულია!

ჩვენი გუნდი მალე დაგიკავშირდებათ შემდეგი ნაბიჯების შესახებ.

პატივისცემით,
{company_name}`,
  },
  rejected: {
    subject: "Update on your application — {company_name}",
    subject_ka: "განაცხადის განახლება — {company_name}",
    body: `Dear {applicant_name},

Thank you for your interest in the {job_title} position at {company_name}.

After careful consideration, we have decided to move forward with other candidates. We appreciate the time you invested in your application and encourage you to apply for future openings.

We wish you the best of luck in your job search!

Best regards,
{company_name}`,
    body_ka: `ძვირფასო {applicant_name},

გმადლობთ, რომ დაინტერესდით {company_name}-ში {job_title} პოზიციით.

საფუძვლიანი განხილვის შემდეგ, გადაწყვეტილება მიღებულ იქნა სხვა კანდიდატის სასარგებლოდ. ვაფასებთ დროს, რომელიც განაცხადში ჩადეთ და გიწვევთ მომავალ ვაკანსიებზე განაცხადის გაგზავნას.

გისურვებთ წარმატებას!

პატივისცემით,
{company_name}`,
  },
} as const;

// Replace template variables with actual values
export function renderTemplate(
  template: string,
  variables: {
    applicant_name: string;
    job_title: string;
    company_name: string;
  }
): string {
  return template
    .replace(/\{applicant_name\}/g, variables.applicant_name)
    .replace(/\{job_title\}/g, variables.job_title)
    .replace(/\{company_name\}/g, variables.company_name);
}
