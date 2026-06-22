"use client";

import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal";

const sections: LegalSection[] = [
  {
    id: "scope",
    heading: "Scope of this policy",
    body: (
      <>
        <p>
          This Privacy Policy explains how Keelstone Financial (“Keelstone”, “we”,
          “us”) would handle personal information across this website and the
          associated demo dashboard. Because Keelstone is a fictional company and
          this is a demonstration application, the policy is sample text written
          to mirror how a real financial-operations platform documents its
          practices.
        </p>
        <p>
          <strong>
            Do not submit real personal or financial data through this site.
          </strong>{" "}
          Use placeholder values. Anything you do enter is handled as described
          in the <a href="#retention">Data retention</a> section below.
        </p>
      </>
    ),
  },
  {
    id: "collect",
    heading: "Information we collect",
    body: (
      <>
        <p>In the course of running this demo, the application may receive:</p>
        <ul>
          <li>
            <span>
              <strong>Information you provide.</strong> Form submissions such as
              the contact, demo-request, newsletter, and job-application forms,
              plus any invoices or payments you create inside the dashboard.
            </span>
          </li>
          <li>
            <span>
              <strong>Account and session data.</strong> When you sign in with
              the demo credentials, we create a short-lived session identified by
              a cookie. See our{" "}
              <Link href="/legal/cookies">Cookie Policy</Link>.
            </span>
          </li>
          <li>
            <span>
              <strong>Technical request data.</strong> Standard information your
              browser sends with each request, used only to serve the page.
            </span>
          </li>
        </ul>
        <p>
          The demo does not ask for and does not knowingly process real
          government identifiers, bank account numbers, card numbers, or other
          sensitive financial information.
        </p>
      </>
    ),
  },
  {
    id: "use",
    heading: "How we use information",
    body: (
      <>
        <p>
          Information submitted to the demo is used solely to make the demo
          function — for example, to display an invoice you just created, to
          return a confirmation reference, or to keep you signed in while you
          explore the dashboard. We do not use it for advertising, profiling, or
          automated decision-making, and we do not sell it.
        </p>
      </>
    ),
  },
  {
    id: "legal-bases",
    heading: "Legal bases (GDPR)",
    body: (
      <>
        <p>
          Where the EU General Data Protection Regulation applies, a real
          operator would rely on legal bases such as performance of a contract,
          legitimate interests, consent, and compliance with legal obligations.
          As a fictional demo, Keelstone asserts no such bases and undertakes no
          processing beyond the in-memory handling described here.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies and similar technologies",
    body: (
      <>
        <p>
          This site uses a single strictly-necessary cookie to maintain your
          signed-in session in the demo dashboard. It does not use analytics,
          advertising, or cross-site tracking cookies. Full details are in the{" "}
          <Link href="/legal/cookies">Cookie Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    heading: "How we share information",
    body: (
      <>
        <p>
          We do not share demo data with third parties. There are no advertising
          networks, data brokers, or analytics processors connected to this
          application. A real platform would disclose any sub-processors,
          regulators, and circumstances such as corporate transactions here.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    heading: "Data retention",
    body: (
      <>
        <p>
          <strong>This is the important part.</strong> Information you submit
          through the demo — form entries, sessions, and any invoices or payments
          you create — is held only in the server’s volatile memory. It is{" "}
          <strong>not written to a database</strong> and is{" "}
          <strong>permanently discarded whenever the demo server restarts</strong>
          . We do not back it up, export it, or reuse it for any purpose beyond
          making the demo work during your visit.
        </p>
      </>
    ),
  },
  {
    id: "security",
    heading: "Security",
    body: (
      <>
        <p>
          The demo follows reasonable web hygiene (for example, session cookies
          are HTTP-only). However, it is an illustrative application and should
          not be treated as a secure system of record. Never store real or
          sensitive information in it.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    heading: "Your privacy rights",
    body: (
      <>
        <p>
          Depending on where you live, privacy laws such as the GDPR and the
          California Consumer Privacy Act grant rights to access, correct, delete,
          port, or restrict the processing of your personal information, and to
          object or withdraw consent.
        </p>
        <p>
          In this demo those rights are effectively automatic: because data lives
          only in memory and is erased on restart, no durable record of you is
          retained. There is nothing for us to sell, and nothing to delete beyond
          the current session.
        </p>
      </>
    ),
  },
  {
    id: "intl",
    heading: "International data transfers",
    body: (
      <>
        <p>
          A real operator would describe safeguards (such as standard
          contractual clauses) for transferring data across borders. This demo
          performs no such transfers; data does not leave the process serving the
          page.
        </p>
      </>
    ),
  },
  {
    id: "children",
    heading: "Children’s privacy",
    body: (
      <>
        <p>
          Keelstone is a business-to-business demo and is not directed to
          children. We do not knowingly collect information from anyone under 16.
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
          We may update this sample policy as the demo evolves. The “last
          updated” date at the top reflects the most recent revision. Material
          changes to a real policy would be communicated to affected users.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    heading: "Contact us",
    body: (
      <>
        <p>
          Questions about this policy can be sent through our{" "}
          <Link href="/contact">contact form</Link>. In a real deployment, a
          privacy team at <span className="font-mono">privacy@keelstone.example</span>{" "}
          would respond; here, your message is simply recorded in memory.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      slug="privacy"
      title="Privacy Policy"
      intro="How the Keelstone Financial demo handles the information you enter — and why there is very little of it to handle."
      keyPoints={[
        "Keelstone is fictional; please use placeholder data only.",
        "Submitted data stays in server memory and is erased when the demo restarts.",
        "No analytics, advertising, tracking, or data sales of any kind.",
        "One strictly-necessary cookie keeps you signed in to the dashboard.",
      ]}
      sections={sections}
    />
  );
}
