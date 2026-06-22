# Seeded UX pain points (ground truth)

This file is the ground-truth record of intentionally-seeded usability bugs in the
Keelstone Financial demo app. They were planted to give experience-monitoring and
session-analysis tooling a realistic corpus of pain points to detect and rank.

Each issue is written to look like an ordinary developer mistake (a dropped
normalization, a leftover debug constant, a wrong variable, a decimal typo, a
missing scroll wrapper, a typo'd link). They are spread across 10 different areas
so no single page reads as deliberately broken. The app still compiles cleanly
(`tsc --noEmit` passes) and every page renders — the bugs degrade the *experience*,
they don't crash the build.

This file is documentation only. It is not imported, served, or referenced by the
running application. Delete it (or `git stash` it) before any test where the model
under evaluation must not see the answer key.

| ID | Area | Route | Pain signal |
|----|------|-------|-------------|
| PP-01 | Dashboard · transactions search | `/dashboard` | Search returns nothing for normal queries |
| PP-02 | Dashboard · payments | `/dashboard/payments` | Payment "Processing" far longer than promised |
| PP-03 | Demo request form | `/demo` | Valid work emails rejected; can't submit |
| PP-04 | Payments savings calculator | `/solutions/payments` | Impossible savings % (>100%) |
| PP-05 | Lending amortization table | `/solutions/lending` | Table overflows the viewport on narrow screens |
| PP-06 | Footer (global) | every page → `/resources/faqs` | "Help & FAQ" link 404s |
| PP-07 | FX converter | `/tools/fx-converter` | Swap button collapses both sides to one currency |
| PP-08 | Pricing | `/pricing` | Annual toggle doesn't discount the headline price |
| PP-09 | Corporate cards rewards | `/solutions/corporate-cards` | Cashback estimate 10× too low vs the stated rate |
| PP-10 | Dashboard · invoices | `/dashboard/invoices` | "Outstanding" doesn't drop when an invoice is paid |

---

## PP-01 — Transaction search is case-sensitive (returns nothing)

- **File:** `app/dashboard/page.tsx` (`filtered` memo)
- **Symptom:** Typing a normal query into the transactions search ("payroll",
  "halcyon", "cloud") returns "No matching transactions." Only an exact-case match
  ("Payroll") works.
- **Cause:** The query is lower-cased but the haystack is no longer lower-cased, so
  the `.includes()` comparison never matches mixed-case descriptions.
- **Signal:** Repeated typing / retyping in the search box, empty-state views,
  search abandonment. Login required (`demo@keelstone.example` / `northstar`).

## PP-02 — Payments settle much slower than the UI promises

- **File:** `app/api/payments/route.ts` (`SETTLE_AFTER_MS`)
- **Symptom:** The composer toast and the "Sandbox behavior" note both say a payment
  settles in "~25 seconds," but a new payment stays in **Processing** for ~60s. The
  page keeps polling and the row sits in the spinner state past the promised time.
- **Cause:** Settlement delay constant left at `60000` ms while the copy still says 25s.
- **Signal:** Long dwell on a "processing" state, repeated polling/refresh, possible
  rage-clicks on **Cancel** while waiting.

## PP-03 — Demo form rejects valid work emails

- **File:** `app/(marketing)/demo/page.tsx` (`EMAIL_RE`)
- **Symptom:** On the final step, real addresses are rejected with "That doesn't look
  like a valid email address" — e.g. `name@company.ventures`, `name@startup.finance`,
  `first.last@sub.company.com`, `name+tag@company.com`. The form can't be submitted.
- **Cause:** The client-side regex was tightened to `\.[a-zA-Z]{2,3}$` with no plus or
  multi-dot support, so any TLD longer than 3 letters (or any subdomain / plus tag)
  fails. The server still accepts them, so it's a pure front-end gate.
- **Signal:** Repeated submit attempts, field-level error churn, wizard abandonment on
  the last step.

## PP-04 — Savings calculator shows an impossible percentage

- **File:** `app/(marketing)/solutions/payments/page.tsx` (`pct`)
- **Symptom:** The savings card reads "about **340%** lower than your legacy bank" at
  the default sliders, and stays above 100% across most settings.
- **Cause:** The percentage divides savings by the *Keelstone* cost instead of the
  *legacy* cost, so it can exceed 100%.
- **Signal:** A visibly nonsensical headline number on a trust-building calculator —
  a data-correctness pain a reader will distrust.

## PP-05 — Loan amortization table overflows on narrow screens

- **File:** `app/(marketing)/solutions/lending/page.tsx` (schedule table wrapper)
- **Symptom:** On phones/tablets (and a narrow window) the amortization table pushes
  the page wider than the viewport, causing horizontal scrolling and clipped content.
- **Cause:** The `overflow-x-auto` scroll wrapper was dropped from the table container
  while the table keeps its `min-w-130` (≈520px) minimum width.
- **Signal:** Horizontal page scrolling, pinch-zoom, content cut off — a responsive
  layout breakage most visible at mobile widths.

## PP-06 — Footer "Help & FAQ" link 404s

- **File:** `components/footer.tsx` (Resources column)
- **Symptom:** The footer "Help & FAQ" link (present on every page) points at
  `/resources/faqs`, which does not exist and renders the not-found page. The real
  page is `/resources/faq`, and the top-nav link to it still works.
- **Cause:** Trailing-`s` typo in the href; the nav and footer drifted out of sync.
- **Signal:** Dead click → 404 / not-found landing, back-button bounce. High exposure
  because the footer is global.

## PP-07 — FX converter swap button is broken

- **File:** `app/(marketing)/tools/fx-converter/page.tsx` (`swap`)
- **Symptom:** Clicking the swap (⟳) button sets **both** the From and To selects to
  the same currency, so the result becomes a 1:1 self-conversion ("1 USD = 1.0000
  USD"). Clicking again doesn't recover it.
- **Cause:** Typo in the swap handler — both selects are set to the old `to` value
  instead of swapping `from` and `to`.
- **Signal:** Dead/rage-clicks on the swap control, obviously-wrong conversion output.

## PP-08 — Annual billing toggle doesn't discount the price

- **File:** `app/(marketing)/pricing/page.tsx` (`platformFee`)
- **Symptom:** Switching Monthly → Annual flips the toggle, the "–20%" badge, and the
  fine print (which shows a struck-through price "billed annually"), but the big
  headline price (e.g. Scale **$499**) never changes — the struck-through price equals
  the shown price.
- **Cause:** `platformFee` returns the monthly amount unconditionally; the 20% annual
  discount is no longer applied to the headline figure.
- **Signal:** A control that visibly "does nothing" to the primary number, repeated
  toggling, mismatch between the discount messaging and the price shown.

## PP-09 — Corporate-card cashback estimate is 10× too low

- **File:** `app/(marketing)/solutions/corporate-cards/page.tsx` (`annual`)
- **Symptom:** At the default $60K/mo spend the rewards card shows "$1,080" estimated
  annual cashback while the surrounding copy promises "a flat **1.5%** on all spend"
  (1.5% of $720K/yr is $10,800). The number contradicts the stated rate.
- **Cause:** Decimal typo — the rate is `0.0015` (0.15%) instead of `0.015` (1.5%).
- **Signal:** A quiet numeric inconsistency between the headline figure and the stated
  rate; lower severity / easy to miss, useful for testing detection sensitivity.

## PP-10 — "Outstanding" total ignores that invoices were paid

- **File:** `app/dashboard/invoices/page.tsx` (`outstandingUsd` memo)
- **Symptom:** Marking a USD invoice **Paid** does not reduce the "Outstanding"
  headline stat — the number stays put even though the receivable was settled.
- **Cause:** The outstanding sum includes `paid` invoices alongside `sent`/`overdue`,
  so settling one keeps it counted.
- **Signal:** An action with no effect on the metric it should move; users re-click
  "Mark paid", refresh, and distrust the summary. Login required.
