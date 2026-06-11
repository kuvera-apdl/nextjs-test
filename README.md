# Meridian Financial

A **fictional** B2B financial-services platform — global payments, treasury management, business lending, and corporate cards — built as a fullstack Next.js demo application. Nothing here is a real financial product; all companies, people, numbers, and claims are invented.

The site is intentionally feature-dense: 20 unique pages, each with its own interactive elements, backed by real API routes and an in-memory data store. It is designed to be used as a standalone playground / integration target for testing tooling against a realistic multi-page web app.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Hand-rolled SVG charts (no chart libraries)
- In-memory server-side data store (`lib/store.ts`) — data reseeds on every server restart, mutations persist while the server runs

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo dashboard credentials

| Field    | Value                   |
| -------- | ----------------------- |
| Email    | `demo@meridian.example` |
| Password | `northstar`             |

Sign in at `/login` to access the client dashboard (`/dashboard`).

## Pages (20)

| Route                        | Highlights                                                              |
| ---------------------------- | ----------------------------------------------------------------------- |
| `/`                          | Animated stats, tabbed product showcase, logo marquee, testimonials     |
| `/solutions/payments`        | Payment-cost savings calculator, rail comparison tabs                   |
| `/solutions/treasury`        | Cash-flow projection simulator, allocation donut                        |
| `/solutions/lending`         | Loan calculator with amortization, eligibility checker                  |
| `/solutions/corporate-cards` | Live card customizer, spend-control sliders, rewards calculator         |
| `/pricing`                   | Monthly/annual toggle, volume slider, comparison table                  |
| `/about`                     | Interactive timeline, leadership bios in modals                         |
| `/careers`                   | API-backed job board with filters, application modal                    |
| `/contact`                   | Validated contact form (POST `/api/contact`)                            |
| `/demo`                      | Multi-step demo request wizard (POST `/api/demo`)                       |
| `/resources/blog`            | Searchable, tag-filtered blog (API-backed)                              |
| `/resources/blog/[slug]`     | Reading progress bar, like button, table of contents                    |
| `/resources/faq`             | Searchable FAQ accordion with categories                                |
| `/tools/fx-converter`        | Live FX converter backed by `/api/fx`                                   |
| `/developers`                | API reference with language tabs, copy buttons, live "try it" panel     |
| `/status`                    | Auto-polling system status, 90-day uptime bars, incident history        |
| `/login`                     | Cookie-based mock auth                                                  |
| `/dashboard`                 | KPIs, cash-flow chart, sortable/filterable transactions, CSV export     |
| `/dashboard/invoices`        | Full invoice CRUD (create, mark paid, void, delete)                     |
| `/dashboard/payments`        | Payment initiation; payments auto-settle server-side after ~25 seconds  |

## API routes

`/api/auth/login` · `/api/auth/logout` · `/api/auth/me` · `/api/contact` · `/api/demo` · `/api/newsletter` · `/api/jobs` · `/api/posts` · `/api/posts/[slug]` · `/api/posts/[slug]/like` · `/api/fx` · `/api/status` · `/api/v1/ping` · `/api/metrics` · `/api/transactions` · `/api/invoices` · `/api/invoices/[id]` · `/api/payments` · `/api/payments/[id]` · `/api/beneficiaries`

All routes are dynamic (no caching) and operate on the shared in-memory store.
