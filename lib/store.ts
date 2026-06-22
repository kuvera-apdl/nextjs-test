// Server-side in-memory data store. Seeded once per server process (survives
// HMR via globalThis); mutations persist until restart. Never import from
// client components — access it through the /api routes.

export type Transaction = {
  id: string;
  date: string;
  description: string;
  counterparty: string;
  category: string;
  account: string;
  amount: number; // negative = outflow
  currency: string;
  status: "settled" | "pending";
};

export type Invoice = {
  id: string;
  number: string;
  client: string;
  email: string;
  amount: number;
  currency: string;
  issuedAt: string;
  dueAt: string;
  status: "draft" | "sent" | "paid" | "overdue" | "void";
};

export type Payment = {
  id: string;
  beneficiary: string;
  bank: string;
  amount: number;
  currency: string;
  rail: "ACH" | "Wire" | "SEPA" | "SWIFT";
  reference: string;
  status: "processing" | "completed" | "failed" | "canceled";
  createdAt: string;
  fee: number;
};

export type Beneficiary = {
  id: string;
  name: string;
  bank: string;
  country: string;
  currency: string;
  last4: string;
};

export type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  posted: string;
  salary: string;
  description: string;
  requirements: string[];
};

export type PostBlock = {
  type: "p" | "h2" | "quote" | "ul";
  text?: string;
  items?: string[];
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  author: string;
  authorRole: string;
  date: string;
  readMinutes: number;
  likes: number;
  content: PostBlock[];
};

export type Service = {
  name: string;
  status: "operational" | "degraded" | "outage";
  uptime90: number[]; // oldest → newest, percent per day
};

export type Incident = {
  id: string;
  date: string;
  title: string;
  severity: "minor" | "major";
  status: "resolved" | "monitoring" | "investigating";
  updates: { at: string; text: string; status: string }[];
};

export type SessionUser = { email: string; name: string; org: string };

type Store = {
  transactions: Transaction[];
  invoices: Invoice[];
  payments: Payment[];
  beneficiaries: Beneficiary[];
  jobs: Job[];
  posts: Post[];
  services: Service[];
  incidents: Incident[];
  fxRates: Record<string, number>; // units per 1 USD
  accounts: { id: string; name: string; currency: string; balance: number }[];
  cashflow: { labels: string[]; inflow: number[]; outflow: number[] };
  balanceHistory: number[];
  users: { email: string; password: string; name: string; org: string }[];
  sessions: Map<string, SessionUser>;
  contactMessages: Record<string, unknown>[];
  demoRequests: Record<string, unknown>[];
  subscribers: string[];
  counters: { invoice: number; demo: number; contact: number };
};

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY = 86400000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();
const daysFromNow = (n: number) => new Date(Date.now() + n * DAY).toISOString();
const secondsAgo = (n: number) => new Date(Date.now() - n * 1000).toISOString();

export const uid = () => crypto.randomUUID();

/* ------------------------------ Transactions ----------------------------- */

