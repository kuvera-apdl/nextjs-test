"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
  Spinner,
  Stat,
  Tabs,
} from "@/components/ui";
import {
  IconAlert,
  IconCheck,
  IconCopy,
  IconFile,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@/components/icons";
import { cn, fmtDate, fmtMoney } from "@/lib/utils";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

type Invoice = {
  id: string;
  number: string;
  client: string;
  email: string;
  amount: number;
  currency: string;
  issuedAt: string;
  dueAt: string;
  status: InvoiceStatus;
};

const STATUS_TONE: Record<InvoiceStatus, "blue" | "emerald" | "rose" | "amber" | "slate"> = {
  sent: "blue",
  paid: "emerald",
  overdue: "rose",
  draft: "amber",
  void: "slate",
};

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  draft: "Draft",
  void: "Void",
};

const FILTERS: ("all" | InvoiceStatus)[] = [
  "all",
  "sent",
  "paid",
  "overdue",
  "draft",
  "void",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = {
  client: string;
  email: string;
  amount: string;
  currency: string;
  dueAt: string;
};

const EMPTY_FORM: FormState = {
  client: "",
  email: "",
  amount: "",
  currency: "USD",
  dueAt: "",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | InvoiceStatus>("all");

  const [actionAlert, setActionAlert] = useState<string | null>(null);
  const alertTimer = useRef<number | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [formServerError, setFormServerError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    document.title = "Invoices — Meridian Financial";
  }, []);

  useEffect(() => {
    return () => {
      if (alertTimer.current) window.clearTimeout(alertTimer.current);
    };
  }, []);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/invoices");
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setInvoices(data.invoices);
    } catch {
      setLoadError("We could not load your invoices.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function showAlert(msg: string) {
    setActionAlert(msg);
    if (alertTimer.current) window.clearTimeout(alertTimer.current);
    alertTimer.current = window.setTimeout(() => setActionAlert(null), 4500);
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: invoices?.length ?? 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      draft: 0,
      void: 0,
    };
    for (const inv of invoices ?? []) c[inv.status] += 1;
    return c;
  }, [invoices]);

  const filtered = useMemo(() => {
    if (!invoices) return [];
    return filter === "all" ? invoices : invoices.filter((i) => i.status === filter);
  }, [invoices, filter]);

  const outstandingUsd = useMemo(
    () =>
      (invoices ?? [])
        .filter(
          (i) =>
            (i.status === "sent" || i.status === "overdue" || i.status === "paid") &&
            i.currency === "USD"
        )
        .reduce((sum, i) => sum + i.amount, 0),
    [invoices]
  );

  async function updateStatus(id: string, status: InvoiceStatus) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showAlert(data.error ?? "The invoice could not be updated.");
        if (res.status === 409) await load();
        return;
      }
      setInvoices((prev) =>
        prev ? prev.map((i) => (i.id === id ? data.invoice : i)) : prev
      );
    } catch {
      showAlert("Network error — the invoice was not updated.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteInvoice(inv: Invoice) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/invoices/${inv.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showAlert(data.error ?? "The invoice could not be deleted.");
        if (res.status === 409) await load();
        return;
      }
      setInvoices((prev) => (prev ? prev.filter((i) => i.id !== inv.id) : prev));
    } catch {
      showAlert("Network error — the invoice was not deleted.");
    } finally {
      setDeleting(false);
      setConfirmTarget(null);
    }
  }

  async function copyLink(id: string) {
    try {
      await navigator.clipboard.writeText(`https://pay.meridian.example/${id}`);
      setCopiedId(id);
      window.setTimeout(
        () => setCopiedId((cur) => (cur === id ? null : cur)),
        1600
      );
    } catch {
      showAlert("Could not copy the link to your clipboard.");
    }
  }

  function openModal() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormServerError(null);
    setModalOpen(true);
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.client.trim()) errs.client = "Client name is required.";
    if (!EMAIL_RE.test(form.email.trim()))
      errs.email = "Enter a valid billing email.";
    const amt = Number(form.amount);
    if (!form.amount || !Number.isFinite(amt) || amt <= 0)
      errs.amount = "Enter a positive amount.";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function createInvoice() {
    if (!validate()) return;
    setCreating(true);
    setFormServerError(null);
    try {
      const body: Record<string, unknown> = {
        client: form.client.trim(),
        email: form.email.trim(),
        amount: Number(form.amount),
        currency: form.currency,
      };
      if (form.dueAt) body.dueAt = new Date(form.dueAt).toISOString();
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormServerError(data.error ?? "The invoice could not be created.");
        return;
      }
      const invoice: Invoice = data.invoice;
      setInvoices((prev) => (prev ? [invoice, ...prev] : [invoice]));
      setModalOpen(false);
      setFilter("all");
      setHighlightId(invoice.id);
      window.setTimeout(
        () => setHighlightId((cur) => (cur === invoice.id ? null : cur)),
        2500
      );
    } catch {
      setFormServerError("Network error — please try again.");
    } finally {
      setCreating(false);
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
          <Button className="mt-5" onClick={() => load()}>
            <IconRefresh className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!invoices) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-7 w-7" />
          <p className="text-sm text-slate-500">Loading invoices…</p>
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
            Invoices
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Issue, track, and reconcile receivables.
          </p>
        </div>
        <Button onClick={openModal}>
          <IconPlus className="h-4 w-4" />
          New invoice
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <Stat
            label="Outstanding"
            value={fmtMoney(outstandingUsd, "USD")}
            sub="USD · sent and overdue"
          />
        </Card>
        <Card>
          <Stat
            label="Overdue"
            value={
              <span className={cn(counts.overdue > 0 && "text-rose-600")}>
                {counts.overdue}
              </span>
            }
            sub={counts.overdue === 1 ? "invoice past due" : "invoices past due"}
          />
        </Card>
        <Card>
          <Stat
            label="Paid this period"
            value={counts.paid}
            sub={counts.paid === 1 ? "invoice settled" : "invoices settled"}
          />
        </Card>
      </div>

      {/* Status filter */}
      <Tabs
        tabs={FILTERS.map((f) => ({
          id: f,
          label: `${f === "all" ? "All" : STATUS_LABEL[f]} (${counts[f]})`,
        }))}
        active={filter}
        onChange={(id) => setFilter(id as "all" | InvoiceStatus)}
      />

      {/* Inline action alert */}
      {actionAlert && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* Table */}
      <Card>
        {filtered.length === 0 ? (
          <div>
            <EmptyState
              icon={<IconFile className="h-8 w-8" />}
              title={
                filter === "all"
                  ? "No invoices yet"
                  : `No ${STATUS_LABEL[filter as InvoiceStatus].toLowerCase()} invoices`
              }
              description={
                filter === "all"
                  ? "Create your first invoice to start collecting payments."
                  : "Nothing matches this status right now."
              }
              action={
                filter === "all" ? (
                  <Button size="sm" onClick={openModal}>
                    <IconPlus className="h-4 w-4" />
                    New invoice
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    Show all invoices
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="py-3 pr-4 font-medium">Number</th>
                  <th className="py-3 pr-4 font-medium">Client</th>
                  <th className="py-3 pr-4 font-medium">Issued</th>
                  <th className="py-3 pr-4 font-medium">Due</th>
                  <th className="py-3 pr-4 text-right font-medium">Amount</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const overdue = inv.status === "overdue";
                  const busy = busyId === inv.id;
                  return (
                    <tr
                      key={inv.id}
                      className={cn(
                        "border-b border-slate-100 transition-colors duration-700 hover:bg-slate-50",
                        highlightId === inv.id &&
                          "bg-emerald-50 ring-2 ring-inset ring-emerald-400"
                      )}
                    >
                      <td className="whitespace-nowrap py-3 pr-4 font-mono text-xs text-slate-700">
                        {inv.number}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-slate-900">
                          {inv.client}
                        </div>
                        <div className="text-xs text-slate-500">{inv.email}</div>
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 text-slate-600">
                        {fmtDate(inv.issuedAt)}
                      </td>
                      <td
                        className={cn(
                          "whitespace-nowrap py-3 pr-4",
                          overdue ? "text-rose-600" : "text-slate-600"
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {overdue && <IconAlert className="h-4 w-4" />}
                          {fmtDate(inv.dueAt)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 text-right font-medium tabular-nums text-slate-900">
                        {fmtMoney(inv.amount, inv.currency)}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone={STATUS_TONE[inv.status]}>
                          {STATUS_LABEL[inv.status]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          {(inv.status === "sent" || inv.status === "overdue") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={busy}
                              onClick={() => updateStatus(inv.id, "paid")}
                              className="text-emerald-700! hover:bg-emerald-50! hover:text-emerald-800!"
                            >
                              Mark paid
                            </Button>
                          )}
                          {(inv.status === "sent" ||
                            inv.status === "overdue" ||
                            inv.status === "draft") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={busy}
                              onClick={() => updateStatus(inv.id, "void")}
                            >
                              Void
                            </Button>
                          )}
                          {(inv.status === "draft" || inv.status === "void") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={busy}
                              onClick={() => setConfirmTarget(inv)}
                              className="text-rose-600! hover:bg-rose-50! hover:text-rose-700!"
                              aria-label={`Delete ${inv.number}`}
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyLink(inv.id)}
                            aria-label={`Copy payment link for ${inv.number}`}
                          >
                            {copiedId === inv.id ? (
                              <>
                                <IconCheck className="h-4 w-4 text-emerald-600" />
                                Copied
                              </>
                            ) : (
                              <>
                                <IconCopy className="h-4 w-4" />
                                Copy link
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New invoice"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={createInvoice} disabled={creating}>
              {creating ? (
                <>
                  <Spinner className="h-4 w-4 border-white/40! border-t-white!" />
                  Creating…
                </>
              ) : (
                "Create invoice"
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formServerError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formServerError}</span>
            </div>
          )}
          <Input
            label="Client name"
            placeholder="Acme Corporation"
            value={form.client}
            onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))}
            error={formErrors.client}
          />
          <Input
            label="Billing email"
            type="email"
            placeholder="billing@acme.example"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={formErrors.email}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="2500.00"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              error={formErrors.amount}
            />
            <Select
              label="Currency"
              options={[
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "GBP", label: "GBP" },
              ]}
              value={form.currency}
              onChange={(e) =>
                setForm((f) => ({ ...f, currency: e.target.value }))
              }
            />
          </div>
          <Input
            label="Due date"
            type="date"
            value={form.dueAt}
            onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
            hint="Leave empty to default to 30 days from today."
          />
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        title="Delete invoice"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirmTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => confirmTarget && deleteInvoice(confirmTarget)}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Spinner className="h-4 w-4 border-white/40! border-t-white!" />
                  Deleting…
                </>
              ) : (
                <>
                  <IconTrash className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          You’re about to permanently delete{" "}
          <span className="font-medium text-slate-900">
            {confirmTarget?.number}
          </span>{" "}
          for{" "}
          <span className="font-medium text-slate-900">
            {confirmTarget?.client}
          </span>
          . This can’t be undone.
        </p>
      </Modal>
    </div>
  );
}
