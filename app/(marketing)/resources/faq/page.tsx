"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AccordionItem,
  Button,
  Card,
  EmptyState,
  SectionHeading,
  Tabs,
} from "@/components/ui";
import { IconArrowRight, IconSearch } from "@/components/icons";
import { faqs, faqCategories } from "@/lib/content";

const ALL = "all";

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);

  useEffect(() => {
    document.title = "Help & FAQ — Keelstone Financial";
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => {
      if (category !== ALL && f.category !== category) return false;
      if (q && !f.q.toLowerCase().includes(q) && !f.a.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [query, category]);

  const groups = useMemo(
    () =>
      faqCategories
        .map((c) => ({
          category: c,
          items: filtered.filter((f) => f.category === c),
        }))
        .filter((g) => g.items.length > 0),
    [filtered]
  );

  const tabs = [
    { id: ALL, label: "All" },
    ...faqCategories.map((c) => ({ id: c, label: c })),
  ];

  function clearFilters() {
    setQuery("");
    setCategory(ALL);
  }

  return (
    <div className="bg-white">
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Resources"
            title="Help & frequently asked questions"
            description="Quick answers about the platform, pricing, payments, security, and the API. Can’t find what you need? Our team replies within one business day."
          />

          {/* Controls */}
          <div className="mt-10 space-y-5">
            <div className="relative max-w-md">
              <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions and answers…"
                aria-label="Search FAQs"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:-outline-offset-1 focus:outline-emerald-600"
              />
            </div>
            <Tabs tabs={tabs} active={category} onChange={setCategory} variant="pill" />
            <p className="text-sm text-slate-500">
              {filtered.length} {filtered.length === 1 ? "answer" : "answers"}
            </p>
          </div>

          {/* Grouped results */}
          <div className="mt-8">
            {filtered.length === 0 ? (
              <EmptyState
                icon={<IconSearch className="h-8 w-8" />}
                title="Nothing matches your search"
                description="Try different keywords, or browse all categories instead."
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear search
                  </Button>
                }
              />
            ) : (
              <div className="space-y-12">
                {groups.map((group) => (
                  <div key={group.category}>
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                      {group.category}
                    </h2>
                    <div className="mt-2 border-t border-slate-200">
                      {group.items.map((f) => (
                        <AccordionItem key={f.q} title={f.q}>
                          {f.a}
                        </AccordionItem>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Still stuck */}
          <Card className="relative mt-16 overflow-hidden border-slate-900 bg-slate-950 p-8 sm:p-10">
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"
            />
            <div className="relative">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Still stuck?
              </h2>
              <p className="mt-3 max-w-xl text-slate-300">
                Send us the details and a specialist will get back to you within one
                business day. Building an integration? The developer portal has
                runnable examples for every endpoint.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/contact">
                  Contact support
                  <IconArrowRight className="h-4 w-4" />
                </Button>
                <Button href="/developers" variant="white">
                  Developer docs
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