function seedTransactions(): Transaction[] {
  const rand = mulberry32(1042);
  // [description, counterparty, category, account, currency, min, max, sign]
  const templates: [string, string, string, string, string, number, number, number][] = [
    ["Invoice settlement", "Halcyon Robotics", "Revenue", "Operating (USD)", "USD", 9000, 48000, 1],
    ["Payroll run", "Anchor Payroll", "Payroll", "Payroll (USD)", "USD", 38000, 62000, -1],
    ["Cloud infrastructure", "Northstack Cloud", "Infrastructure", "Operating (USD)", "USD", 4200, 9800, -1],
    ["Invoice settlement", "Nordwind Logistics", "Revenue", "EUR Operations", "EUR", 6000, 31000, 1],
    ["Freight services", "Atlas Freight", "Logistics", "Operating (USD)", "USD", 2800, 11500, -1],
    ["Card settlements payout", "Keelstone Acquiring", "Revenue", "Operating (USD)", "USD", 5200, 17400, 1],
    ["Office lease", "Foundry Workspaces", "Office", "Operating (USD)", "USD", 14200, 14200, -1],
    ["CRM subscription", "Relay CRM", "Software", "Operating (USD)", "USD", 1240, 1240, -1],
    ["Invoice settlement", "Lumen Health", "Revenue", "Operating (USD)", "USD", 7600, 36000, 1],
    ["Liability insurance", "Argonaut Insurance", "Insurance", "Operating (USD)", "USD", 3150, 3150, -1],
    ["Treasury yield", "Treasury Reserve", "Treasury", "Treasury Reserve", "USD", 5900, 8400, 1],
    ["FX conversion EUR→USD", "Keelstone FX", "FX", "EUR Operations", "EUR", 12000, 45000, -1],
    ["Design retainer", "Bright Harbor Studio", "Services", "Operating (USD)", "USD", 6500, 6500, -1],
    ["Quarterly tax payment", "Federal tax payment", "Tax", "Operating (USD)", "USD", 21000, 38000, -1],
    ["Invoice settlement", "Verdant Foods", "Revenue", "EUR Operations", "EUR", 4400, 22000, 1],
    ["Wire fees", "Keelstone Fees", "Fees", "Operating (USD)", "USD", 45, 220, -1],
  ];

  const out: Transaction[] = [];
  for (let i = 0; i < 44; i++) {
    const t = templates[(i * 7 + Math.floor(rand() * 3)) % templates.length];
    const [description, counterparty, category, account, currency, min, max, sign] = t;
    const amount = Math.round((min + rand() * (max - min)) * 100) / 100;
    out.push({
      id: `txn_${1000 + i}`,
      date: daysAgo(i * 0.62 + rand() * 0.4),
      description,
      counterparty,
      category,
      account,
      amount: amount * sign,
      currency,
      status: i < 2 ? "pending" : "settled",
    });
  }
  return out;
}

/* -------------------------------- Invoices ------------------------------- */

function seedInvoices(): Invoice[] {
  const rows: [string, string, number, string, number, Invoice["status"]][] = [
    // client, email, amount, currency, issued days ago, status
    ["Halcyon Robotics", "ap@halcyonrobotics.example", 48200, "USD", 4, "sent"],
    ["Nordwind Logistics", "finance@nordwind.example", 23150, "EUR", 7, "sent"],
    ["Cobalt Labs", "billing@cobaltlabs.example", 9800, "USD", 2, "draft"],
    ["Verdant Foods", "accounts@verdantfoods.example", 17640, "EUR", 11, "sent"],
    ["Lumen Health", "ap@lumenhealth.example", 36400, "USD", 18, "paid"],
    ["Atlas Freight", "payables@atlasfreight.example", 11280, "USD", 24, "paid"],
    ["Quill & Co", "finance@quillco.example", 5400, "GBP", 9, "draft"],
    ["Basalt Mining", "ap@basaltmining.example", 64100, "USD", 47, "overdue"],
    ["Ferro Systems", "keiri@ferrosystems.example", 2980000, "JPY", 39, "overdue"],
    ["Bright Harbor Studio", "hello@brightharbor.example", 6500, "USD", 31, "paid"],
    ["Halcyon Robotics", "ap@halcyonrobotics.example", 51000, "USD", 55, "paid"],
    ["Cobalt Labs", "billing@cobaltlabs.example", 12400, "USD", 21, "void"],
  ];
  return rows.map((r, i) => ({
    id: `inv_${200 + i}`,
    number: `INV-2026-${String(34 + i).padStart(3, "0")}`,
    client: r[0],
    email: r[1],
    amount: r[2],
    currency: r[3],
    issuedAt: daysAgo(r[4]),
    dueAt: daysFromNow(30 - r[4]),
    status: r[5],
  }));
}

/* -------------------------------- Payments ------------------------------- */

export const RAIL_FEES: Record<Payment["rail"], number> = {
  ACH: 0.5,
  SEPA: 0.4,
  Wire: 15,
  SWIFT: 25,
};

