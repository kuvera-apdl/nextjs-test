"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import {
  IconBank,
  IconCard,
  IconChevronDown,
  IconGlobe,
  IconMenu,
  IconTrendingUp,
  IconX,
} from "@/components/icons";

const solutions = [
  {
    href: "/solutions/payments",
    label: "Global Payments",
    desc: "Send and receive in 40+ currencies",
    icon: IconGlobe,
  },
  {
    href: "/solutions/treasury",
    label: "Treasury",
    desc: "Yield, liquidity and forecasting",
    icon: IconTrendingUp,
  },
  {
    href: "/solutions/lending",
    label: "Lending",
    desc: "Credit lines and working capital",
    icon: IconBank,
  },
  {
    href: "/solutions/corporate-cards",
    label: "Corporate Cards",
    desc: "Smart cards with spend controls",
    icon: IconCard,
  },
];

const resources = [
  { href: "/resources/blog", label: "Blog" },
  { href: "/resources/faq", label: "Help & FAQ" },
  { href: "/developers", label: "Developers" },
  { href: "/tools/fx-converter", label: "FX Converter" },
  { href: "/status", label: "System Status" },
];

const company = [
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function Logo({ dark }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 shadow-sm">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="3.5" ry="9" />
          <path d="M3 12h18" />
        </svg>
      </span>
      <span
        className={cn(
          "text-lg font-semibold tracking-tight",
          dark ? "text-white" : "text-slate-900"
        )}
      >
        Meridian<span className="text-emerald-500">.</span>
      </span>
    </Link>
  );
}

function Dropdown({
  label,
  active,
  children,
  width = "w-72",
}: {
  label: string;
  active?: boolean;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <div className="group relative">
      <button
        className={cn(
          "flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active ? "text-emerald-700" : "text-slate-600 hover:text-slate-900"
        )}
      >
        {label}
        <IconChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
      </button>
      <div
        className={cn(
          "invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100",
          width
        )}
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (prefix: string) => pathname.startsWith(prefix);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          <Dropdown label="Solutions" active={isActive("/solutions")} width="w-80">
            {solutions.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <s.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-slate-900">
                    {s.label}
                  </span>
                  <span className="block text-xs text-slate-500">{s.desc}</span>
                </span>
              </Link>
            ))}
          </Dropdown>

          <Link
            href="/pricing"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive("/pricing")
                ? "text-emerald-700"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Pricing
          </Link>

          <Dropdown
            label="Resources"
            active={
              isActive("/resources") ||
              isActive("/developers") ||
              isActive("/status") ||
              isActive("/tools")
            }
            width="w-56"
          >
            {resources.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                {r.label}
              </Link>
            ))}
          </Dropdown>

          <Dropdown
            label="Company"
            active={isActive("/about") || isActive("/careers") || isActive("/contact")}
            width="w-48"
          >
            {company.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                {r.label}
              </Link>
            ))}
          </Dropdown>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Button href="/login" variant="ghost" size="sm">
            Sign in
          </Button>
          <Button href="/demo" size="sm">
            Get a demo
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="cursor-pointer rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <IconX className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-6 pt-4 lg:hidden">
          <p className="px-1 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Solutions
          </p>
          {solutions.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {s.label}
            </Link>
          ))}
          <p className="px-1 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Resources
          </p>
          {resources.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {r.label}
            </Link>
          ))}
          <p className="px-1 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Company
          </p>
          {company.concat([{ href: "/pricing", label: "Pricing" }]).map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {r.label}
            </Link>
          ))}
          <div className="mt-5 flex gap-3">
            <Button href="/login" variant="secondary" className="flex-1">
              Sign in
            </Button>
            <Button href="/demo" className="flex-1">
              Get a demo
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
