'use strict';
/* Unit tests for salary-calculator-bd logic. Run: node tests/unit.test.js */
var L = require('../js/logic.js');
var pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(a, b) { return Math.abs(a - b) < 0.001; }
function throwsCode(fn, code) {
  try { fn(); return false; } catch (e) { return e.code === code; }
}
var base = { gross: 60000, grossPeriod: 'monthly', split: L.defaultSplit(), pfPercent: 10, pfBase: 'basic', taxMonthly: 0, otherDeductions: 0 };

// Default case: 60000 gross, 60/30/5/3/2 split, PF 10% of basic
var r = L.computePayslip(base);
check('default basic 36000', eq(r.components.basic, 36000), r.components);
check('default houseRent 18000', eq(r.components.houseRent, 18000), r.components);
check('default medical 3000', eq(r.components.medical, 3000), r.components);
check('default conveyance 1800', eq(r.components.conveyance, 1800), r.components);
check('default others 1200', eq(r.components.others, 1200), r.components);
check('components sum = gross', eq(r.components.basic + r.components.houseRent + r.components.medical + r.components.conveyance + r.components.others, 60000), r.components);
check('default PF 3600 (10% of basic)', eq(r.pf, 3600), r.pf);
check('default net 56400', eq(r.net, 56400), r.net);
check('default annual gross 720000', eq(r.annualGross, 720000), r.annualGross);
check('default annual net 676800', eq(r.annualNet, 676800), r.annualNet);

// PF on gross
var r2 = L.computePayslip(Object.assign({}, base, { pfBase: 'gross' }));
check('PF on gross 6000', eq(r2.pf, 6000), r2.pf);
check('net with PF on gross 54000', eq(r2.net, 54000), r2.net);

// Tax + other deductions
var r3 = L.computePayslip(Object.assign({}, base, { taxMonthly: 1500, otherDeductions: 500 }));
check('deductions 5600', eq(r3.deductions, 5600), r3.deductions);
check('net with tax+other 54400', eq(r3.net, 54400), r3.net);

// Yearly gross: 720000/year -> 60000/month
var r4 = L.computePayslip(Object.assign({}, base, { gross: 720000, grossPeriod: 'yearly' }));
check('yearly -> monthly gross 60000', eq(r4.monthlyGross, 60000), r4.monthlyGross);
check('yearly -> same net 56400', eq(r4.net, 56400), r4.net);

// Rounding residual: gross 100.05 with 33.33/33.33/33.34/0/0 split
var r5 = L.computePayslip({ gross: 100.05, grossPeriod: 'monthly', split: { basic: 33.33, houseRent: 33.33, medical: 33.34, conveyance: 0, others: 0 }, pfPercent: 0, pfBase: 'basic', taxMonthly: 0, otherDeductions: 0 });
check('rounding: components sum exactly gross', eq(r5.components.basic + r5.components.houseRent + r5.components.medical + r5.components.conveyance + r5.components.others, 100.05), r5.components);
check('rounding: paisa integers exact', r5.paisa.components.basic + r5.paisa.components.houseRent + r5.paisa.components.medical + r5.paisa.components.conveyance + r5.paisa.components.others === 10005, r5.paisa.components);

// Validation
check('split sum 99 rejected', throwsCode(function () {
  L.computePayslip(Object.assign({}, base, { split: { basic: 60, houseRent: 30, medical: 5, conveyance: 3, others: 1 } }));
}, 'split_sum_100'));
check('negative gross rejected', throwsCode(function () {
  L.computePayslip(Object.assign({}, base, { gross: -5 }));
}, 'gross_positive'));
check('zero gross rejected', throwsCode(function () {
  L.computePayslip(Object.assign({}, base, { gross: 0 }));
}, 'gross_positive'));
check('PF 51 rejected', throwsCode(function () {
  L.computePayslip(Object.assign({}, base, { pfPercent: 51 }));
}, 'pf_range'));
check('negative tax rejected', throwsCode(function () {
  L.computePayslip(Object.assign({}, base, { taxMonthly: -1 }));
}, 'tax_negative'));
check('deductions >= gross rejected', throwsCode(function () {
  L.computePayslip(Object.assign({}, base, { pfPercent: 50, taxMonthly: 42000 }));
}, 'deductions_exceed_gross'));
check('bad period rejected', throwsCode(function () {
  L.computePayslip(Object.assign({}, base, { grossPeriod: 'weekly' }));
}, 'period_invalid'));
check('split sum helper 100', eq(L.splitSum(L.defaultSplit()), 100));
check('validateSplit clean', L.validateSplit(L.defaultSplit()).length === 0);

// Month validation
check('month 2026-10 valid', L.isValidMonth('2026-10'));
check('month 2026-13 invalid', !L.isValidMonth('2026-13'));
check('month 2026-1 invalid', !L.isValidMonth('2026-1'));
check('month empty invalid', !L.isValidMonth(''));

// Records + import/export
function rec(month) {
  return { id: 'x-' + month, month: month, monthlyGross: 60000, net: 56400, pf: 3600, tax: 0, other: 0, split: L.defaultSplit(), pfPercent: 10, pfBase: 'basic', createdAt: 1700000000000 };
}
check('record valid', L.validateRecord(rec('2026-10')).length === 0);
check('record bad month', L.validateRecord(Object.assign(rec('2026-10'), { month: 'Oct 2026' })).indexOf('month_invalid') !== -1);
check('record net > gross', L.validateRecord(Object.assign(rec('2026-10'), { net: 70000 })).indexOf('net_range') !== -1);
var exported = L.exportData([rec('2026-10')]);
check('export app tag', exported.app === 'salary-calculator-bd' && exported.version === 1);
check('import round-trip', L.validateImport(JSON.parse(JSON.stringify(exported))).records.length === 1);
check('import wrong app rejected', throwsCode(function () { L.validateImport({ app: 'other', version: 1, payslips: [] }); }, 'import_wrong_app'));
check('import wrong version rejected', throwsCode(function () { L.validateImport({ app: 'salary-calculator-bd', version: 2, payslips: [] }); }, 'import_version'));
check('import dup month rejected', throwsCode(function () { L.validateImport({ app: 'salary-calculator-bd', version: 1, payslips: [rec('2026-10'), rec('2026-10')] }); }, 'import_duplicate_month'));
check('import bad record rejected', throwsCode(function () { L.validateImport({ app: 'salary-calculator-bd', version: 1, payslips: [Object.assign(rec('2026-10'), { month: 'bad' })] }); }, 'import_record_month_invalid'));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
