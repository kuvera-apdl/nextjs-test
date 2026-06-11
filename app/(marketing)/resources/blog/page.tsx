"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Button, Card, EmptyState, SectionHeading } from "@/components/ui";
import { IconAlert, IconClock, IconRefresh, IconSearch } from "@/components/icons";
import { cn, fmtDate, fmtNumber } from "@/lib/utils";

type PostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  author: string;
  authorRole: string;
  date: string;
  readMinutes: number;
  likes: number;
};

const tagGradients: Record<string, string> = {
  Product: "from-emerald-500 via-emerald-700 to-slate-900",
  Customers: "from-sky-500 via-sky-700 to-slate-900",
  Treasury: "from-violet-500 via-violet-700 to-slate-900",
  Engineering: "from-slate-500 via-slate-700 to-slate-950",
  Compliance: "from-amber-500 via-amber-700 to-slate-900",
};

function gradientFor(tag: string): string {
  return tagGradients[tag] ?? "from-emerald-500 via-emerald-700 to-slate-900";
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );
}

function MetaRow({ post }: { post: PostMeta }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
      <span className="font-medium text-slate-700">{post.author}</span>
      <span aria-hidden="true">·</span>
      <span>{fmtDate(post.date)}</span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <IconClock className="h-3.5 w-3.5" />
        {post.readMinutes} min read
      </span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <HeartIcon className="h-3.5 w-3.5 text-rose-400" />
        {fmtNumber(post.likes)}
      </span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <div className="h-32 rounded-xl bg-slate-200" />
      <div className="mt-5 h-3 w-16 rounded bg-slate-200" />
      <div className="mt-3 h-5 w-4/5 rounded bg-slate-200" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-2/3 rounded bg-slate-100" />
      </div>
      <div className="mt-5 h-3 w-1/2 rounded bg-slate-100" />
    </Card>
  );
}

export default function BlogIndexPage() {
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [tag, setTag] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const requestKey = JSON.stringify([debouncedQ, tag, reloadKey]);
  const [result, setResult] = useState<{
    key: string;
    posts: PostMeta[];
    tags: string[];
  } | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Blog — Meridian Financial";
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(
      `/api/posts?q=${encodeURIComponent(debouncedQ)}&tag=${encodeURIComponent(tag)}`,
      { signal: ctrl.signal }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json() as Promise<{ posts: PostMeta[]; tags: string[] }>;
      })
      .then((data) => {
        setResult({ key: requestKey, posts: data.posts, tags: data.tags });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setFailedKey(requestKey);
      });
    return () => ctrl.abort();
  }, [debouncedQ, tag, reloadKey, requestKey]);

  const error = failedKey === requestKey;
  const loading = !error && result?.key !== requestKey;
  const posts = result?.posts ?? [];
  const tags = result?.tags ?? [];

  const featured = posts[0];
  const rest = posts.slice(1);
  const hasActiveFilters = query !== "" || tag !== "";

  return (
    <div className="bg-white">
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Resources"
            title="The Meridian Journal"
            description="Field notes on global payments, treasury strategy, and the engineering behind money movement — written by the team building it."
          />

          {/* Controls */}
          <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles…"
                aria-label="Search articles"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:-outline-offset-1 focus:outline-emerald-600"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["", ...tags].map((t) => (
                <button
                  key={t || "all"}
                  onClick={() => setTag(t)}
                  className={cn(
                    "cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    tag === t
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  )}
                >
                  {t === "" ? "All" : t}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="mt-10">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : error ? (
              <Card className="flex flex-col items-center gap-4 py-14 text-center">
                <IconAlert className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-base font-medium text-slate-900">
                    We couldn’t load the journal
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Something went wrong while fetching articles. Please try again.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setReloadKey((k) => k + 1)}
                >
                  <IconRefresh className="h-4 w-4" />
                  Retry
                </Button>
              </Card>
            ) : posts.length === 0 ? (
              <EmptyState
                icon={<IconSearch className="h-8 w-8" />}
                title="No articles match"
                description="Try a different search term or browse another topic."
                action={
                  hasActiveFilters ? (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setQuery("");
                        setTag("");
                      }}
                    >
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                {/* Featured */}
                {featured && (
                  <Link href={`/resources/blog/${featured.slug}`} className="group block">
                    <Card hover className="overflow-hidden p-0">
                      <div className="grid lg:grid-cols-2">
                        <div
                          className={cn(
                            "relative flex min-h-48 items-center justify-center overflow-hidden bg-gradient-to-br lg:min-h-full",
                            gradientFor(featured.tag)
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className="select-none text-6xl font-bold uppercase tracking-tighter text-white/15 sm:text-7xl"
                          >
                            {featured.tag}
                          </span>
                          <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                        </div>
                        <div className="flex flex-col justify-center p-6 sm:p-10">
                          <div className="flex items-center gap-2">
                            <Badge tone="emerald">{featured.tag}</Badge>
                            <Badge tone="slate">Featured</Badge>
                          </div>
                          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 group-hover:text-emerald-700 sm:text-3xl">
                            {featured.title}
                          </h3>
                          <p className="mt-3 text-base leading-relaxed text-slate-600">
                            {featured.excerpt}
                          </p>
                          <div className="mt-6">
                            <MetaRow post={featured} />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )}

                {/* Grid */}
                {rest.length > 0 && (
                  <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {rest.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/resources/blog/${post.slug}`}
                        className="group block h-full"
                      >
                        <Card hover className="flex h-full flex-col overflow-hidden p-0">
                          <div
                            className={cn(
                              "relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br",
                              gradientFor(post.tag)
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className="select-none text-4xl font-bold uppercase tracking-tighter text-white/15"
                            >
                              {post.tag}
                            </span>
                          </div>
                          <div className="flex flex-1 flex-col p-6">
                            <div>
                              <Badge tone="emerald">{post.tag}</Badge>
                            </div>
                            <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900 group-hover:text-emerald-700">
                              {post.title}
                            </h3>
                            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                              {post.excerpt}
                            </p>
                            <div className="mt-auto pt-5">
                              <MetaRow post={post} />
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
