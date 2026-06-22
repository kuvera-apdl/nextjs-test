"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, Button, Card, Spinner, Toggle } from "@/components/ui";
import {
  IconAlert,
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconCopy,
  IconGlobe,
  IconLock,
  IconSend,
  IconServer,
  IconSparkles,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { CodeBlock, type Snippet } from "./code-block";

/* ----------------------------- Snippets ----------------------------- */

const authSnippets: Snippet[] = [
  {
    lang: "curl",
    label: "cURL",
    code: `curl https://api.keelstone.example/v1/me \\
  -H "Authorization: Bearer mk_sandbox_4q9zr31kp7v2m8c5x0jw6t1d" \\
  -H "Keelstone-Version: 2026-05-01"`,
  },
  {
    lang: "node",
    label: "Node",
    code: `import { Keelstone } from "@keelstone/sdk";

const keelstone = new Keelstone({
  apiKey: process.env.KEELSTONE_API_KEY, // mk_sandbox_... or mk_live_...
});

const me = await keelstone.identity.retrieve();
console.log(me.org.name, me.mode); // "Acme Logistics" "sandbox"`,
  },
  {
    lang: "python",
    label: "Python",
    code: `import os
from keelstone import Keelstone

client = Keelstone(api_key=os.environ["KEELSTONE_API_KEY"])

me = client.identity.retrieve()
print(me.org.name, me.mode)  # Acme Logistics sandbox`,
  },
];

const paymentsSnippets: Snippet[] = [
  {
    lang: "curl",
    label: "cURL",
    code: `curl -X POST https://api.keelstone.example/v1/payments \\
  -H "Authorization: Bearer $KEELSTONE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: ord-84312-payout" \\
  -d '{
    "amount": 125000,
    "currency": "EUR",
    "beneficiary": "ben_8f2k1x",
    "rail": "sepa_instant",
    "reference": "Invoice INV-2041"
  }'`,
  },
  {
    lang: "node",
    label: "Node",
    code: `const payment = await keelstone.payments.create(
  {
    amount: 125000, // minor units (EUR 1,250.00)
    currency: "EUR",
    beneficiary: "ben_8f2k1x",
    rail: "sepa_instant",
    reference: "Invoice INV-2041",
  },
  { idempotencyKey: "ord-84312-payout" }
);

console.log(payment.id, payment.status); // "pay_01j8w2" "processing"`,
  },
  {
    lang: "python",
    label: "Python",
    code: `payment = client.payments.create(
    amount=125000,  # minor units (EUR 1,250.00)
    currency="EUR",
    beneficiary="ben_8f2k1x",
    rail="sepa_instant",
    reference="Invoice INV-2041",
    idempotency_key="ord-84312-payout",
)

print(payment.id, payment.status)  # pay_01j8w2 processing`,
  },
];

const treasurySnippets: Snippet[] = [
  {
    lang: "curl",
    label: "cURL",
    code: `curl "https://api.keelstone.example/v1/balances?currencies=USD,EUR,GBP" \\
  -H "Authorization: Bearer $KEELSTONE_API_KEY"`,
  },
  {
    lang: "node",
    label: "Node",
    code: `const balances = await keelstone.treasury.balances.list({
  currencies: ["USD", "EUR", "GBP"],
});

for (const b of balances.data) {
  console.log(b.currency, b.available, b.pending);
}
// USD 4821933020 12400000
// EUR 1093822110 0
// GBP 240118702 8211050`,
  },
  {
    lang: "python",
    label: "Python",
    code: `balances = client.treasury.balances.list(
    currencies=["USD", "EUR", "GBP"],
)

for b in balances:
    print(b.currency, b.available, b.pending)`,
  },
];

const webhookSnippets: Snippet[] = [
  {
    lang: "curl",
    label: "cURL",
    code: `# Register an HTTPS endpoint for the events you care about
curl -X POST https://api.keelstone.example/v1/webhook_endpoints \\
  -H "Authorization: Bearer $KEELSTONE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/hooks/keelstone",
    "events": ["payment.completed", "payment.failed"]
  }'`,
  },
  {
    lang: "node",
    label: "Node",
    code: `import crypto from "node:crypto";

export function verifyWebhook(rawBody, signatureHeader) {
  // rawBody must be the exact request bytes, before JSON parsing
  const expected = crypto
    .createHmac("sha256", process.env.KEELSTONE_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader, "hex"),
    Buffer.from(expected, "hex")
  );
}`,
  },
  {
    lang: "python",
    label: "Python",
    code: `import hashlib
import hmac
import os

def verify_webhook(raw_body: bytes, signature_header: str) -> bool:
    # raw_body must be the exact request bytes, before JSON parsing
    expected = hmac.new(
        os.environ["KEELSTONE_WEBHOOK_SECRET"].encode(),
        raw_body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature_header)`,
  },
];

const errorSnippets: Snippet[] = [
  {
    lang: "curl",
    label: "cURL",
    code: `curl -i https://api.keelstone.example/v1/payments/pay_unknown \\
  -H "Authorization: Bearer $KEELSTONE_API_KEY"

# HTTP/2 404
# {
#   "error": {
#     "type": "resource_missing",
#     "code": "payment_not_found",
#     "message": "No payment found with id pay_unknown.",
#     "request_id": "req_7fk2m1qx"
#   }
# }`,
  },
  {
    lang: "node",
    label: "Node",
    code: `import { Keelstone, APIError } from "@keelstone/sdk";

try {
  await keelstone.payments.retrieve("pay_unknown");
} catch (err) {
  if (err instanceof APIError) {
    console.error(err.status, err.code, err.requestId);
    // 404 "payment_not_found" "req_7fk2m1qx"
    // Quote err.requestId when contacting support.
  }
}`,
  },
  {
    lang: "python",
    label: "Python",
    code: `from keelstone import APIError

try:
    client.payments.retrieve("pay_unknown")
except APIError as err:
    print(err.status, err.code, err.request_id)
    # 404 payment_not_found req_7fk2m1qx
    # Quote err.request_id when contacting support.`,
  },
];

/* ----------------------------- Page data ----------------------------- */

const navGroups = [
  {
    label: "API reference",
    items: [
      { id: "authentication", label: "Authentication" },
      { id: "payments", label: "Payments" },
      { id: "treasury", label: "Treasury" },
      { id: "webhooks", label: "Webhooks" },
      { id: "errors", label: "Errors" },
    ],
  },
  {
    label: "Interactive",
    items: [
      { id: "sandbox-keys", label: "Sandbox keys" },
      { id: "try-it", label: "Try it live" },
      { id: "webhook-events", label: "Webhook events" },
    ],
  },
];

const webhookEvents = [
  {
    name: "payment.completed",
    desc: "A payment settled on the destination rail.",
  },
  {
    name: "payment.failed",
    desc: "A payment was rejected; payload includes a machine-readable failure code.",
  },
  {
    name: "payment.returned",
    desc: "Funds came back after settlement, for example a closed beneficiary account.",
  },
  {
    name: "invoice.paid",
    desc: "An issued invoice was reconciled against an incoming payment.",
  },
  {
    name: "invoice.overdue",
    desc: "An invoice passed its due date without full payment.",
  },
  {
    name: "treasury.sweep.executed",
    desc: "An automated sweep moved idle balance according to your treasury policy.",
  },
  {
    name: "card.authorization.created",
    desc: "A corporate card authorization is pending; respond within two seconds to approve or decline.",
  },
  {
    name: "payout.batch.settled",
    desc: "Every payment in a batch reached a terminal state.",
  },
];

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-800">
      {children}
    </code>
  );
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/* -------------------------------- Page -------------------------------- */

