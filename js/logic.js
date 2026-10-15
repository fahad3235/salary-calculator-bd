'use strict';
/* salary-calculator-bd -- pure salary math. No DOM, no I/O.
   Money is handled in integer paisa (1 BDT = 100 paisa) to avoid float error.
   All split percentages are USER-EDITABLE. The default split is a common
   starting point only -- it is not a law or a company rule. */
(function (root) {
  var APP = 'salary-calculator-bd';
  var VERSION = 1;
  var COMPONENTS = ['basic', 'houseRent', 'medical', 'conveyance', 'others'];
  var DEFAULT_SPLIT = { basic: 60, houseRent: 30, medical: 5, conveyance: 3, others: 2 };
  var MAX_GROSS = 100000000; // 10 crore BDT / month -- sanity cap
  var MAX_HISTORY = 500;

  function isNum(x) { return typeof x === 'number' && isFinite(x); }
  function toPaisa(n) { return Math.round((Number(n) + Number.EPSILON) * 100); }
  function fromPaisa(p) { return p / 100; }
  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

  function splitSum(split) {
    var s = 0;
    for (var i = 0; i < COMPONENTS.length; i++) s += Number(split[COMPONENTS[i]]) || 0;
    return round2(s);
  }

  // Returns an array of error codes (empty = valid).
  function validateSplit(split) {
    var errs = [];
    if (!split || typeof split !== 'object') return ['split_missing'];
    for (var i = 0; i < COMPONENTS.length; i++) {
      var v = split[COMPONENTS[i]];
      if (!isNum(v)) errs.push('split_not_number_' + COMPONENTS[i]);
      else if (v < 0 || v > 100) errs.push('split_range_' + COMPONENTS[i]);
    }
    if (errs.length) return errs;
    if (Math.abs(splitSum(split) - 100) > 0.001) errs.push('split_sum_100');
    return errs;
  }

  function validateInputs(inp) {
    var errs = [];
    if (!inp || typeof inp !== 'object') return ['input_missing'];
    if (!isNum(inp.gross) || inp.gross <= 0) errs.push('gross_positive');
    else if (inp.gross > MAX_GROSS) errs.push('gross_too_large');
    if (inp.grossPeriod !== 'monthly' && inp.grossPeriod !== 'yearly') errs.push('period_invalid');
    errs = errs.concat(validateSplit(inp.split));
    if (!isNum(inp.pfPercent) || inp.pfPercent < 0 || inp.pfPercent > 50) errs.push('pf_range');
    if (inp.pfBase !== 'basic' && inp.pfBase !== 'gross') errs.push('pf_base_invalid');
    if (!isNum(inp.taxMonthly) || inp.taxMonthly < 0) errs.push('tax_negative');
    if (!isNum(inp.otherDeductions) || inp.otherDeductions < 0) errs.push('other_negative');
    return errs;
  }

  // input: {gross, grossPeriod, split, pfPercent, pfBase, taxMonthly, otherDeductions}
  // All money inputs are monthly BDT except gross when grossPeriod === 'yearly'.
  // Returns amounts in BDT (2-decimal numbers) + paisa integers for exactness.
  function computePayslip(inp) {
    var errs = validateInputs(inp);
    if (errs.length) {
      var e = new Error('invalid input: ' + errs.join(','));
      e.code = errs[0];
      e.codes = errs;
      throw e;
    }
    var grossPaisa;
    if (inp.grossPeriod === 'yearly') {
      grossPaisa = Math.round(toPaisa(inp.gross) / 12);
    } else {
      grossPaisa = toPaisa(inp.gross);
    }
    var compPaisa = {};
    var sum = 0;
    for (var i = 0; i < COMPONENTS.length; i++) {
      var k = COMPONENTS[i];
      compPaisa[k] = Math.round(grossPaisa * Number(inp.split[k]) / 100);
      sum += compPaisa[k];
    }
    // Rounding residual goes to Basic (the largest component by default).
    compPaisa.basic += grossPaisa - sum;
    var pfBasePaisa = inp.pfBase === 'gross' ? grossPaisa : compPaisa.basic;
    var pfPaisa = Math.round(pfBasePaisa * Number(inp.pfPercent) / 100);
    var taxPaisa = toPaisa(inp.taxMonthly);
    var otherPaisa = toPaisa(inp.otherDeductions);
    var deductionsPaisa = pfPaisa + taxPaisa + otherPaisa;
    if (deductionsPaisa >= grossPaisa) {
      var e2 = new Error('invalid input: deductions_exceed_gross');
      e2.code = 'deductions_exceed_gross';
      e2.codes = ['deductions_exceed_gross'];
      throw e2;
    }
    var netPaisa = grossPaisa - deductionsPaisa;
    var components = {};
    for (var j = 0; j < COMPONENTS.length; j++) components[COMPONENTS[j]] = fromPaisa(compPaisa[COMPONENTS[j]]);
    return {
      monthlyGross: fromPaisa(grossPaisa),
      components: components,
      pf: fromPaisa(pfPaisa),
      tax: fromPaisa(taxPaisa),
      other: fromPaisa(otherPaisa),
      deductions: fromPaisa(deductionsPaisa),
      net: fromPaisa(netPaisa),
      annualGross: fromPaisa(grossPaisa * 12),
      annualNet: fromPaisa(netPaisa * 12),
      annualDeductions: fromPaisa(deductionsPaisa * 12),
      paisa: {
        gross: grossPaisa, components: compPaisa, pf: pfPaisa,
        tax: taxPaisa, other: otherPaisa, deductions: deductionsPaisa, net: netPaisa
      }
    };
  }

  function isValidMonth(m) {
    if (typeof m !== 'string') return false;
    var mm = /^(\d{4})-(\d{2})$/.exec(m);
    if (!mm) return false;
    var y = Number(mm[1]); var mo = Number(mm[2]);
    return y >= 2000 && y <= 2100 && mo >= 1 && mo <= 12;
  }

  // A saved payslip record: {id, month, monthlyGross, net, pf, tax, other,
  // split, pfPercent, pfBase, createdAt}. Returns error codes (empty = valid).
  function validateRecord(r) {
    var errs = [];
    if (!r || typeof r !== 'object') return ['record_missing'];
    if (typeof r.id !== 'string' || !r.id) errs.push('id_missing');
    if (!isValidMonth(r.month)) errs.push('month_invalid');
    if (!isNum(r.monthlyGross) || r.monthlyGross <= 0) errs.push('gross_positive');
    if (!isNum(r.net) || r.net < 0 || r.net > r.monthlyGross) errs.push('net_range');
    if (!isNum(r.pf) || r.pf < 0) errs.push('pf_negative');
    if (!isNum(r.tax) || r.tax < 0) errs.push('tax_negative');
    if (!isNum(r.other) || r.other < 0) errs.push('other_negative');
    if (!isNum(r.pfPercent) || r.pfPercent < 0 || r.pfPercent > 50) errs.push('pf_range');
    if (r.pfBase !== 'basic' && r.pfBase !== 'gross') errs.push('pf_base_invalid');
    errs = errs.concat(validateSplit(r.split));
    if (typeof r.createdAt !== 'number' || r.createdAt <= 0) errs.push('createdAt_invalid');
    return errs;
  }

  // Strict import validation. Returns {records} or throws Error with .code.
  function validateImport(data) {
    function fail(code) {
      var e = new Error('invalid import: ' + code);
      e.code = code;
      throw e;
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) fail('import_not_object');
    if (data.app !== APP) fail('import_wrong_app');
    if (data.version !== VERSION) fail('import_version');
    if (!Array.isArray(data.payslips)) fail('import_not_array');
    if (data.payslips.length > MAX_HISTORY) fail('import_too_many');
    var seen = {};
    for (var i = 0; i < data.payslips.length; i++) {
      var errs = validateRecord(data.payslips[i]);
      if (errs.length) fail('import_record_' + errs[0]);
      if (seen[data.payslips[i].month]) fail('import_duplicate_month');
      seen[data.payslips[i].month] = true;
    }
    return { records: data.payslips };
  }

  function exportData(records) {
    return { app: APP, version: VERSION, payslips: records };
  }

  function defaultSplit() {
    return { basic: 60, houseRent: 30, medical: 5, conveyance: 3, others: 2 };
  }

  var api = {
    APP: APP, VERSION: VERSION, COMPONENTS: COMPONENTS,
    DEFAULT_SPLIT: DEFAULT_SPLIT, MAX_GROSS: MAX_GROSS, MAX_HISTORY: MAX_HISTORY,
    toPaisa: toPaisa, fromPaisa: fromPaisa, round2: round2,
    splitSum: splitSum, validateSplit: validateSplit,
    validateInputs: validateInputs, computePayslip: computePayslip,
    isValidMonth: isValidMonth, validateRecord: validateRecord,
    validateImport: validateImport, exportData: exportData, defaultSplit: defaultSplit
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SalaryCalc = api;
})(typeof window !== 'undefined' ? window : globalThis);
