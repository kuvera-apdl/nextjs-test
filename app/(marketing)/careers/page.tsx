"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AccordionItem,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
  Spinner,
  Stat,
  Textarea,
} from "@/components/ui";
import {
  IconAlert,
  IconBriefcase,
  IconCalendar,
  IconCheck,
  IconGlobe,
  IconPie,
  IconShield,
  IconSparkles,
  IconUser,
} from "@/components/icons";
import { timeAgo } from "@/lib/utils";

type Job = {
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

type JobsResponse = {
  jobs: Job[];
  departments: string[];
  locations: string[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PERKS = [
  {
    icon: IconPie,
    title: "Meaningful equity",
    text: "Every offer includes a real ownership stake — refreshed as the company grows.",
  },
  {
    icon: IconShield,
    title: "Premium healthcare",
    text: "Top-tier medical, dental, and vision for you and your dependents, fully covered.",
  },
  {
    icon: IconSparkles,
    title: "L&D budget",
    text: "An annual learning budget for courses, conferences, and books — no approvals maze.",
  },
  {
    icon: IconUser,
    title: "Parental leave",
    text: "20 weeks fully paid for all new parents, plus a gentle four-day ramp-back month.",
  },
  {
    icon: IconGlobe,
    title: "Remote-flexible",
    text: "Work from any of our nine offices or from home — we plan work around time zones, not desks.",
  },
  {
    icon: IconCalendar,
    title: "Annual offsite",
    text: "The whole company meets once a year to plan, argue kindly, and eat very well.",
  },
];

export default function CareersPage() {
  useEffect(() => {
    document.title = "Careers — Meridian Financial";
  }, []);

  // ---- Job board state ----
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [q, setQ] = useState("");
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);

  const loadJobs = useCallback(async () => {
    const id = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (department) params.set("department", department);
      if (location) params.set("location", location);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as JobsResponse;
      if (id !== requestRef.current) return;
      setJobs(data.jobs);
      setDepartments(data.departments);
      setLocations(data.locations);
    } catch {
      if (id !== requestRef.current) return;
      setError("We couldn’t load open roles. Please try again.");
    } finally {
      if (id === requestRef.current) setLoading(false);
    }
  }, [department, location, q]);

  useEffect(() => {
    const t = setTimeout(loadJobs, 250);
    return () => clearTimeout(t);
  }, [loadJobs]);

  const clearFilters = () => {
    setDepartment("");
    setLocation("");
    setQ("");
  };

  // ---- Application modal state ----
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [appName, setAppName] = useState("");
  const [appEmail, setAppEmail] = useState("");
  const [appLinkedin, setAppLinkedin] = useState("");
  const [appNote, setAppNote] = useState("");
  const [appErrors, setAppErrors] = useState<{ name?: string; email?: string }>({});
  const [appSubmitting, setAppSubmitting] = useState(false);
  const [appServerError, setAppServerError] = useState<string | null>(null);
  const [appSuccessId, setAppSuccessId] = useState<string | null>(null);

  const openApply = (job: Job) => {
    setApplyJob(job);
    setAppName("");
    setAppEmail("");
    setAppLinkedin("");
    setAppNote("");
    setAppErrors({});
    setAppServerError(null);
    setAppSuccessId(null);
  };

  const submitApplication = async () => {
    if (!applyJob) return;
    const errs: { name?: string; email?: string } = {};
    if (!appName.trim()) errs.name = "Please enter your full name.";
    if (!EMAIL_RE.test(appEmail.trim())) errs.email = "Enter a valid email address.";
    setAppErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setAppSubmitting(true);
    setAppServerError(null);
    try {
      const parts = [
        `Application for ${applyJob.title} (${applyJob.id}).`,
        appLinkedin.trim() ? `LinkedIn: ${appLinkedin.trim()}` : "",
        appNote.trim(),
      ].filter(Boolean);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: appName.trim(),
          email: appEmail.trim(),
          topic: "careers",
          message: parts.join("\n\n"),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; id?: string; error?: string }
        | null;
      if (res.ok && data?.id) {
        setAppSuccessId(data.id);
      } else {
        setAppServerError(data?.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setAppServerError("Network error — please try again.");
    } finally {
      setAppSubmitting(false);
    }
  };

  return (
    <div>
      {/* ------------------------------- Hero ------------------------------ */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Careers
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Build the financial backbone of modern business
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            We move billions for companies like Halcyon Robotics and Nordwind
            Logistics. The problems are hard, the blast radius is real, and the
            team is unreasonably kind.
          </p>
          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-3">
            <Stat label="People" value="480" sub="across four time zones" />
            <Stat label="Offices" value="9" sub="plus remote-first teams" />
            <Stat label="Open teams" value="5" sub="hiring right now" />
          </div>
        </div>
      </section>

      {/* ------------------------------- Perks ----------------------------- */}
      <section className="border-t border-slate-200 bg-slate-50/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            How we take care of you
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PERKS.map((perk) => (
              <Card key={perk.title} hover>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <perk.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{perk.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{perk.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- Job board ---------------------------- */}
      <section className="py-16 sm:py-24" id="open-roles">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Open roles
              </h2>
              <p className="mt-2 text-slate-600">
                {jobs !== null && !loading
                  ? `${jobs.length} open role${jobs.length === 1 ? "" : "s"}`
                  : "Loading roles…"}
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-2xl">
              <Select
                aria-label="Filter by department"
                placeholder="All departments"
                options={departments.map((d) => ({ value: d, label: d }))}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
              <Select
                aria-label="Filter by location"
                placeholder="All locations"
                options={locations.map((l) => ({ value: l, label: l }))}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Input
                aria-label="Search roles"
                placeholder="Search roles…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8">
            {error ? (
              <Card className="flex flex-col items-center gap-4 py-12 text-center">
                <IconAlert className="h-8 w-8 text-rose-500" />
                <p className="text-slate-600">{error}</p>
                <Button variant="secondary" onClick={loadJobs}>
                  Try again
                </Button>
              </Card>
            ) : loading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="h-4 w-1/3 rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : jobs && jobs.length === 0 ? (
              <EmptyState
                icon={<IconBriefcase className="h-8 w-8" />}
                title="No roles match those filters"
                description="Try widening your search — or check back soon, we open new roles every month."
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 shadow-sm">
                {jobs?.map((job) => (
                  <AccordionItem
                    key={job.id}
                    title={
                      <span className="flex flex-wrap items-center gap-2">
                        {job.title}
                        <Badge tone="emerald">{job.department}</Badge>
                        <Badge tone="slate">{job.location}</Badge>
                        <Badge tone="blue">{job.type}</Badge>
                      </span>
                    }
                    subtitle={`Posted ${timeAgo(job.posted)} · ${job.salary}`}
                  >
                    <p>{job.description}</p>
                    <ul className="mt-4 space-y-2">
                      {job.requirements.map((req) => (
                        <li key={req} className="flex items-start gap-2">
                          <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      size="sm"
                      className="mt-5"
                      onClick={() => openApply(job)}
                    >
                      Apply for this role
                    </Button>
                  </AccordionItem>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------------------- Culture band -------------------------- */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <figure className="mx-auto max-w-3xl text-center">
            <blockquote className="text-2xl font-medium leading-relaxed tracking-tight sm:text-3xl">
              “I’ve shipped payment systems at three companies. Meridian is the
              first place where the hard problems — settlement, reconciliation,
              moving money across borders — are the product, not a side quest.”
            </blockquote>
            <figcaption className="mt-8">
              <div className="font-semibold text-emerald-400">Maya Lindqvist</div>
              <div className="mt-1 text-sm text-slate-400">
                Staff Engineer, Payments Infrastructure
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* --------------------------- Apply modal ---------------------------- */}
      <Modal
        open={applyJob !== null}
        onClose={() => setApplyJob(null)}
        title={appSuccessId ? "Application sent" : `Apply — ${applyJob?.title ?? ""}`}
      >
        {appSuccessId ? (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <IconCheck className="h-7 w-7 text-emerald-600" />
            </span>
            <p className="mt-4 text-base font-medium text-slate-900">
              Thanks — your application is in.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Your reference is{" "}
              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-900">
                {appSuccessId}
              </span>
              . Our recruiting team reads every application and will reply
              within five business days.
            </p>
            <Button
              variant="secondary"
              className="mt-6"
              onClick={() => setApplyJob(null)}
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Full name"
              placeholder="Jordan Reyes"
              value={appName}
              onChange={(e) => {
                setAppName(e.target.value);
                if (appErrors.name) setAppErrors((p) => ({ ...p, name: undefined }));
              }}
              error={appErrors.name}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={appEmail}
              onChange={(e) => {
                setAppEmail(e.target.value);
                if (appErrors.email) setAppErrors((p) => ({ ...p, email: undefined }));
              }}
              error={appErrors.email}
            />
            <Input
              label="LinkedIn URL (optional)"
              placeholder="https://linkedin.com/in/…"
              value={appLinkedin}
              onChange={(e) => setAppLinkedin(e.target.value)}
            />
            <Textarea
              label="Anything you’d like us to know? (optional)"
              placeholder="A project you’re proud of, why this role, notice period…"
              value={appNote}
              onChange={(e) => setAppNote(e.target.value)}
            />
            {appServerError && (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {appServerError}
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setApplyJob(null)}>
                Cancel
              </Button>
              <Button onClick={submitApplication} disabled={appSubmitting}>
                {appSubmitting && (
                  <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                )}
                {appSubmitting ? "Sending…" : "Submit application"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
