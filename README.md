# Code Ninjas Yorba Linda — Invoice Creator

A single-page web app for generating enrichment-service invoices for schools/organizations.
Fill in the form, review the live preview, then **Save as PDF / Print**.

**Live site:** https://invoice-create-five.vercel.app
**Source:** `index.html` (everything is in this one file — no build step, no server)

## Programs & prices

| Program        | Default price |
| -------------- | ------------- |
| Create Lite    | $229 |
| Create Regular | $299 |
| Create 1x      | $229 |
| Create 2x      | $299 |
| Create 4x      | $399 |
| JR 1x          | $229 |
| JR 2x          | $299 |
| Custom…        | type any program name + amount |

- Picking a program auto-fills its amount; the amount is still editable per invoice.
- Edited prices are remembered in the browser for next time.

## How fields work

- **Invoice number** — auto-generated as `[first initial][last initial][MM][YY]`, where **MM is the Month of Service** (not the invoice date) and YY comes from the invoice date. Example: Angel Gomez, July 2026 → `AG0726`. Typing in the field overrides the auto value.
- **Invoice date** — defaults to today.
- **Month of Service** — defaults to the current month; drives the invoice-number month and the description line.
- **Description line** — assembled as `Name Month Program Service Code: ###`.
- **Bill To (school)** — save a school's name / address / email once, then reload it from the "Saved schools" dropdown. Stored per-browser.
- **Add new order** — bill multiple students on one invoice; the total sums automatically.

## Updating the site

Edit `index.html`, then redeploy:

```bash
vercel deploy --prod
```

Same URL, new version.
