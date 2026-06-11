import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
        404
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
        This page does not exist
      </h1>
      <p className="mt-4 max-w-md text-slate-600">
        The page you are looking for was moved, renamed, or never shipped.
        Let&apos;s get you back to solid ground.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-500"
      >
        Back to homepage
      </Link>
    </div>
  );
}