export default function DevelopersPage() {
  const [activeSection, setActiveSection] = useState("authentication");

  /* Try-it panel */
  const [pingLoading, setPingLoading] = useState(false);
  const [pingError, setPingError] = useState(false);
  const [pingResult, setPingResult] = useState<{
    status: number;
    body: unknown;
    latencyMs: number;
  } | null>(null);

  /* Sandbox key generator */
  const [sandboxKey, setSandboxKey] = useState<string | null>(null);
  const [revealKey, setRevealKey] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const keyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Webhook subscriptions (purely local) */
  const [subscribed, setSubscribed] = useState<Record<string, boolean>>({
    "payment.completed": true,
    "payment.failed": true,
  });

  useEffect(() => {
    document.title = "Developers — Keelstone Financial";
  }, []);

  useEffect(() => {
    return () => {
      if (keyTimer.current) clearTimeout(keyTimer.current);
    };
  }, []);

  /* Highlight the section in view */
  useEffect(() => {
    const ids = navGroups.flatMap((g) => g.items.map((i) => i.id));
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-120px 0px -60% 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function sendPing() {
    setPingLoading(true);
    setPingError(false);
    const started = performance.now();
    fetch("/api/v1/ping")
      .then(async (res) => {
        const body = (await res.json()) as { latencyMs?: number };
        const latencyMs =
          typeof body.latencyMs === "number"
            ? body.latencyMs
            : Math.round(performance.now() - started);
        setPingResult({ status: res.status, body, latencyMs });
        setPingLoading(false);
      })
      .catch(() => {
        setPingError(true);
        setPingResult(null);
        setPingLoading(false);
      });
  }

  function generateKey() {
    let suffix = "";
    for (let i = 0; i < 24; i++) {
      suffix += Math.floor(Math.random() * 36).toString(36);
    }
    setSandboxKey(`mk_sandbox_${suffix}`);
    setRevealKey(false);
    setKeyCopied(false);
  }

  function copyKey() {
    if (!sandboxKey) return;
    navigator.clipboard
      .writeText(sandboxKey)
      .then(() => {
        setKeyCopied(true);
        if (keyTimer.current) clearTimeout(keyTimer.current);
        keyTimer.current = setTimeout(() => setKeyCopied(false), 2000);
      })
      .catch(() => {
        /* clipboard unavailable — ignore */
      });
  }

  const maskedKey = sandboxKey
    ? `${sandboxKey.slice(0, 11)}${"•".repeat(20)}${sandboxKey.slice(-4)}`
    : "";

  return (
    <div className="bg-white">
      {/* ------------------------------ Hero ------------------------------ */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          aria-hidden="true"
          className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
              Developer portal
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Build on Keelstone
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-300">
              One REST API for accounts, payments, FX, and cards. Requests are
              idempotent by default, webhooks are signed, and the sandbox mirrors
              production behavior down to settlement timing — so the first payment
              you ship behaves like the millionth.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge tone="emerald">REST</Badge>
              <Badge tone="emerald">Webhooks</Badge>
              <Badge tone="emerald">Sandbox-first</Badge>
              <Badge tone="emerald">4 SDKs</Badge>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="white" onClick={() => scrollToSection("sandbox-keys")}>
                Generate a sandbox key
                <IconArrowRight className="h-4 w-4" />
              </Button>
              <Button onClick={() => scrollToSection("authentication")}>
                Explore the API
              </Button>
            </div>
            <p className="mt-8 font-mono text-sm text-slate-400">
              <span className="select-none text-emerald-400">$ </span>
              curl https://api.keelstone.example/v1/ping
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------ Body ------------------------------ */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <nav aria-label="API sections" className="sticky top-24 space-y-8">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {group.label}
                    </p>
                    <ul className="mt-3 space-y-1 border-l border-slate-200">
                      {group.items.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => scrollToSection(item.id)}
                            className={cn(
                              "-ml-px block w-full cursor-pointer border-l-2 py-1 pl-4 text-left text-sm transition-colors",
                              activeSection === item.id
                                ? "border-emerald-600 font-medium text-emerald-700"
                                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
                            )}
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="space-y-20">
              {/* ------------------------ Authentication ------------------------ */}
              <section id="authentication" className="scroll-mt-24">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-emerald-50 p-2">
                    <IconLock className="h-5 w-5 text-emerald-600" />
                  </span>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Authentication
                  </h2>
                </div>
                <p className="mt-4 leading-relaxed text-slate-600">
                  Every request is authenticated with a bearer key in the{" "}
                  <InlineCode>Authorization</InlineCode> header. Keys are scoped per
                  environment: <InlineCode>mk_sandbox_</InlineCode> keys can never move
                  real money, and <InlineCode>mk_live_</InlineCode> keys require an
                  approved workspace. Pin a release with the{" "}
                  <InlineCode>Keelstone-Version</InlineCode> header — breaking changes
                  only ship in new dated versions.
                </p>
                <CodeBlock
                  className="mt-6"
                  title="GET /v1/me"
                  snippets={authSnippets}
                />
              </section>

              {/* ------------------------- Sandbox keys ------------------------- */}
              <section id="sandbox-keys" className="scroll-mt-24">
                <Card className="bg-slate-50/60">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-emerald-50 p-2">
                      <IconSparkles className="h-5 w-5 text-emerald-600" />
                    </span>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                      Sandbox key generator
                    </h2>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Mint a key shaped exactly like the real thing and use it while you
                    read along. Keys generated here are decorative — demo only, never
                    stored, and not valid against any API.
                  </p>
                  <div className="mt-5">
                    <Button onClick={generateKey}>
                      <IconBolt className="h-4 w-4" />
                      {sandboxKey ? "Regenerate sandbox key" : "Generate sandbox key"}
                    </Button>
                  </div>
                  {sandboxKey && (
                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-950 px-4 py-3">
                        <code className="truncate font-mono text-sm text-emerald-300">
                          {revealKey ? sandboxKey : maskedKey}
                        </code>
                        <button
                          onClick={copyKey}
                          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:text-white"
                        >
                          {keyCopied ? (
                            <>
                              <IconCheck className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <IconCopy className="h-3.5 w-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <Toggle
                        checked={revealKey}
                        onChange={setRevealKey}
                        label="Reveal full key"
                      />
                    </div>
                  )}
                </Card>
              </section>

              {/* --------------------------- Payments --------------------------- */}
              <section id="payments" className="scroll-mt-24">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-emerald-50 p-2">
                    <IconSend className="h-5 w-5 text-emerald-600" />
                  </span>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Payments
                  </h2>
                </div>
                <p className="mt-4 leading-relaxed text-slate-600">
                  Create a payment with <InlineCode>POST /v1/payments</InlineCode>.
                  Amounts are integers in minor units, and the platform picks the
                  cheapest rail that meets your deadline unless you pin one. Send an{" "}
                  <InlineCode>Idempotency-Key</InlineCode> with every create call —
                  retries with the same key return the original payment instead of
                  paying twice.
                </p>
                <CodeBlock
                  className="mt-6"
                  title="POST /v1/payments"
                  snippets={paymentsSnippets}
                />
              </section>

              {/* --------------------------- Treasury --------------------------- */}
              <section id="treasury" className="scroll-mt-24">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-emerald-50 p-2">
                    <IconGlobe className="h-5 w-5 text-emerald-600" />
                  </span>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Treasury
                  </h2>
                </div>
                <p className="mt-4 leading-relaxed text-slate-600">
                  Read balances across every currency account with{" "}
                  <InlineCode>GET /v1/balances</InlineCode>. Each balance splits into{" "}
                  <InlineCode>available</InlineCode> and{" "}
                  <InlineCode>pending</InlineCode>, both in minor units, so your
                  reconciliation never sees a float. Sweeps, yield allocations, and FX
                  conversions live under the same <InlineCode>/v1/treasury</InlineCode>{" "}
                  namespace.
                </p>
                <CodeBlock
                  className="mt-6"
                  title="GET /v1/balances"
                  snippets={treasurySnippets}
                />
              </section>

              {/* --------------------------- Try it live --------------------------- */}
              <section id="try-it" className="scroll-mt-24">
                <Card className="bg-slate-50/60">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl bg-emerald-50 p-2">
                        <IconServer className="h-5 w-5 text-emerald-600" />
                      </span>
                      <div>
                        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                          Try it live
                        </h2>
                        <p className="mt-0.5 font-mono text-xs text-slate-500">
                          GET /api/v1/ping
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={sendPing}
                      disabled={pingLoading}
                    >
                      {pingLoading ? (
                        <>
                          <Spinner />
                          Sending…
                        </>
                      ) : (
                        <>
                          <IconSend className="h-4 w-4" />
                          Send request
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    This one is real: the button calls the demo API served by this
                    site and prints the raw response below.
                  </p>
                  <div className="mt-5">
                    {pingError ? (
                      <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        <IconAlert className="h-4 w-4 shrink-0" />
                        The request failed. Check your connection and try again.
                      </div>
                    ) : pingResult ? (
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            tone={pingResult.status === 200 ? "emerald" : "amber"}
                            dot
                          >
                            {pingResult.status === 200
                              ? "200 OK"
                              : `${pingResult.status}`}
                          </Badge>
                          <Badge tone="slate">{pingResult.latencyMs} ms</Badge>
                        </div>
                        <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950 px-4 py-4 font-mono text-[13px] leading-relaxed text-emerald-200">
                          {JSON.stringify(pingResult.body, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                        Send the request to see a live JSON response here.
                      </div>
                    )}
                  </div>
                </Card>
              </section>

              {/* --------------------------- Webhooks --------------------------- */}
              <section id="webhooks" className="scroll-mt-24">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-emerald-50 p-2">
                    <IconBolt className="h-5 w-5 text-emerald-600" />
                  </span>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Webhooks
                  </h2>
                </div>
                <p className="mt-4 leading-relaxed text-slate-600">
                  Subscribe an HTTPS endpoint to any event family and Keelstone pushes
                  state changes to you. Every delivery carries a{" "}
                  <InlineCode>Keelstone-Signature</InlineCode> header — an HMAC-SHA256
                  of the raw body with your per-endpoint secret. Verify it before
                  trusting the payload, and always compare with a timing-safe
                  function. Failed deliveries retry with exponential backoff for 72
                  hours.
                </p>
                <CodeBlock
                  className="mt-6"
                  title="Verify a webhook signature"
                  snippets={webhookSnippets}
                />
              </section>

              {/* ------------------------ Webhook events ------------------------ */}
              <section id="webhook-events" className="scroll-mt-24">
                <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                  Event catalog
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Flip the toggles to sketch a subscription set — this table is a
                  local simulation, nothing is saved.
                </p>
                <Card className="mt-5 overflow-x-auto p-0">
                  <table className="w-full min-w-[40rem] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                        <th className="px-5 py-3 font-medium">Event</th>
                        <th className="px-5 py-3 font-medium">Description</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 text-right font-medium">Simulate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {webhookEvents.map((evt) => {
                        const on = !!subscribed[evt.name];
                        return (
                          <tr key={evt.name}>
                            <td className="whitespace-nowrap px-5 py-3.5">
                              <code className="font-mono text-[13px] text-slate-800">
                                {evt.name}
                              </code>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600">{evt.desc}</td>
                            <td className="px-5 py-3.5">
                              <Badge tone={on ? "emerald" : "slate"} dot>
                                {on ? "Subscribed" : "Off"}
                              </Badge>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <Toggle
                                checked={on}
                                onChange={(v) =>
                                  setSubscribed((s) => ({ ...s, [evt.name]: v }))
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Card>
              </section>

              {/* ---------------------------- Errors ---------------------------- */}
              <section id="errors" className="scroll-mt-24">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-emerald-50 p-2">
                    <IconAlert className="h-5 w-5 text-emerald-600" />
                  </span>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Errors
                  </h2>
                </div>
                <p className="mt-4 leading-relaxed text-slate-600">
                  Errors are conventional HTTP statuses with a structured JSON body:
                  a stable <InlineCode>type</InlineCode>, a machine-readable{" "}
                  <InlineCode>code</InlineCode>, a human-readable{" "}
                  <InlineCode>message</InlineCode>, and a{" "}
                  <InlineCode>request_id</InlineCode> you can quote to support.{" "}
                  <InlineCode>4xx</InlineCode> means fix the request;{" "}
                  <InlineCode>5xx</InlineCode> means retry with backoff and the same
                  idempotency key.
                </p>
                <CodeBlock
                  className="mt-6"
                  title="Error shape"
                  snippets={errorSnippets}
                />
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------- Footer CTA ---------------------------- */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ship it with confidence
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              Watch every rail and region on the live status page, or browse the FAQ
              for sandbox limits, webhook retries, and SDK release policy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/status" variant="white">
                Platform status
                <IconArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/resources/faq">Help &amp; FAQ</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
