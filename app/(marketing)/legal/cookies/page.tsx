"use client";

import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal";

const sections: LegalSection[] = [
  {
    id: "what",
    heading: "What cookies are",
    body: (
      <>
        <p>
          Cookies are small text files a website stores in your browser. They are
          widely used to keep you signed in, remember preferences, and measure
          usage. This Cookie Policy explains the cookies used by the Keelstone
          Financial demo and how to control them.
        </p>
      </>
    ),
  },
  {
    id: "use",
    heading: "How we use cookies",
    body: (
      <>
        <p>
          The demo uses cookies for one purpose only: to keep you signed in to
          the dashboard while you explore it. We do not use cookies for
          analytics, advertising, or tracking you across other websites.
        </p>
      </>
    ),
  },
  {
    id: "list",
    heading: "Cookies we set",
    body: (
      <>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Cookie</th>
                <th className="px-4 py-3 font-medium">Purpose</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-mono text-slate-900">
                  mf_session
                </td>
                <td className="px-4 py-3 text-slate-600">
                  Maintains your signed-in dashboard session. HTTP-only and
                  same-site.
                </td>
                <td className="px-4 py-3 text-slate-600">Strictly necessary</td>
                <td className="px-4 py-3 text-slate-600">
                  24 hours, or on sign-out
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          This is the only cookie the application sets. It contains a random
          session identifier and no personal information.
        </p>
      </>
    ),
  },
  {
    id: "no-tracking",
    heading: "No advertising or analytics cookies",
    body: (
      <>
        <p>
          The demo includes no third-party analytics, advertising, social, or
          fingerprinting technologies. There are no tracking pixels, and no data
          is shared with marketing networks. Because the only cookie is strictly
          necessary, no consent banner is required to use the site.
        </p>
      </>
    ),
  },
  {
    id: "manage",
    heading: "Managing cookies",
    body: (
      <>
        <p>
          You can view and delete cookies, and block them entirely, from your
          browser settings. Signing out of the dashboard also clears the session
          cookie. If you block the session cookie, the marketing pages will still
          work, but you will not be able to stay signed in to the dashboard.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    body: (
      <>
        <p>
          If the demo begins using additional cookies, this page and the table
          above will be updated. The “last updated” date reflects the current
          version.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    heading: "Contact",
    body: (
      <>
        <p>
          Questions about cookies can be sent through our{" "}
          <Link href="/contact">contact form</Link>. See also our{" "}
          <Link href="/legal/privacy">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      slug="cookies"
      title="Cookie Policy"
      intro="This demo uses exactly one cookie. Here is what it does and how to control it."
      keyPoints={[
        "Only one cookie is set: a strictly-necessary session cookie.",
        "No analytics, advertising, or cross-site tracking cookies.",
        "It is HTTP-only, holds a random session id, and expires in 24 hours.",
        "Clear it anytime from your browser or by signing out.",
      ]}
      sections={sections}
    />
  );
}