function seedPayments(): Payment[] {
  const rows: [string, string, number, string, Payment["rail"], Payment["status"], string][] = [
    ["Northstack Cloud Inc", "Pacific Union Bank", 8420.5, "USD", "ACH", "processing", secondsAgo(6)],
    ["Atlas Freight GmbH", "Hanseatic Landesbank", 11200, "EUR", "SEPA", "completed", daysAgo(1.2)],
    ["Quill & Co Ltd", "Albion Clearing", 5400, "GBP", "SWIFT", "completed", daysAgo(2.1)],
    ["Verdant Foods SARL", "Banque Lutece", 9150, "EUR", "SEPA", "completed", daysAgo(4.6)],
    ["Ferro Systems KK", "Sakura Trust", 1480000, "JPY", "SWIFT", "failed", daysAgo(5.3)],
    ["Bright Harbor Studio", "Commerce National", 6500, "USD", "ACH", "completed", daysAgo(7.8)],
    ["Anchor Payroll", "Commerce National", 52840, "USD", "Wire", "completed", daysAgo(9.1)],
    ["Foundry Workspaces", "Pacific Union Bank", 14200, "USD", "ACH", "canceled", daysAgo(11.4)],
  ];
  return rows.map((r, i) => ({
    id: `pay_${300 + i}`,
    beneficiary: r[0],
    bank: r[1],
    amount: r[2],
    currency: r[3],
    rail: r[4],
    reference: `PAY-2026-${String(118 + i).padStart(4, "0")}`,
    status: r[5],
    createdAt: r[6],
    fee: RAIL_FEES[r[4]],
  }));
}

const beneficiaries: Beneficiary[] = [
  { id: "ben_1", name: "Atlas Freight GmbH", bank: "Hanseatic Landesbank", country: "DE", currency: "EUR", last4: "4471" },
  { id: "ben_2", name: "Northstack Cloud Inc", bank: "Pacific Union Bank", country: "US", currency: "USD", last4: "9921" },
  { id: "ben_3", name: "Quill & Co Ltd", bank: "Albion Clearing", country: "GB", currency: "GBP", last4: "3318" },
  { id: "ben_4", name: "Verdant Foods SARL", bank: "Banque Lutece", country: "FR", currency: "EUR", last4: "7702" },
  { id: "ben_5", name: "Ferro Systems KK", bank: "Sakura Trust", country: "JP", currency: "JPY", last4: "1186" },
  { id: "ben_6", name: "Bright Harbor Studio", bank: "Commerce National", country: "US", currency: "USD", last4: "5540" },
];

/* ---------------------------------- Jobs --------------------------------- */

