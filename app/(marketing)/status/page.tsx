"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  AccordionItem,
  Badge,
  Button,
  Card,
  Input,
  SectionHeading,
  Spinner,
} from "@/components/ui";
import { IconAlert, IconCheck, IconRefresh } from "@/components/icons";
import { cn, fmtDate, fmtDateTime } from "@/lib/utils";

type ServiceStatus = "operational" | "degraded" | "outage";

type Service = {
  name: string;
  status: ServiceStatus;
  uptime90: number[];
  latencyMs: number;
};

type Incident = {
  id: string;
  date: string;
  title: string;
  severity: "minor" | "major";
  status: "resolved" | "monitoring" | "investigating";
  updates: { at: string; text: string; status: string }[];
};

type StatusPayload = {
  updatedAt: string;
  overall: ServiceStatus;
  services: Service[];
  incidents: Incident[];
};

const STATUS_BADGE: Record<ServiceStatus, { tone: "emerald" | "amber" | "rose"; label: string }> = {
  operational: { tone: "emerald", label: "Operational" },
  degraded: { tone: "amber", label: "Degraded" },
  outage: { tone: "rose", label: "Outage" },
};

const OVERALL = {
  operational: {
    wrap: "border-emerald-200 bg-emerald-50",
    circle: "bg-emerald-600",
    title: "All systems operational",
    sub: "Every service is responding normally.",
  },
  degraded: {
    wrap: "border-amber-200 bg-amber-50",
    circle: "bg-amber-500",
    title: "Degraded performance",
    sub: "Some services are slower than usual. We’re on it.",
  },
  outage: {
    wrap: "border-rose-200 bg-rose-50",
    circle: "bg-rose-600",
    title: "Service outage",
    sub: "One or more services are unavailable. Updates below.",
  },
} as const;

const SEVERITY_TONE = { minor: "amber", major: "rose" } as const;

const INCIDENT_STATUS_TONE = {
  resolved: "emerald",
  monitoring: "amber",
  investigating: "rose",
} as const;

function updateTone(status: string): "emerald" | "amber" | "rose" | "slate" {
  if (status === "resolved") return "emerald";
  if (status === "monitoring") return "amber";
  if (status === "investigating") return "rose";
  return "slate";
}

function barColor(v: number): string {
  if (v >= 100) return "bg-emerald-500";
  if (v >= 99) return "bg-amber-400";
  return "bg-rose-500";
}

function avgUptime(values: number[]): string {
  if (values.length === 0) return "100.00";
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
}

