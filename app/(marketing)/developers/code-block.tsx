"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck, IconCopy } from "@/components/icons";
import { cn } from "@/lib/utils";

export type Snippet = {
  lang: string;
  label: string;
  code: string;
};

export function CodeBlock({
  title,
  snippets,
  className,
}: {
  title?: string;
  snippets: Snippet[];
  className?: string;
}) {
  const [active, setActive] = useState(snippets[0]?.lang ?? "");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const current = snippets.find((s) => s.lang === active) ?? snippets[0];

  function handleCopy() {
    if (!current) return;
    navigator.clipboard
      .writeText(current.code)
      .then(() => {
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        /* clipboard unavailable — ignore */
      });
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-slate-950 shadow-sm ring-1 ring-slate-800",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-white/10 px-4 py-2.5">
        {title && (
          <span className="truncate font-mono text-xs text-slate-400">{title}</span>
        )}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" role="tablist" aria-label="Language">
            {snippets.map((s) => (
              <button
                key={s.lang}
                role="tab"
                aria-selected={active === s.lang}
                onClick={() => setActive(s.lang)}
                className={cn(
                  "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                  active === s.lang
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <span aria-hidden="true" className="h-4 w-px bg-white/10" />
          <button
            onClick={handleCopy}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:text-white"
          >
            {copied ? (
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
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-relaxed text-slate-200">
        <code className="font-mono">{current?.code}</code>
      </pre>
    </div>
  );
}
