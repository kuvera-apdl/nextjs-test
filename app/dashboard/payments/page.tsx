"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Select,
  Spinner,
} from "@/components/ui";
import {
  IconAlert,
  IconInfo,
  IconRefresh,
  IconSend,
} from "@/components/icons";
import { cn, fmtMoney, timeAgo } from "@/lib/utils";

type Rail = "ACH" | "Wire" | "SEPA" | "SWIFT";

type Payment = {
  id: string;
  beneficiary: string;
  bank: string;
  amount: number;
  currency: string;
  rail: Rail;
  reference: string;
  status: "processing" | "completed" | "failed" | "canceled";
  createdAt: string;
  fee: number;
};

type Beneficiary = {
  id: string;
  name: string;
  bank: string;
  country: string;
  currency: string;
  last4: string;
};

const RAIL_FEES: Record<Rail, number> = {
  ACH: 0.5,
  SEPA: 0.4,
  Wire: 15,
  SWIFT: 25,
};

const RAIL_ETAS: Record<Rail, string> = {
  ACH: "1–2 business days",
  SEPA: "minutes",
  Wire: "same day",
  SWIFT: "1–3 business days",
};

const RAIL_OPTIONS = (["ACH", "Wire", "SEPA", "SWIFT"] as Rail[]).map((r) => ({
  value: r,
  label: r,
}));

const STATUS_META: Record<
  Payment["status"],
  { tone: "blue" | "emerald" | "rose" | "slate"; label: string }
> = {
  processing: { tone: "blue", label: "Processing" },
  completed: { tone: "emerald", label: "Completed" },
  failed: { tone: "rose", label: "Failed" },
  canceled: { tone: "slate", label: "Canceled" },
};