function seedJobs(): Job[] {
  const mk = (
    id: number,
    title: string,
    department: string,
    location: string,
    type: string,
    postedDays: number,
    salary: string,
    description: string,
    requirements: string[]
  ): Job => ({
    id: `job_${id}`,
    title,
    department,
    location,
    type,
    posted: daysAgo(postedDays),
    salary,
    description,
    requirements,
  });

  return [
    mk(1, "Senior Backend Engineer, Payments", "Engineering", "New York", "Full-time", 4, "$185K – $230K",
      "Own the orchestration layer that routes payments across ACH, SEPA, Faster Payments, and SWIFT. You will design idempotent payment state machines, improve settlement-time prediction, and keep our double-entry ledger honest at scale.",
      ["6+ years building distributed backend systems", "Production experience with payment rails or banking integrations", "Strong opinions about idempotency, retries, and exactly-once illusions", "Go or Kotlin in production"]),
    mk(2, "Staff Frontend Engineer", "Engineering", "Remote (US)", "Full-time", 9, "$200K – $245K",
      "Lead the architecture of the Keelstone dashboard — a data-dense financial workspace used daily by thousands of finance teams. You will set patterns for performance, accessibility, and real-time data across the product.",
      ["8+ years of frontend engineering, deep React expertise", "Experience with data-heavy enterprise UIs", "Track record of mentoring and design-system stewardship", "Care about p95 interaction latency"]),
    mk(3, "Product Designer, Treasury", "Design", "London", "Full-time", 12, "£95K – £120K",
      "Design the tools CFOs use to see around corners: cash forecasting, liquidity planning, and yield management. You will run discovery with finance leaders and ship polished, dense, trustworthy interfaces.",
      ["5+ years designing complex B2B products", "Portfolio showing data visualization craft", "Comfort working directly with customers", "Figma fluency; prototyping with real data a plus"]),
    mk(4, "Risk Analyst, Credit", "Risk & Compliance", "New York", "Full-time", 6, "$120K – $150K",
      "Build and monitor the credit models behind Keelstone Lending. You will analyze repayment performance, tune underwriting thresholds, and work with engineering to automate decisioning safely.",
      ["3+ years in credit risk, fintech lending preferred", "Strong SQL and Python", "Experience presenting risk posture to leadership", "Familiarity with SMB financial statements"]),
    mk(5, "Compliance Manager, EMEA", "Risk & Compliance", "London", "Full-time", 18, "£85K – £105K",
      "Own day-to-day compliance operations for our EMEA entities: transaction monitoring escalations, periodic reviews, and regulator-ready reporting. Partner with product to keep controls proportionate.",
      ["5+ years in financial-services compliance", "Working knowledge of EU AML directives and PSD2", "Experience with EMI or payment-institution licensing", "Calm under audit"]),
    mk(6, "Enterprise Account Executive", "Sales", "New York", "Full-time", 3, "$140K base + commission",
      "Bring Keelstone to companies moving $50M+ a year. You will run full-cycle sales with CFOs and VPs of Finance, supported by solutions engineering and a product that demos itself.",
      ["5+ years selling B2B SaaS or financial products to finance buyers", "History of $1M+ quotas, consistently exceeded", "Comfort with multi-stakeholder, security-reviewed deals", "Crisp written communication"]),
    mk(7, "Solutions Engineer", "Sales", "Remote (EU)", "Full-time", 15, "€90K – €115K",
      "Be the technical counterpart in enterprise deals: scope integrations, build proof-of-concepts against our API, and turn messy ERP exports into clean implementation plans.",
      ["3+ years in solutions or sales engineering", "Hands-on with REST APIs, webhooks, and at least one ERP", "Ability to read and write production-quality scripts", "Fluent English; second European language a plus"]),
    mk(8, "Data Engineer, Analytics Platform", "Engineering", "Remote (US)", "Full-time", 21, "$170K – $205K",
      "Build the pipelines that turn billions of ledger entries into the reporting CFOs trust. You will own ingestion, modeling, and the semantic layer powering in-product analytics.",
      ["4+ years of data engineering", "dbt, warehouse modeling, and orchestration experience", "Strong SQL performance instincts", "Bonus: exposure to financial reconciliation"]),
    mk(9, "Customer Success Manager, Mid-Market", "Operations", "Singapore", "Full-time", 26, "S$110K – S$140K",
      "Own a book of mid-market customers across APAC: onboarding, adoption, renewals, and being the voice of the customer in product planning.",
      ["4+ years in customer success or account management", "Experience with financial or accounting software", "Data-driven approach to adoption and health scoring", "Regional language skills a plus"]),
  ];
}

/* ---------------------------------- Posts -------------------------------- */

