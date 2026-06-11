"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { IconCheck, IconChevronDown, IconX } from "@/components/icons";

/* ------------------------------- Button ------------------------------- */

const btnVariants = {
  primary:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 focus-visible:outline-emerald-600",
  secondary:
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:outline-slate-400",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-400",
  danger:
    "bg-rose-600 text-white shadow-sm hover:bg-rose-500 focus-visible:outline-rose-600",
  white:
    "bg-white text-slate-900 shadow-sm hover:bg-slate-200 focus-visible:outline-white",
};

const btnSizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

type ButtonProps = {
  variant?: keyof typeof btnVariants;
  size?: keyof typeof btnSizes;
  href?: string;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...rest
}: ButtonProps) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
    btnVariants[variant],
    btnSizes[size],
    className
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/* -------------------------------- Card -------------------------------- */

export function Card({
  children,
  className,
  hover,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
        hover && "transition-all hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}

/* -------------------------------- Badge ------------------------------- */

const badgeTones = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  rose: "bg-rose-50 text-rose-700 ring-rose-600/20",
  slate: "bg-slate-100 text-slate-700 ring-slate-600/10",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
};

export function Badge({
  tone = "slate",
  dot,
  children,
  className,
}: {
  tone?: keyof typeof badgeTones;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        badgeTones[tone],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* -------------------------------- Stat -------------------------------- */

export function Stat({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  trend?: "up" | "down";
}) {
  return (
    <div>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
      {sub && (
        <div
          className={cn(
            "mt-1 text-xs",
            trend === "up"
              ? "text-emerald-600"
              : trend === "down"
                ? "text-rose-600"
                : "text-slate-500"
          )}
        >
          {trend === "up" ? "▲ " : trend === "down" ? "▼ " : ""}
          {sub}
        </div>
      )}
    </div>
  );
}

/* --------------------------- SectionHeading --------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  dark,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "mt-2 text-3xl font-semibold tracking-tight sm:text-4xl",
          dark ? "text-white" : "text-slate-900"
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 text-lg", dark ? "text-slate-300" : "text-slate-600")}>
          {description}
        </p>
      )}
    </div>
  );
}

/* ------------------------------- Inputs ------------------------------- */

type InputProps = {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function Input({ label, hint, error, className, id, ...rest }: InputProps) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:-outline-offset-1",
          error
            ? "border-rose-400 focus:outline-rose-500"
            : "border-slate-300 focus:outline-emerald-600"
        )}
        {...rest}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

type TextareaProps = {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({
  label,
  hint,
  error,
  className,
  id,
  ...rest
}: TextareaProps) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "min-h-28 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:-outline-offset-1",
          error
            ? "border-rose-400 focus:outline-rose-500"
            : "border-slate-300 focus:outline-emerald-600"
        )}
        {...rest}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

type SelectProps = {
  label?: string;
  error?: string;
  className?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
} & SelectHTMLAttributes<HTMLSelectElement>;

export function Select({
  label,
  error,
  className,
  placeholder,
  options,
  id,
  ...rest
}: SelectProps) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          "w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-2 focus:-outline-offset-1",
          error
            ? "border-rose-400 focus:outline-rose-500"
            : "border-slate-300 focus:outline-emerald-600"
        )}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

/* ------------------------------- Toggle ------------------------------- */

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors",
          checked ? "bg-emerald-600" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5"
          )}
        />
      </button>
      {label && (
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className="cursor-pointer text-sm text-slate-700"
        >
          {label}
        </button>
      )}
    </span>
  );
}

/* ------------------------------- Slider ------------------------------- */

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format,
}: {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-4">
        {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
        <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-sm font-semibold tabular-nums text-emerald-700">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-600"
      />
    </div>
  );
}

/* -------------------------------- Tabs -------------------------------- */

export function Tabs({
  tabs,
  active,
  onChange,
  variant = "pill",
  className,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  variant?: "pill" | "underline";
  className?: string;
}) {
  if (variant === "underline") {
    return (
      <div className={cn("flex gap-6 overflow-x-auto border-b border-slate-200", className)}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "-mb-px shrink-0 cursor-pointer border-b-2 pb-3 text-sm font-medium transition-colors",
              active === t.id
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1",
        className
      )}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
            active === t.id
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ----------------------------- Accordion ------------------------------ */

export function AccordionItem({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left"
      >
        <span>
          <span className="block text-base font-medium text-slate-900">{title}</span>
          {subtitle && (
            <span className="mt-0.5 block text-sm text-slate-500">{subtitle}</span>
          )}
        </span>
        <IconChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-5 text-sm leading-relaxed text-slate-600">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Modal ------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close dialog"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------- ProgressSteps --------------------------- */

export function ProgressSteps({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => (
        <li key={s} className="flex flex-1 items-center gap-2 last:flex-none">
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              i < current
                ? "bg-emerald-600 text-white"
                : i === current
                  ? "border-2 border-emerald-600 text-emerald-700"
                  : "border border-slate-300 text-slate-400"
            )}
          >
            {i < current ? <IconCheck className="h-4 w-4" /> : i + 1}
          </span>
          <span
            className={cn(
              "hidden whitespace-nowrap text-sm sm:block",
              i === current ? "font-medium text-slate-900" : "text-slate-500"
            )}
          >
            {s}
          </span>
          {i < steps.length - 1 && (
            <span
              className={cn(
                "h-px min-w-4 flex-1",
                i < current ? "bg-emerald-600" : "bg-slate-200"
              )}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------- Spinner ------------------------------ */

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-label="Loading"
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600",
        className
      )}
    />
  );
}

/* ------------------------------ EmptyState ---------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-14 text-center">
      {icon && <div className="mb-3 text-slate-400">{icon}</div>}
      <p className="text-base font-medium text-slate-900">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
