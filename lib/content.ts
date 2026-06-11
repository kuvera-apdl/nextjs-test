// Static marketing content that is safe to import from client components.

export type Faq = { category: string; q: string; a: string };

export const faqCategories = [
  "General",
  "Pricing & Billing",
  "Payments",
  "Security & Compliance",
  "Developers & API",
] as const;

export const faqs: Faq[] = [
  {
    category: "General",
    q: "What is Meridian Financial?",
    a: "Meridian is a financial operations platform for businesses. It combines multi-currency accounts, global payments, treasury management, lending, and corporate cards behind one dashboard and one API. (This site is a fictional demo — none of the products are real.)",
  },
  {
    category: "General",
    q: "Who is Meridian for?",
    a: "Finance teams at companies that move money at scale — typically 20 to 5,000 employees. Customers include logistics operators, healthcare groups, SaaS businesses, and manufacturers managing payments across multiple currencies and entities.",
  },
  {
    category: "General",
    q: "How long does onboarding take?",
    a: "Most companies are fully live within five business days. Account verification usually completes within 24 hours, and a dedicated implementation manager handles data migration, user provisioning, and approval-policy setup with you.",
  },
  {
    category: "Pricing & Billing",
    q: "How does pricing work?",
    a: "Plans are priced per month with a platform fee plus usage-based payment fees. Annual billing reduces the platform fee by 20%. There are no setup fees and no minimum contract on the Growth plan — see the pricing page for a full comparison.",
  },
  {
    category: "Pricing & Billing",
    q: "Are there hidden FX margins?",
    a: "No. FX conversions are executed at mid-market rate plus a transparent, tier-based margin shown before you confirm every conversion. The exact margin for your plan appears on your quote and in the dashboard before each trade.",
  },
  {
    category: "Pricing & Billing",
    q: "Can I change plans later?",
    a: "Yes — upgrades take effect immediately and are prorated. Downgrades take effect at the start of the next billing cycle. Enterprise agreements are re-papered with your account team.",
  },
  {
    category: "Payments",
    q: "Which payment rails do you support?",
    a: "ACH and Fedwire in the US, SEPA and SEPA Instant in the EU, Faster Payments and CHAPS in the UK, and SWIFT for 140+ other corridors. The platform routes each payment to the cheapest rail that meets your deadline.",
  },
  {
    category: "Payments",
    q: "How fast do international payments settle?",
    a: "Same-day for most major corridors, and under 30 seconds where instant rails exist. Every payment includes live tracking with a settlement estimate, and webhooks fire on each status change.",
  },
  {
    category: "Payments",
    q: "What happens if a payment fails?",
    a: "Failed payments are automatically retried where the failure is transient, and funds are returned to your account otherwise — typically within one business day. You will see the failure reason in the dashboard and receive a webhook with a machine-readable code.",
  },
  {
    category: "Security & Compliance",
    q: "How is my money protected?",
    a: "Client funds are held in segregated accounts at regulated partner banks and are never used for operating purposes. The platform enforces dual-approval policies, role-based access, and hardware-key support for administrators. (Fictional demo copy.)",
  },
  {
    category: "Security & Compliance",
    q: "Which certifications do you hold?",
    a: "SOC 2 Type II and PCI DSS Level 1, with annual independent penetration tests. Data is encrypted in transit (TLS 1.3) and at rest (AES-256). Regional data residency is available on Enterprise plans. (Fictional demo copy.)",
  },
  {
    category: "Developers & API",
    q: "Is there a sandbox environment?",
    a: "Yes. Every workspace includes a full-fidelity sandbox with test rails, simulated settlement timing, and webhook replay. Sandbox keys are available the moment you sign up — no approval required.",
  },
  {
    category: "Developers & API",
    q: "How do webhooks work?",
    a: "Subscribe an HTTPS endpoint to any event family (payments, invoices, treasury, cards). Deliveries are signed with a per-endpoint secret, retried with exponential backoff for 72 hours, and fully replayable from the developer console.",
  },
  {
    category: "Developers & API",
    q: "Do you have official SDKs?",
    a: "TypeScript, Python, Go, and Java SDKs are generated from the OpenAPI spec on every release. The API is versioned by date; breaking changes are introduced only in new versions with a 12-month deprecation window.",
  },
];