function seedPosts(): Post[] {
  const p = (text: string): PostBlock => ({ type: "p", text });
  const h2 = (text: string): PostBlock => ({ type: "h2", text });
  const quote = (text: string): PostBlock => ({ type: "quote", text });
  const ul = (...items: string[]): PostBlock => ({ type: "ul", items });

  return [
    {
      slug: "introducing-real-time-treasury",
      title: "Introducing Real-Time Treasury",
      excerpt:
        "Cash positions that update by the second, forecasts that learn from your actuals, and yield that switches on by default. Here's what we shipped and why.",
      tag: "Product",
      author: "Sofia Marin",
      authorRole: "Head of Product",
      date: daysAgo(5),
      readMinutes: 6,
      likes: 48,
      content: [
        p("For most finance teams, the cash position is a spreadsheet updated every Monday morning. By Wednesday it's wrong; by Friday it's fiction. Real-Time Treasury replaces that ritual with a position that updates the moment money moves on any connected account."),
        h2("What's new"),
        ul(
          "Live consolidated cash across every account and currency, refreshed continuously",
          "13-week forecasts that recalibrate nightly against your actuals",
          "Automated sweeps into yield with rules you set once",
          "Runway and burn metrics computed from real flows, not estimates"
        ),
        p("Under the hood, every balance change flows through our ledger within seconds of confirmation from the underlying rail. Forecasts are built per-counterparty: the system learns that one client pays on day 34 of 30-day terms and another pays early, and projects accordingly."),
        h2("Why it matters"),
        p("Treasury decisions are timing decisions. When you know your true position today — not last Monday's — you can hold less idle buffer, put more to work, and stop discovering surprises in the month-end close."),
        quote("We cut our idle cash buffer by 40% in the first month. The forecast was the unlock — we finally trusted it. — VP Finance, Halcyon Robotics"),
        p("Real-Time Treasury is rolling out to all Scale and Enterprise plans this month, with Growth following in Q3. Your account team can switch it on from the treasury settings page — no migration required."),
      ],
    },
    {
      slug: "halcyon-robotics-cut-payment-costs",
      title: "How Halcyon Robotics cut payment costs by 34%",
      excerpt:
        "A robotics scale-up was paying suppliers in nine currencies through three banks. Here's how consolidating on Keelstone changed their unit economics.",
      tag: "Customers",
      author: "Priya Raghavan",
      authorRole: "Head of Treasury Solutions",
      date: daysAgo(12),
      readMinutes: 5,
      likes: 31,
      content: [
        p("Halcyon Robotics builds warehouse automation hardware. Their supply chain spans Germany, Japan, and Taiwan; their customers pay in dollars, euros, and pounds. By the time a part was paid for, the money had often crossed two banks and lost basis points at every hop."),
        h2("The before picture"),
        ul(
          "Three banking relationships, each with its own portal and fee schedule",
          "Wire fees averaging $32 per international supplier payment",
          "FX margins of 1.1–1.8% applied invisibly at conversion",
          "Two days a week of treasury time spent moving money between banks"
        ),
        p("None of this was anyone's fault. It's the default state of a company that grew fast and added banking relationships as it went."),
        h2("What changed"),
        p("Halcyon moved supplier payments onto Keelstone rails-based routing. Payments to Germany go out as SEPA transfers for under a euro. Japanese suppliers are paid from a yen balance funded at mid-market rates in scheduled batches. The system picks the rail; the policy engine enforces approvals."),
        quote("The surprise wasn't the fee savings — it was getting our Tuesdays back. — Director of Finance, Halcyon Robotics"),
        p("Across the first two quarters, total payment costs fell 34%: roughly half from rail selection, half from FX margin compression. Treasury workload dropped by about eight hours a week — capacity the team reinvested in actually forecasting."),
      ],
    },
    {
      slug: "cfo-guide-cash-flow-forecasting",
      title: "A CFO's guide to cash-flow forecasting that doesn't lie",
      excerpt:
        "Most forecasts fail the same three ways. A practical framework for building one your board can actually use.",
      tag: "Treasury",
      author: "Priya Raghavan",
      authorRole: "Head of Treasury Solutions",
      date: daysAgo(21),
      readMinutes: 8,
      likes: 67,
      content: [
        p("Every CFO has lived this: the forecast said comfortable; the bank balance said otherwise. The model wasn't wrong because the math was hard — it was wrong because of three predictable failure modes."),
        h2("Failure mode 1: receivables optimism"),
        p("Invoices don't pay on their due date. They pay on the date each specific customer habitually pays. A forecast that uses contractual terms instead of observed behavior will be systematically early, and the error compounds with growth."),
        h2("Failure mode 2: invisible commitments"),
        p("Signed contracts, annual renewals, tax installments, bonus accruals — cash that is committed but not yet in the AP ledger. If your forecast only sees bills, it cannot see next quarter."),
        h2("Failure mode 3: stale by design"),
        p("A forecast built in a spreadsheet decays from the moment it's saved. The fix is structural, not behavioral: forecasts must rebuild themselves from live actuals, because no team reliably maintains them by hand."),
        h2("A framework that holds up"),
        ul(
          "Forecast receivables from observed payer behavior, per counterparty",
          "Maintain a commitments register that feeds the model directly",
          "Rebuild nightly from actuals; track forecast-vs-actual error weekly",
          "Hold scenario branches (base, stretch, stress) in the same model, not three files"
        ),
        p("Teams that adopt this structure typically see forecast error fall under 5% at the 4-week horizon within a quarter. The goal isn't a perfect number — it's a number whose error you know and trust."),
      ],
    },
    {
      slug: "scaling-our-ledger-to-one-billion-entries",
      title: "Scaling our ledger to one billion entries",
      excerpt:
        "Double-entry at scale is a database problem, a correctness problem, and occasionally a philosophy problem. Notes from three years of running ours.",
      tag: "Engineering",
      author: "Tomás Ferreira",
      authorRole: "CTO",
      date: daysAgo(33),
      readMinutes: 9,
      likes: 112,
      content: [
        p("Every balance Keelstone shows is derived from an append-only, double-entry ledger. Nothing updates in place; money never moves without an equal and opposite entry. This year the ledger crossed one billion entries, which feels like a reasonable moment to write down what held up and what we rebuilt."),
        h2("What held up"),
        ul(
          "Append-only writes: immutability turned a class of bugs into impossibilities",
          "Idempotency keys on every external event, no exceptions",
          "Entries as the source of truth, balances as a derived cache",
          "Hourly invariant sweeps: every account, every currency, sums to zero"
        ),
        h2("What we rebuilt"),
        p("Balance reads. At low volume you can sum entries on demand. At a billion entries you maintain materialized balances per account per currency, updated transactionally with each entry batch — and you treat any drift between the two as a sev-1, because it means the cache lied."),
        p("We also moved invariant checking from sampled to exhaustive. Sampling catches systemic bugs; it misses the one corrupted account that becomes a support ticket, then an audit finding. Exhaustive sweeps are expensive and worth it."),
        quote("A ledger is a data structure that converts trust into arithmetic."),
        p("The philosophy part: when product wants a feature that's awkward to express as balanced entries — instant refunds, provisional credit — the answer is never to bend the ledger. It's to model the awkwardness explicitly: a provisional-credit account is still an account. The books balance, or the feature waits."),
      ],
    },
    {
      slug: "soc2-pci-what-they-mean-for-you",
      title: "SOC 2, PCI DSS, ISO 27001: what they actually mean for you",
      excerpt:
        "Compliance acronyms are easy to list and hard to interpret. Here's what each certification does — and does not — tell you about a financial platform.",
      tag: "Compliance",
      author: "Jonah Weiss",
      authorRole: "Compliance Lead",
      date: daysAgo(44),
      readMinutes: 7,
      likes: 25,
      content: [
        p("Every vendor security page lists the same acronyms. As the person who answers your security questionnaires, let me explain what each one actually attests — so you can ask sharper questions of every vendor, including us."),
        h2("SOC 2 Type II"),
        p("An independent auditor observed our controls operating over a months-long window — not just that policies exist, but that they ran. The useful question to ask any vendor: which trust-service criteria are in scope, and were there exceptions? (Ask us; we'll show you the report under NDA.)"),
        h2("PCI DSS Level 1"),
        p("This one is specifically about card data: how it's stored, transmitted, and who can touch it. Level 1 is the strictest tier, with an annual on-site assessment. If a vendor issues or processes cards and can't name their PCI level, that's your answer."),
        h2("ISO 27001"),
        p("A certified information-security management system: risk assessment, treatment, and continuous improvement as an operating loop. It tells you security is managed, not improvised. It does not, by itself, tell you the controls are strong — pair it with the SOC 2 report."),
        ul(
          "Ask for the report, not the badge",
          "Check the audit window is recent and continuous",
          "Match certifications to the data you'll actually share",
          "Treat exceptions as conversation starters, not disqualifiers"
        ),
        p("Certifications are floors, not ceilings. They tell you a platform takes the baseline seriously — the differentiation is in everything built above it. (Reminder: Keelstone is a fictional demo, and so are these attestations.)"),
      ],
    },
    {
      slug: "multi-currency-accounts-explained",
      title: "Multi-currency accounts, explained properly",
      excerpt:
        "Holding eight currencies shouldn't require eight bank accounts. How multi-currency balances work, where the money actually sits, and when conversion should happen.",
      tag: "Product",
      author: "Sofia Marin",
      authorRole: "Head of Product",
      date: daysAgo(58),
      readMinutes: 6,
      likes: 39,
      content: [
        p("If your company earns euros and spends dollars, every conversion is a small tax and a timing bet. Multi-currency accounts exist to let you choose when to pay that tax — instead of paying it automatically, at a bad rate, on every transaction."),
        h2("Where the money actually is"),
        p("Each currency balance is backed by funds held with regulated banking partners in that currency's home clearing system: euros in SEPA-reachable accounts, pounds with Faster Payments access, yen with a Japanese trust bank. Your dashboard shows one account; the plumbing spans several."),
        h2("When to convert"),
        ul(
          "Natural hedging first: pay euro suppliers from euro revenue, convert nothing",
          "Scheduled conversion for predictable shortfalls, at mid-market plus a disclosed margin",
          "Rate alerts for opportunistic conversion when timing is flexible",
          "Never let conversion happen as a side effect of a payment"
        ),
        p("That last rule is the one banks quietly violate: a dollar payment from a euro balance triggers a conversion at whatever margin applies. On Keelstone, cross-currency payments quote the conversion explicitly before you approve — the margin is on the screen, not in the spread."),
        p("The result is boring in the best way: FX stops being a recurring surprise in the P&L and becomes a line item you decided on purpose."),
      ],
    },
    {
      slug: "why-we-built-rail-orchestration",
      title: "Why we built our own payment-rail orchestration",
      excerpt:
        "Every payment has a dozen ways to fail and three ways to travel. The routing layer that picks well is the most boring, most valuable code we own.",
      tag: "Engineering",
      author: "Tomás Ferreira",
      authorRole: "CTO",
      date: daysAgo(72),
      readMinutes: 7,
      likes: 84,
      content: [
        p("When you send a payment on Keelstone, you don't pick ACH or wire or SEPA — you state an amount, a beneficiary, and optionally a deadline. The orchestration layer picks the rail. This post is about why that layer exists and what it took to make it trustworthy."),
        h2("The problem with picking rails by hand"),
        p("Humans pick rails by habit. The habit is usually 'wire', because wires feel safe — and cost twenty times more than the ACH transfer that would have arrived in time. Multiply by a thousand payments a month and habit becomes a budget line."),
        h2("What the router considers"),
        ul(
          "Deadline vs. live settlement-time estimates per rail, per corridor",
          "Total cost: fees plus FX margin where conversion is involved",
          "Cut-off times, holidays, and each rail's real-world reliability today",
          "Your policies: approval thresholds, allowed rails, beneficiary risk tier"
        ),
        p("The hard part isn't the decision tree — it's the feedback loop. The router's estimates are recalibrated continuously from observed settlement times across the network. When SEPA Instant has a bad afternoon, the router knows before the status page does."),
        quote("The best payment infrastructure is indistinguishable from nothing happening."),
        p("Failure handling is where orchestration earns its keep: a rejected payment is re-validated, re-routed where safe, or surfaced with a human-readable reason and a machine-readable code. The goal is that retries are the system's job, not your team's morning."),
      ],
    },
  ];
}

