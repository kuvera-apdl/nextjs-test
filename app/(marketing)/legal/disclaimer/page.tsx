"use client";

import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal";

const sections: LegalSection[] = [
  {
    id: "fictional",
    heading: "Fictional company and demonstration",
    body: (
      <>
        <p>
          Keelstone Financial is a <strong>fictional company</strong>. This
          website and dashboard are a <strong>demonstration application</strong>{" "}
          created to showcase product interfaces and to serve as a sandbox for
          development and testing. There is no real Keelstone Financial entity,
          and no relationship is created by using this site.
        </p>
      </>
    ),
  },
  {
    id: "no-advice",
    heading: "Not financial, legal, or tax advice",
    body: (
      <>
        <p>
          Nothing on this site is financial, investment, banking, legal, or tax
          advice, or an offer or solicitation of any kind. Calculators, rates,
          yields, runway figures, and projections are illustrative, may be
          simplified or wrong, and must not be relied upon for any real decision.
        </p>
      </>
    ),
  },
  {
    id: "no-services",
    heading: "No real accounts or money movement",
    body: (
      <>
        <p>
          The Service does not hold funds, open accounts, issue cards, extend
          credit, or move money. “Payments”, “invoices”, “balances”, and similar
          features are simulations operating on fabricated data. For example,
          payments created in the dashboard change state on a timer to mimic
          settlement — no real transaction occurs.
        </p>
      </>
    ),
  },
  {
    id: "data",
    heading: "Sample data and figures",
    body: (
      <>
        <p>
          All numbers, charts, transactions, and statistics are generated for
          illustration. They are not real, not audited, and should not be cited
          as factual. Compliance badges and certifications shown in the interface
          are decorative and do not represent real attestations.
        </p>
      </>
    ),
  },
  {
    id: "thirdparty",
    heading: "Customer and third-party names",
    body: (
      <>
        <p>
          Company names, people, quotes, and testimonials are invented. Any
          resemblance to real organizations or individuals is coincidental. No
          endorsement, partnership, or affiliation is implied.
        </p>
      </>
    ),
  },
  {
    id: "testing",
    heading: "Demonstration and integration-testing use",
    body: (
      <>
        <p>
          This application is intended to be connected to other tools and
          exercised by automated systems as a <strong>test fixture</strong>.
          Because it contains no real data and performs no real transactions, it
          is safe to script and integrate against for development and quality
          assurance.
        </p>
        <p>
          You remain responsible for how you operate any system you connect to
          it, and for following the <Link href="/legal/terms">Terms of Service</Link>
          . Do not introduce real or sensitive data into the demo through an
          integration.
        </p>
      </>
    ),
  },
  {
    id: "warranty",
    heading: "No warranty",
    body: (
      <>
        <p>
          The Service is provided “as is”, without warranty of any kind and
          without any guarantee of accuracy, availability, or fitness for a
          particular purpose. Use it at your own risk. See the{" "}
          <Link href="/legal/terms">Terms of Service</Link> for the full
          disclaimer and limitation of liability.
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
          Questions about this disclaimer can be sent through our{" "}
          <Link href="/contact">contact form</Link>.
        </p>
      </>
    ),
  },
];

export default function DisclaimerPage() {
  return (
    <LegalPage
      slug="disclaimer"
      title="Disclaimer"
      intro="The single most important page here: everything on this site is fictional, simulated, and safe to test against."
      keyPoints={[
        "Keelstone Financial is fictional; the site is a demonstration.",
        "No real accounts, money movement, advice, or attestations.",
        "All names, figures, and transactions are fabricated for illustration.",
        "Built to be safely scripted and integrated against as a test fixture.",
      ]}
      sections={sections}
    />
  );
}