export default function StatusPage() {
  useEffect(() => {
    document.title = "System Status — Meridian Financial";
  }, []);

  const [data, setData] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState<number | null>(null);
  const lastFetchedRef = useRef<number | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/status");
      if (!res.ok) throw new Error("Request failed");
      const payload = (await res.json()) as StatusPayload;
      setData(payload);
      setError(null);
      lastFetchedRef.current = Date.now();
      setSecondsAgo(0);
    } catch {
      setError("We couldn’t reach the status service.");
    }
  }, []);

  // Poll every 5s
  useEffect(() => {
    fetchStatus();
    const iv = setInterval(fetchStatus, 5000);
    return () => clearInterval(iv);
  }, [fetchStatus]);

  // 1s ticker for "Updated Ns ago" (only ever runs after mount)
  useEffect(() => {
    const iv = setInterval(() => {
      const t = lastFetchedRef.current;
      if (t !== null) {
        setSecondsAgo(Math.max(0, Math.floor((Date.now() - t) / 1000)));
      }
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const manualRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchStatus(),
      new Promise((resolve) => setTimeout(resolve, 500)),
    ]);
    setRefreshing(false);
  };

  // Newsletter
  const [subEmail, setSubEmail] = useState("");
  const [subSubmitting, setSubSubmitting] = useState(false);
  const [subResult, setSubResult] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  const subscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubSubmitting(true);
    setSubResult(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail.trim() }),
      });
      const payload = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (res.ok && payload?.ok) {
        setSubResult({
          ok: true,
          text: "You’re on the list — incident updates will land in your inbox.",
        });
        setSubEmail("");
      } else {
        setSubResult({
          ok: false,
          text: payload?.error ?? "Subscription failed. Please try again.",
        });
      }
    } catch {
      setSubResult({ ok: false, text: "Network error — please try again." });
    } finally {
      setSubSubmitting(false);
    }
  };

  const overall = data ? OVERALL[data.overall] : null;

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Status"
            title="System status"
            description="Live health for every Meridian service, refreshed automatically every five seconds."
          />

          {/* --------------------------- Overall banner -------------------------- */}
          <div className="mt-10">
            {data && overall ? (
              <div
                className={cn(
                  "flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-6 shadow-sm",
                  overall.wrap
                )}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white",
                      overall.circle
                    )}
                  >
                    {data.overall === "operational" ? (
                      <IconCheck className="h-6 w-6" />
                    ) : (
                      <IconAlert className="h-6 w-6" />
                    )}
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                      {overall.title}
                    </h2>
                    <p className="text-sm text-slate-600">{overall.sub}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {secondsAgo !== null && (
                    <span className="text-sm tabular-nums text-slate-600">
                      Updated {secondsAgo}s ago
                    </span>
                  )}
                  <Button variant="secondary" size="sm" onClick={manualRefresh}>
                    <IconRefresh
                      className={cn("h-4 w-4", refreshing && "animate-spin")}
                    />
                    Refresh
                  </Button>
                </div>
              </div>
            ) : error ? (
              <Card className="flex flex-col items-center gap-4 py-12 text-center">
                <IconAlert className="h-8 w-8 text-rose-500" />
                <p className="text-slate-600">{error}</p>
                <Button variant="secondary" onClick={manualRefresh}>
                  Try again
                </Button>
              </Card>
            ) : (
              <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
                <div className="h-5 w-1/3 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />
              </div>
            )}
          </div>

          {error && data && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Live updates paused — we’ll keep retrying in the background.
            </p>
          )}

          {/* ------------------------------ Services ----------------------------- */}
          <h2 className="mt-12 text-xl font-semibold tracking-tight text-slate-900">
            Services
          </h2>
          <div className="mt-4">
            {data ? (
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
                {data.services.map((service) => (
                  <div key={service.name} className="p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-medium text-slate-900">
                        {service.name}
                      </span>
                      <Badge dot tone={STATUS_BADGE[service.status].tone}>
                        {STATUS_BADGE[service.status].label}
                      </Badge>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs tabular-nums text-slate-600">
                        ~{service.latencyMs} ms
                      </span>
                    </div>
                    <div className="mt-3 flex items-end gap-px">
                      {service.uptime90.map((v, i) => (
                        <span
                          key={i}
                          title={`Day -${service.uptime90.length - i}: ${v}%`}
                          className={cn("h-8 w-1 rounded-sm", barColor(v))}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      90-day uptime: {avgUptime(service.uptime90)}%
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="h-4 w-1/4 rounded bg-slate-200" />
                    <div className="mt-3 h-8 w-2/3 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ------------------------------ Incidents ----------------------------- */}
          <h2 className="mt-12 text-xl font-semibold tracking-tight text-slate-900">
            Incident history
          </h2>
          <div className="mt-2">
            {data ? (
              data.incidents.length === 0 ? (
                <p className="py-6 text-sm text-slate-500">
                  No incidents in the last 90 days.
                </p>
              ) : (
                data.incidents.map((incident) => (
                  <AccordionItem
                    key={incident.id}
                    title={
                      <span className="flex flex-wrap items-center gap-2">
                        {incident.title}
                        <Badge tone={SEVERITY_TONE[incident.severity]}>
                          {incident.severity}
                        </Badge>
                        <Badge dot tone={INCIDENT_STATUS_TONE[incident.status]}>
                          {incident.status}
                        </Badge>
                      </span>
                    }
                    subtitle={fmtDate(incident.date)}
                  >
                    <ol className="space-y-0">
                      {incident.updates.map((update, i) => (
                        <li key={update.at + i} className="flex gap-3">
                          <span className="flex flex-col items-center">
                            <span
                              className={cn(
                                "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                                updateTone(update.status) === "emerald"
                                  ? "bg-emerald-500"
                                  : updateTone(update.status) === "amber"
                                    ? "bg-amber-400"
                                    : updateTone(update.status) === "rose"
                                      ? "bg-rose-500"
                                      : "bg-slate-300"
                              )}
                            />
                            {i < incident.updates.length - 1 && (
                              <span className="w-px flex-1 bg-slate-200" />
                            )}
                          </span>
                          <div className="pb-5">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge tone={updateTone(update.status)}>
                                {update.status}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {fmtDateTime(update.at)}
                              </span>
                            </div>
                            <p className="mt-1.5">{update.text}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </AccordionItem>
                ))
              )
            ) : (
              <div className="space-y-3 pt-2">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="h-4 w-1/2 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ------------------------------ Subscribe ----------------------------- */}
          <Card className="mt-12">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Get incident notifications
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  We’ll email you when an incident opens and when it resolves.
                  Nothing else, ever.
                </p>
              </div>
              <form
                onSubmit={subscribe}
                className="flex w-full items-start gap-2 sm:max-w-sm"
              >
                <Input
                  aria-label="Email for incident notifications"
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={subSubmitting}>
                  {subSubmitting ? (
                    <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </form>
            </div>
            {subResult && (
              <p
                className={cn(
                  "mt-3 text-sm",
                  subResult.ok ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {subResult.text}
              </p>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
