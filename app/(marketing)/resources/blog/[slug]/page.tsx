"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Card, Spinner } from "@/components/ui";
import {
  IconAlert,
  IconArrowRight,
  IconCheck,
  IconClock,
  IconCopy,
  IconFile,
  IconRefresh,
} from "@/components/icons";
import { cn, fmtDate } from "@/lib/utils";

type PostBlock = {
  type: "p" | "h2" | "quote" | "ul";
  text?: string;
  items?: string[];
};

type Post = {
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

type PostMeta = Omit<Post, "content">;

type FetchResult =
  | { key: string; type: "ready"; post: Post }
  | { key: string; type: "notfound" }
  | { key: string; type: "error" };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();

  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${slug ?? ""}#${reloadKey}`;
  const [result, setResult] = useState<FetchResult | null>(null);

  const [progress, setProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState("");

  const [likeState, setLikeState] = useState<{
    slug: string;
    likes: number;
    liked: boolean;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [relatedResult, setRelatedResult] = useState<{
    key: string;
    posts: PostMeta[];
  } | null>(null);

  const current = result && result.key === requestKey ? result : null;
  const post = current?.type === "ready" ? current.post : null;
  const status: "loading" | "ready" | "notfound" | "error" = current
    ? current.type
    : "loading";

  /* Fetch the article */
  useEffect(() => {
    if (!slug) return;
    const ctrl = new AbortController();
    fetch(`/api/posts/${encodeURIComponent(slug)}`, { signal: ctrl.signal })
      .then(async (res) => {
        if (res.status === 404) {
          setResult({ key: requestKey, type: "notfound" });
          return;
        }
        if (!res.ok) throw new Error("Request failed");
        const data = (await res.json()) as { post: Post };
        setResult({ key: requestKey, type: "ready", post: data.post });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setResult({ key: requestKey, type: "error" });
      });
    return () => ctrl.abort();
  }, [slug, reloadKey, requestKey]);

  /* Document title */
  useEffect(() => {
    document.title = post
      ? `${post.title} — Meridian Financial`
      : "Blog — Meridian Financial";
  }, [post]);

  /* Reading progress bar */
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const pct = total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0;
      setProgress(pct);
    };
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* Content blocks with stable heading ids for the ToC */
  const { headings, blocks } = useMemo(() => {
    const seen = new Map<string, number>();
    const hs: { id: string; text: string }[] = [];
    const bs = (post?.content ?? []).map((block) => {
      if (block.type === "h2" && block.text) {
        const base = slugify(block.text) || "section";
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        const id = count === 0 ? base : `${base}-${count}`;
        hs.push({ id, text: block.text });
        return { block, headingId: id as string | undefined };
      }
      return { block, headingId: undefined as string | undefined };
    });
    return { headings: hs, blocks: bs };
  }, [post]);

  /* Highlight the section currently in view */
  useEffect(() => {
    if (!post || headings.length === 0) return;
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveHeading(entry.target.id);
        }
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [post, headings]);

  /* Cleanup copy timer */
  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  /* Related posts */
  useEffect(() => {
    if (!post) return;
    const ctrl = new AbortController();
    fetch(`/api/posts?tag=${encodeURIComponent(post.tag)}`, { signal: ctrl.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json() as Promise<{ posts: PostMeta[] }>;
      })
      .then((data) =>
        setRelatedResult({
          key: post.slug,
          posts: data.posts.filter((p) => p.slug !== post.slug).slice(0, 3),
        })
      )
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setRelatedResult({ key: post.slug, posts: [] });
      });
    return () => ctrl.abort();
  }, [post]);

  const related =
    post && relatedResult && relatedResult.key === post.slug
      ? relatedResult.posts
      : [];

  const liked = post !== null && likeState?.slug === post.slug && likeState.liked;
  const likes =
    post !== null && likeState?.slug === post.slug ? likeState.likes : post?.likes ?? 0;

  function handleLike() {
    if (!post || liked) return;
    const slugAtClick = post.slug;
    setLikeState({ slug: slugAtClick, likes: post.likes + 1, liked: true });
    fetch(`/api/posts/${encodeURIComponent(slugAtClick)}/like`, { method: "POST" })
      .then((res) => (res.ok ? (res.json() as Promise<{ likes?: number }>) : null))
      .then((data) => {
        if (data && typeof data.likes === "number") {
          setLikeState({ slug: slugAtClick, likes: data.likes, liked: true });
        }
      })
      .catch(() => {
        /* keep the optimistic count */
      });
  }

  function handleCopyLink() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        if (copyTimer.current) clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        /* clipboard unavailable — ignore */
      });
  }

  /* ----------------------------- States ----------------------------- */

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-slate-500">Loading article…</p>
        </div>
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card className="flex flex-col items-center py-14 text-center">
            <IconFile className="h-10 w-10 text-slate-300" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
              Article not found
            </h1>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              The story you’re looking for may have been moved, renamed, or
              unpublished. The rest of the journal is still here.
            </p>
            <Button href="/resources/blog" className="mt-6">
              Back to the journal
              <IconArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "error" || !post) {
    return (
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card className="flex flex-col items-center py-14 text-center">
            <IconAlert className="h-10 w-10 text-amber-500" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
              Something went wrong
            </h1>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              We couldn’t load this article. Check your connection and try again.
            </p>
            <Button
              variant="secondary"
              className="mt-6"
              onClick={() => setReloadKey((k) => k + 1)}
            >
              <IconRefresh className="h-4 w-4" />
              Retry
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  /* ----------------------------- Article ----------------------------- */

  return (
    <div className="bg-white">
      {/* Reading progress bar */}
      <div aria-hidden="true" className="fixed left-0 right-0 top-16 z-30 h-0.5">
        <div
          className="h-full bg-emerald-500 transition-[width] duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
            <article className="mx-auto w-full max-w-3xl lg:mx-0">
              <Link
                href="/resources/blog"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-600"
              >
                <IconArrowRight className="h-4 w-4 rotate-180" />
                Back to the journal
              </Link>

              {/* Header */}
              <header className="mt-6">
                <Badge tone="emerald">{post.tag}</Badge>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  {post.title}
                </h1>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                      {initials(post.author)}
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-slate-900">
                        {post.author}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {post.authorRole}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-x-3 text-sm text-slate-500">
                    <span>{fmtDate(post.date)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <IconClock className="h-4 w-4" />
                      {post.readMinutes} min read
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-slate-200 py-3">
                  <button
                    onClick={handleLike}
                    disabled={liked}
                    aria-pressed={liked}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none",
                      liked
                        ? "border-rose-200 bg-rose-50 text-rose-600"
                        : "border-slate-300 bg-white text-slate-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    )}
                  >
                    <HeartIcon
                      className={cn("h-4 w-4", liked ? "text-rose-500" : "text-rose-400")}
                    />
                    {liked ? "Liked" : "Like"}
                    <span className="tabular-nums text-slate-500">{likes}</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    {copied ? (
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
                  </button>
                </div>
              </header>

              {/* Body */}
              <div className="mt-8">
                {blocks.map(({ block, headingId }, i) => {
                  if (block.type === "h2") {
                    return (
                      <h2
                        key={i}
                        id={headingId}
                        className="mt-12 scroll-mt-28 text-2xl font-semibold tracking-tight text-slate-900 first:mt-0"
                      >
                        {block.text}
                      </h2>
                    );
                  }
                  if (block.type === "quote") {
                    return (
                      <blockquote
                        key={i}
                        className="mt-6 border-l-4 border-emerald-500 pl-5 text-lg italic leading-relaxed text-slate-700"
                      >
                        {block.text}
                      </blockquote>
                    );
                  }
                  if (block.type === "ul") {
                    return (
                      <ul key={i} className="mt-6 space-y-3">
                        {(block.items ?? []).map((item, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <IconCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                            <span className="leading-relaxed text-slate-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={i} className="mt-6 leading-relaxed text-slate-700">
                      {block.text}
                    </p>
                  );
                })}
              </div>
            </article>

            {/* Table of contents */}
            {headings.length > 0 && (
              <aside className="hidden lg:block">
                <nav aria-label="Table of contents" className="sticky top-28">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    On this page
                  </p>
                  <ul className="mt-4 space-y-1 border-l border-slate-200">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <button
                          onClick={() =>
                            document
                              .getElementById(h.id)
                              ?.scrollIntoView({ behavior: "smooth" })
                          }
                          className={cn(
                            "-ml-px block w-full cursor-pointer border-l-2 py-1 pl-4 text-left text-sm transition-colors",
                            activeHeading === h.id
                              ? "border-emerald-600 font-medium text-emerald-700"
                              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
                          )}
                        >
                          {h.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-20 border-t border-slate-200 pt-12">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                More on {post.tag}
              </h2>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {related.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/resources/blog/${p.slug}`}
                    className="group block h-full"
                  >
                    <Card hover className="flex h-full flex-col">
                      <div>
                        <Badge tone="emerald">{p.tag}</Badge>
                      </div>
                      <h3 className="mt-3 text-base font-semibold tracking-tight text-slate-900 group-hover:text-emerald-700">
                        {p.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                        {p.excerpt}
                      </p>
                      <div className="mt-auto pt-4 text-xs text-slate-500">
                        {fmtDate(p.date)} · {p.readMinutes} min read
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
