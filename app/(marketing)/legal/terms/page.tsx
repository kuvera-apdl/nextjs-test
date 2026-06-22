"use client";

import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal";

const sections: LegalSection[] = [
  {
    id: "acceptance",
    heading: "Agreement to these terms",
    body: (
      <>
        <p>
          These Terms of Service (“Terms”) govern your use of the Keelstone
          Financial demonstration website and dashboard (the “Service”). By
          accessing or using the Service, you agree to these Terms. If you do not
          agree, do not use the Service.
        </p>
        <p>
          Keelstone Financial is a fictional company; these Terms are sample text
          and form part of a demonstration, not a binding commercial agreement.
        </p>
      </>
    ),
  },
  {
    id: "service",
    heading: "What the Service is",
    body: (
      <>
        <p>
          The Service is an interactive demonstration of a financial-operations
          platform. It exists to showcase user interfaces and flows and to serve
          as a fixture for development and integration testing. It does not
          provide any real product, account, or financial capability.
        </p>
      </>
    ),
  },
  {
    id: "no-advice",
    heading: "No financial services or advice",
    body: (
      <>
        <p>
          Nothing in the Service constitutes banking, payment, lending,
          investment, tax, or legal services, nor any form of advice. Figures,
          rates, calculators, and projections are illustrative and may be
          inaccurate. Do not rely on anything here for real financial decisions.
          See our <Link href="/legal/disclaimer">Disclaimer</Link>.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    heading: "Demo accounts and credentials",
    body: (
      <>
        <p>
          The dashboard is accessible with shared demo credentials provided on
          the <Link href="/login">sign-in page</Link>. Demo accounts are not
          personal to you, hold no real value, and may be reset at any time. Do
          not store anything in a demo account that you are not comfortable
          losing or having others see.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    heading: "Acceptable use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>
            <span>
              enter real personal, financial, or otherwise sensitive information;
            </span>
          </li>
          <li>
            <span>
              attempt to breach, overload, or disrupt the Service or the systems
              hosting it;
            </span>
          </li>
          <li>
            <span>
              use the Service to store or transmit unlawful, infringing, or
              malicious content; or
            </span>
          </li>
          <li>
            <span>
              misrepresent the Service as a real financial product to others.
            </span>
          </li>
        </ul>
        <p>
          Automated and scripted access for legitimate testing is expressly
          permitted, provided it is reasonable and non-disruptive.
        </p>
      </>
    ),
  },
  {
    id: "ip",
    heading: "Intellectual property",
    body: (
      <>
        <p>
          The Service, including its design, text, and code, is provided for
          demonstration purposes. The “Keelstone Financial” name and branding are
          invented for this demo. Any resemblance to real companies, marks, or
          products is coincidental.
        </p>
      </>
    ),
  },
  {
    id: "thirdparty",
    heading: "Third-party names and data",
    body: (
      <>
        <p>
          Customer names, people, logos, transactions, and metrics shown in the
          Service are fabricated for illustration. They do not represent real
          entities or real activity, and no endorsement or relationship is
          implied.
        </p>
      </>
    ),
  },
  {
    id: "warranty",
    heading: "Disclaimer of warranties",
    body: (
      <>
        <p>
          The Service is provided “as is” and “as available”, without warranties
          of any kind, whether express or implied, including merchantability,
          fitness for a particular purpose, and non-infringement. We do not
          warrant that the Service will be uninterrupted, error-free, or secure.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    heading: "Limitation of liability",
    body: (
      <>
        <p>
          To the fullest extent permitted by law, Keelstone and its contributors
          will not be liable for any indirect, incidental, special,
          consequential, or punitive damages, or any loss of data, arising from
          your use of this demonstration Service. The Service has no fees and
          carries no commercial value.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    heading: "Indemnification",
    body: (
      <>
        <p>
          You agree to hold Keelstone and its contributors harmless from claims
          arising out of your misuse of the Service or your violation of these
          Terms, including any decision to enter real data against this guidance.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    heading: "Suspension and termination",
    body: (
      <>
        <p>
          We may modify, suspend, reset, or discontinue any part of the Service
          at any time without notice. Demo data may be cleared during routine
          restarts.
        </p>
      </>
    ),
  },
  {
    id: "law",
    heading: "Governing law",
    body: (
      <>
        <p>
          A real agreement would specify a governing law and dispute-resolution
          venue. As a fictional demo, these Terms designate none and create no
          enforceable obligations.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    heading: "Changes to these terms",
    body: (
      <>
        <p>
          We may revise these Terms as the demo changes. Continued use after an
          update constitutes acceptance of the revised Terms. The “last updated”
          date above reflects the current version.
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
          Questions about these Terms can be sent through our{" "}
          <Link href="/contact">contact form</Link>.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      slug="terms"
      title="Terms of Service"
      intro="The rules for using this demonstration application. In short: it is a fictional sandbox, use placeholder data, and rely on nothing here for real decisions."
      keyPoints={[
        "The Service is a demo — not a real financial product or advice.",
        "Use placeholder data; demo accounts are shared and may reset anytime.",
        "Reasonable automated and scripted testing is expressly allowed.",
        "Provided “as is”, with no warranties and no liability.",
      ]}
      sections={sections}
    />
  );
}
