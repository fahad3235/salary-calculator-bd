# Salary Calculator BD

Offline, bilingual (English / Bangla) salary calculator for Bangladesh.
Turn a gross salary into a payslip: split gross into components, deduct
Provident Fund + income tax + other deductions, and see exact net
take-home pay -- then save one payslip per month and compare over time.

Live: https://fahad3235.github.io/salary-calculator-bd/

## Features

- **Gross-to-net payslip** -- enter gross salary (monthly or yearly), get an
  itemised payslip: Basic / House rent / Medical / Conveyance / Others,
  PF, tax, other deductions, total deductions, net pay, annual gross/net.
- **Editable salary split** -- component percentages are fully editable and
  must add up to 100% (live sum indicator + inline error). The default
  60 / 30 / 5 / 3 / 2 split is a common starting point, not a rule.
- **Provident Fund** -- PF % calculated on Basic or on Gross, your choice.
- **Monthly payslip history** -- save one payslip per month (duplicate months
  rejected), delete entries, data persists in localStorage across reloads.
- **Export / import** -- JSON export/import with strict validation (wrong
  app, wrong version, bad records, duplicate months all rejected, existing
  data left intact). Typed `DELETE` erases everything.
- **Print payslip** -- print-friendly view of the current payslip.
- **Bilingual** -- EN / Bangla toggle, persisted; numbers render in Bengali
  digits in Bangla mode.
- **Exact money math** -- all amounts computed in integer paisa, so
  components always sum to gross exactly (rounding residual goes to Basic).
- **Offline** -- pure static site, zero network requests, no tracking.

## Stack

Vanilla HTML / CSS / JavaScript. No build step, no dependencies, no
framework. Runs from any static host or straight from the file system.

## Run locally

```sh
# any static server, e.g.
npx serve .
# or
python3 -m http.server 8000
```

Then open http://localhost:8000/ -- or just open `index.html` directly.

## Testing

```sh
node tests/unit.test.js    # 40 logic assertions (exact math, validation, import rules)
node tests/smoke.test.js   # 15 headless-Chrome checks via raw CDP
```

The smoke test drives the real page in headless Chromium: default
calculation, recompute, split-sum validation, save / reload persistence,
duplicate-month rejection, delete, Bangla toggle (Bengali digits render),
tab switching, 390px no-overflow, and zero console/page errors.

## Limitations (read before relying on it)

- **The default split is not a law or a company rule.** Match the split to
  your appointment letter / payslip -- every company differs.
- **Tax is entered, not computed.** The monthly income-tax field holds the
  amount you type in (e.g. from your own tax calculation or a tax tool).
  This app does not compute income tax.
- **Planning tool, not payroll software.** Figures are estimates from the
  numbers you enter. Verify against your real payslip.
- History lives in this browser's localStorage only -- export JSON to back
  it up or move it to another device.

## Status

MVP, complete and tested. No backend, no accounts, no data leaves the
browser.