/* --------------------------------- Status -------------------------------- */

function seedServices(): Service[] {
  const rand = mulberry32(7);
  const mk = (name: string, status: Service["status"], dipDays: number[] = []): Service => {
    const uptime90: number[] = [];
    for (let d = 0; d < 90; d++) {
      if (dipDays.includes(d)) {
        uptime90.push(Math.round((95 + rand() * 3) * 100) / 100);
      } else if (rand() < 0.05) {
        uptime90.push(Math.round((99.2 + rand() * 0.7) * 100) / 100);
      } else {
        uptime90.push(100);
      }
    }
    return { name, status, uptime90 };
  };
  return [
    mk("API", "operational", [62]),
    mk("Dashboard", "operational"),
    mk("Payment processing — ACH & domestic", "operational", [33]),
    mk("Payment processing — SWIFT & cross-border", "operational"),
    mk("FX engine", "operational", [62]),
    mk("Webhooks", "degraded", [88, 89]),
    mk("Card issuing", "operational"),
  ];
}

function seedIncidents(): Incident[] {
  return [
    {
      id: "inc_4",
      date: daysAgo(0.12),
      title: "Delayed webhook deliveries for a subset of endpoints",
      severity: "minor",
      status: "monitoring",
      updates: [
        { at: daysAgo(0.12), text: "We are investigating elevated webhook delivery latency affecting roughly 8% of endpoints. Payments themselves are unaffected.", status: "investigating" },
        { at: daysAgo(0.05), text: "A stuck consumer group was identified and restarted. Backlogged deliveries are draining; we are monitoring until queues return to baseline.", status: "monitoring" },
      ],
    },
    {
      id: "inc_3",
      date: daysAgo(2),
      title: "Elevated error rates on FX quotes",
      severity: "minor",
      status: "resolved",
      updates: [
        { at: daysAgo(2.02), text: "FX quote requests are intermittently failing for some currency pairs. Existing quotes and conversions are unaffected.", status: "investigating" },
        { at: daysAgo(1.98), text: "A rate-provider failover misconfiguration was corrected. Error rates returned to baseline. We will publish a post-incident review.", status: "resolved" },
      ],
    },
    {
      id: "inc_2",
      date: daysAgo(28),
      title: "ACH submission delays during provider maintenance",
      severity: "major",
      status: "resolved",
      updates: [
        { at: daysAgo(28.1), text: "Our ACH banking partner began emergency maintenance. New ACH submissions are queued and will be submitted when the window closes.", status: "investigating" },
        { at: daysAgo(27.9), text: "The maintenance window closed and all queued batches were submitted within SLA. Same-day ACH cut-offs were met for all queued payments.", status: "resolved" },
      ],
    },
    {
      id: "inc_1",
      date: daysAgo(57),
      title: "Dashboard login failures for SSO users",
      severity: "minor",
      status: "resolved",
      updates: [
        { at: daysAgo(57.05), text: "SSO-initiated logins are failing with a redirect loop. Email/password and API access are unaffected.", status: "investigating" },
        { at: daysAgo(56.95), text: "A certificate rotation on the identity provider integration was completed and logins recovered. Affected sessions: ~3% of daily logins.", status: "resolved" },
      ],
    },
  ];
}