type Notice = { kind: "info" | "error"; text: string };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeTimer = useRef<number | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  // Highlight rows that just settled between polls.
  const prevStatuses = useRef<Map<string, Payment["status"]>>(new Map());
  const [flashIds, setFlashIds] = useState<Record<string, boolean>>({});

  // Composer state
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [amount, setAmount] = useState("");
  const [rail, setRail] = useState<Rail>("ACH");
  const [reference, setReference] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.title = "Payments — Meridian Financial";
  }, []);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    };
  }, []);

  function showNotice(n: Notice) {
    setNotice(n);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 5000);
  }

  const applyPayments = useCallback((list: Payment[]) => {
    const settled: string[] = [];
    for (const p of list) {
      if (
        prevStatuses.current.get(p.id) === "processing" &&
        p.status === "completed"
      ) {
        settled.push(p.id);
      }
    }
    prevStatuses.current = new Map(list.map((p) => [p.id, p.status]));
    setPayments(list);
    if (settled.length > 0) {
      setFlashIds((f) => ({
        ...f,
        ...Object.fromEntries(settled.map((id) => [id, true])),
      }));
      window.setTimeout(() => {
        setFlashIds((f) => {
          const next = { ...f };
          for (const id of settled) delete next[id];
          return next;
        });
      }, 2200);
    }
  }, []);

  const refetchPayments = useCallback(async () => {
    try {
      const res = await fetch("/api/payments");
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      applyPayments(data.payments);
    } catch {
      // Keep showing the last known list during a failed poll.
    }
  }, [applyPayments]);

  const loadAll = useCallback(async () => {
    setLoadError(null);
    try {
      const [pRes, bRes] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/beneficiaries"),
      ]);
      if (!pRes.ok || !bRes.ok) throw new Error("Request failed");
      const [p, b] = await Promise.all([pRes.json(), bRes.json()]);
      applyPayments(p.payments);
      setBeneficiaries(b.beneficiaries);
    } catch {
      setLoadError("We could not load your payments.");
    }
  }, [applyPayments]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const anyProcessing = useMemo(
    () => payments?.some((p) => p.status === "processing") ?? false,
    [payments]
  );

  // Poll every 5s while any payment is processing.
  useEffect(() => {
    if (!anyProcessing) return;
    const id = window.setInterval(() => {
      refetchPayments();
    }, 5000);
    return () => window.clearInterval(id);
  }, [anyProcessing, refetchPayments]);

  const selectedBeneficiary = useMemo(
    () => beneficiaries?.find((b) => b.id === beneficiaryId) ?? null,
    [beneficiaries, beneficiaryId]
  );

  const amountNum = Number(amount);
  const amountValid = amount !== "" && Number.isFinite(amountNum) && amountNum > 0;
  const fee = RAIL_FEES[rail];
  const composerCurrency = selectedBeneficiary?.currency ?? "USD";

  async function submitPayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setFormError(null);
    if (!selectedBeneficiary) {
      setFormError("Select a beneficiary.");
      return;
    }
    if (!amountValid) {
      setFormError("Enter a positive amount.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beneficiaryId: selectedBeneficiary.id,
          amount: amountNum,
          currency: selectedBeneficiary.currency,
          rail,
          reference: reference.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error ?? "The payment could not be created.");
        return;
      }
      setBeneficiaryId("");
      setAmount("");
      setRail("ACH");
      setReference("");
      await refetchPayments();
      showNotice({
        kind: "info",
        text: "Payment created — it will settle in about 25 seconds.",
      });
    } catch {
      setFormError("Network error — please try again.");
    } finally {
      setSending(false);
    }
  }

  async function cancelPayment(id: string) {
    setCancelingId(id);
    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        await refetchPayments();
        showNotice({ kind: "info", text: "Payment already settled." });
        return;
      }
      if (!res.ok) {
        showNotice({
          kind: "error",
          text: data.error ?? "The payment could not be canceled.",
        });
        return;
      }
      await refetchPayments();
    } catch {
      showNotice({ kind: "error", text: "Network error — please try again." });
    } finally {
      setCancelingId(null);
    }
  }

  if (loadError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <IconAlert className="mx-auto h-8 w-8 text-rose-500" />
          <p className="mt-3 text-base font-medium text-slate-900">
            Something went wrong
          </p>
          <p className="mt-1 text-sm text-slate-600">{loadError}</p>
          <Button className="mt-5" onClick={() => loadAll()}>
            <IconRefresh className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!payments || !beneficiaries) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-7 w-7" />
          <p className="text-sm text-slate-500">Loading payments…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heading row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Payments
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Send funds over ACH, SEPA, Wire, and SWIFT rails.
          </p>
        </div>
        {anyProcessing && (
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-sky-500" />
            Live — updating
          </span>
        )}
      </div>

      {notice && (
        <div
          role="status"
          className={cn(
            "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
            notice.kind === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-sky-200 bg-sky-50 text-sky-700"
          )}
        >
          {notice.kind === "error" ? (
            <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <IconInfo className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payments list */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                Recent payments
              </h2>
              <span className="text-sm text-slate-500">
                {payments.length} total
              </span>
            </div>

            {payments.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon={<IconSend className="h-8 w-8" />}
                  title="No payments yet"
                  description="Use the composer to send your first payment."
                />
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
                      <th className="py-3 pr-4 font-medium">Beneficiary</th>
                      <th className="py-3 pr-4 font-medium">Reference</th>
                      <th className="py-3 pr-4 font-medium">Rail</th>
                      <th className="py-3 pr-4 font-medium">Created</th>
                      <th className="py-3 pr-4 text-right font-medium">Amount</th>
                      <th className="py-3 pr-4 font-medium">Status</th>
                      <th className="py-3 text-right font-medium">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => {
                      const meta = STATUS_META[p.status];
                      return (
                        <tr
                          key={p.id}
                          className={cn(
                            "border-b border-slate-100 transition-colors duration-700 hover:bg-slate-50",
                            flashIds[p.id] && "bg-emerald-50"
                          )}
                        >
                          <td className="py-3 pr-4">
                            <div className="font-medium text-slate-900">
                              {p.beneficiary}
                            </div>
                            <div className="text-xs text-slate-500">{p.bank}</div>
                          </td>
                          <td className="whitespace-nowrap py-3 pr-4 font-mono text-xs text-slate-600">
                            {p.reference}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge tone="slate">{p.rail}</Badge>
                          </td>
                          <td className="whitespace-nowrap py-3 pr-4 text-slate-600">
                            {timeAgo(p.createdAt)}
                          </td>
                          <td className="whitespace-nowrap py-3 pr-4 text-right">
                            <div className="font-medium tabular-nums text-slate-900">
                              {fmtMoney(p.amount, p.currency)}
                            </div>
                            <div className="text-xs tabular-nums text-slate-500">
                              {fmtMoney(p.fee, p.currency)} fee
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge tone={meta.tone}>
                              {p.status === "processing" && (
                                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-current" />
                              )}
                              {meta.label}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap py-3 text-right">
                            {p.status === "processing" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={cancelingId === p.id}
                                onClick={() => cancelPayment(p.id)}
                                className="text-rose-600! hover:bg-rose-50! hover:text-rose-700!"
                              >
                                {cancelingId === p.id ? (
                                  <Spinner className="h-4 w-4" />
                                ) : (
                                  "Cancel"
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="bg-slate-50!">
            <div className="flex items-start gap-3">
              <IconInfo className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Sandbox behavior
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Payments settle automatically ~25 seconds after creation in
                  this sandbox. While anything is processing, this page polls
                  for updates every 5 seconds.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Composer */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-24">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              New payment
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Funds leave your operating account.
            </p>

            <form onSubmit={submitPayment} className="mt-5 space-y-4" noValidate>
              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                  <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <Select
                label="Beneficiary"
                placeholder="Select a beneficiary…"
                options={beneficiaries.map((b) => ({
                  value: b.id,
                  label: `${b.name} — ${b.bank} ••${b.last4}`,
                }))}
                value={beneficiaryId}
                onChange={(e) => setBeneficiaryId(e.target.value)}
              />

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="payment-amount"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Amount
                  </label>
                  {selectedBeneficiary && (
                    <Badge tone="slate">{selectedBeneficiary.currency}</Badge>
                  )}
                </div>
                <Input
                  id="payment-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <Select
                label="Rail"
                options={RAIL_OPTIONS}
                value={rail}
                onChange={(e) => setRail(e.target.value as Rail)}
                aria-describedby="rail-hint"
              />
              <p id="rail-hint" className="-mt-2.5 text-xs text-slate-500">
                {fmtMoney(fee, "USD")} fee · ETA {RAIL_ETAS[rail]}
              </p>

              <Input
                label="Reference"
                placeholder="Optional — e.g. INV-2026-014"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />

              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {amountValid ? (
                  <span className="tabular-nums">
                    Transfer {fmtMoney(amountNum, composerCurrency)} +{" "}
                    {fmtMoney(fee, composerCurrency)} fee ={" "}
                    <span className="font-semibold text-slate-900">
                      {fmtMoney(amountNum + fee, composerCurrency)}
                    </span>
                  </span>
                ) : (
                  <span>Enter an amount to see the total with fees.</span>
                )}
              </div>

              <Button type="submit" disabled={sending} className="w-full">
                {sending ? (
                  <>
                    <Spinner className="h-4 w-4 border-white/40! border-t-white!" />
                    Sending…
                  </>
                ) : (
                  <>
                    <IconSend className="h-4 w-4" />
                    Send payment
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
