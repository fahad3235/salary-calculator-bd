# TEST_RESULTS -- salary-calculator-bd (run 11:00 slot, 2026-10-15)

## Unit tests -- 40/40 passed
`node tests/unit.test.js`

Hand-verified math:
- Default case (gross 60,000; split 60/30/5/3/2; PF 10% of basic):
  basic 36,000; house rent 18,000; medical 3,000; conveyance 1,800;
  others 1,200; PF 3,600; net 56,400; annual gross 720,000; annual net 676,800.
- PF on gross: 6,000; net 54,000.
- Tax 1,500 + other 500: deductions 5,600; net 54,400.
- Yearly gross 720,000 -> monthly 60,000, same net 56,400.
- Rounding: gross 100.05 with 33.33/33.33/33.34/0/0 split -- components sum
  to exactly 100.05 in integer paisa (residual to Basic).
- Validation: split sum != 100, negative/zero gross, PF 51%, negative tax,
  deductions == gross (PF 50% of basic 18,000 + tax 42,000), bad period.
- Import: wrong app / wrong version / duplicate month / bad record rejected.

Repairs: 1 test-side fix only -- the deductions-exceeds-gross test used
tax 40,000, which totals 58,000 < 60,000 gross (no rejection expected);
corrected to tax 42,000 (total exactly 60,000). 0 app bugs.

## Headless-Chrome smoke -- 15/15 passed
`node tests/smoke.test.js` (raw CDP, /opt/meta-chromium/chrome, file://)

- Title, default net 56,400.00, split sum 100%.
- Gross 100,000 -> net 94,000.00; split sum 90 -> inline error; restore -> 56,400.00.
- Save payslip for 2026-10; persists across Page.reload; duplicate month rejected; delete removes it.
- Bangla toggle renders Bengali digits + Bengali app title; toggle back to EN.
- Payslips tab shows; 390px viewport: scrollWidth <= 390 (no overflow).
- Zero console errors, zero page errors.

## Hygiene
- All source files pure ASCII (Bengali as \uXXXX escapes in JS, English-only
  HTML); verified with `grep -P '[^\x00-\x7F]'`.
- Zero network requests by design (static files only).