/* ----------------------------------- FX ---------------------------------- */

const fxRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 155.2,
  CHF: 0.88,
  CAD: 1.36,
  AUD: 1.52,
  SGD: 1.34,
  HKD: 7.81,
  SEK: 10.42,
  PLN: 3.92,
  MXN: 17.08,
};

/* ------------------------------- Dashboard ------------------------------- */

function seedCashflow() {
  const rand = mulberry32(99);
  const labels: string[] = [];
  const inflow: number[] = [];
  const outflow: number[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleDateString("en-US", { month: "short" }));
    const base = 380000 + (11 - i) * 14000;
    inflow.push(Math.round(base * (0.85 + rand() * 0.4)));
    outflow.push(Math.round(base * (0.7 + rand() * 0.35)));
  }
  return { labels, inflow, outflow };
}

function seedBalanceHistory(): number[] {
  const rand = mulberry32(123);
  const out: number[] = [];
  let v = 7900000;
  for (let i = 0; i < 30; i++) {
    v += (rand() - 0.42) * 120000;
    out.push(Math.round(v));
  }
  return out;
}

/* ---------------------------------- Store -------------------------------- */

function seedStore(): Store {
  return {
    transactions: seedTransactions(),
    invoices: seedInvoices(),
    payments: seedPayments(),
    beneficiaries,
    jobs: seedJobs(),
    posts: seedPosts(),
    services: seedServices(),
    incidents: seedIncidents(),
    fxRates,
    accounts: [
      { id: "acc_1", name: "Operating (USD)", currency: "USD", balance: 2840512.4 },
      { id: "acc_2", name: "Payroll (USD)", currency: "USD", balance: 412090.0 },
      { id: "acc_3", name: "EUR Operations", currency: "EUR", balance: 1186300.55 },
      { id: "acc_4", name: "Treasury Reserve", currency: "USD", balance: 5000000.0 },
    ],
    cashflow: seedCashflow(),
    balanceHistory: seedBalanceHistory(),
    users: [
      {
        email: "demo@keelstone.example",
        password: "northstar",
        name: "Dana Okafor",
        org: "Halcyon Robotics Ltd",
      },
    ],
    sessions: new Map(),
    contactMessages: [],
    demoRequests: [],
    subscribers: [],
    counters: { invoice: 46, demo: 1041, contact: 311 },
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __keelstoneStore: Store | undefined;
}

export function getStore(): Store {
  if (!globalThis.__keelstoneStore) {
    globalThis.__keelstoneStore = seedStore();
  }
  return globalThis.__keelstoneStore;
}
