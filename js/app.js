'use strict';
/* salary-calculator-bd -- UI wiring. All Bengali strings are \uXXXX escapes
   so every source file stays pure ASCII (see factory run-#25 lesson). */
(function () {
  var L = window.SalaryCalc;
  var LS_KEY = 'salary-calculator-bd-v1';
  var LS_LANG = 'salary-calculator-bd-lang';

  var BN_DIGITS = ['\u09e6', '\u09e7', '\u09e8', '\u09e9', '\u09ea', '\u09eb', '\u09ec', '\u09ed', '\u09ee', '\u09ef'];

  var I18N = {
    en: {
      appTitle: 'Salary Calculator BD',
      appSub: 'Turn gross salary into take-home pay -- with a payslip you can save.',
      tabCalc: 'Calculator', tabSlips: 'Payslips', tabData: 'Data',
      langBtn: '\u09ac\u09be\u0982\u09b2\u09be',
      grossLabel: 'Gross salary (BDT)', periodLabel: 'Gross period',
      monthly: 'Monthly', yearly: 'Yearly',
      splitLabel: 'Salary split (%) -- must add up to 100%',
      basic: 'Basic', houseRent: 'House rent', medical: 'Medical',
      conveyance: 'Conveyance', others: 'Others',
      splitSum: 'Total', resetSplit: 'Reset split',
      pfLabel: 'Provident Fund (PF) %', pfBaseLabel: 'PF calculated on',
      pfBaseBasic: 'Basic', pfBaseGross: 'Gross',
      taxLabel: 'Monthly income tax (BDT)',
      otherLabel: 'Other deductions (BDT)',
      compute: 'Calculate', resultTitle: 'Payslip',
      gross: 'Gross salary', pf: 'Provident Fund (PF)', tax: 'Income tax',
      other: 'Other deductions', deductions: 'Total deductions',
      net: 'Net pay (take-home)', annualGross: 'Annual gross', annualNet: 'Annual net',
      saveLabel: 'Month for this payslip', saveBtn: 'Save payslip',
      savedTitle: 'Saved payslips', emptySlips: 'No payslips saved yet.',
      delete: 'Delete', printBtn: 'Print payslip',
      exportBtn: 'Export JSON', importLabel: 'Import JSON',
      clearLabel: 'Type DELETE to erase all saved payslips',
      clearBtn: 'Erase all', savedMsg: 'Payslip saved.',
      dupMonth: 'A payslip for this month already exists.',
      deletedMsg: 'Payslip deleted.', erasedMsg: 'All payslips erased.',
      importedMsg: 'Import complete.', exportEmpty: 'Nothing to export yet.',
      err_gross_positive: 'Gross salary must be greater than 0.',
      err_gross_too_large: 'Gross salary is unreasonably large.',
      err_period_invalid: 'Gross period is invalid.',
      err_split_sum_100: 'Split percentages must add up to 100%.',
      err_split_range: 'Each split percentage must be between 0 and 100.',
      err_pf_range: 'PF must be between 0% and 50%.',
      err_tax_negative: 'Tax cannot be negative.',
      err_other_negative: 'Other deductions cannot be negative.',
      err_deductions_exceed_gross: 'Total deductions must be less than gross salary.',
      err_import: 'Import failed: file is not a valid salary-calculator-bd export.',
      err_month: 'Pick a valid month (YYYY-MM).',
      err_clear: 'Type DELETE exactly to erase everything.',
      footer: 'Personal planning tool. The default split is a common starting point, not a rule -- match it to your appointment letter. Tax here is the amount you enter (e.g. from your tax calculation), not computed by this app. No data leaves your browser.'
    },
    bn: {
      appTitle: '\u09ac\u09c7\u09a4\u09a8 \u0995\u09cd\u09af\u09be\u09b2\u0995\u09c1\u09b2\u09c7\u099f\u09b0',
      appSub: '\u09ae\u09be\u09b8\u09bf\u0995 \u09ac\u09c7\u09a4\u09a8 \u09a5\u09c7\u0995\u09c7 \u09a8\u09bf\u099f \u09ac\u09c7\u09a4\u09a8 \u09b9\u09bf\u09b8\u09be\u09ac \u0995\u09b0\u09c1\u09a8',
      tabCalc: '\u0995\u09cd\u09af\u09be\u09b2\u0995\u09c1\u09b2\u09c7\u099f\u09b0', tabSlips: '\u09aa\u09c7-\u09b8\u09cd\u09b2\u09bf\u09aa', tabData: '\u09a1\u09c7\u099f\u09be',
      langBtn: 'English',
      grossLabel: '\u09ae\u09cb\u099f \u09ac\u09c7\u09a4\u09a8 (BDT)', periodLabel: '\u09ac\u09c7\u09a4\u09a8\u09c7\u09b0 \u09a7\u09b0\u09a8',
      monthly: '\u09ae\u09be\u09b8\u09bf\u0995', yearly: '\u09ac\u09be\u09b0\u09cd\u09b7\u09bf\u0995',
      splitLabel: '\u09ac\u09c7\u09a4\u09a8\u09c7\u09b0 \u09ad\u09be\u0997 (%) \u2014 \u09ae\u09cb\u099f 100% \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7',
      basic: '\u09ae\u09c2\u09b2 \u09ac\u09c7\u09a4\u09a8', houseRent: '\u09ac\u09be\u09dc\u09bf \u09ad\u09be\u09dc\u09be', medical: '\u099a\u09bf\u0995\u09bf\u09ce\u09b8\u09be \u09ad\u09be\u09a4\u09be',
      conveyance: '\u09af\u09be\u09a4\u09be\u09df\u09be\u09a4 \u09ad\u09be\u09a4\u09be', others: '\u0985\u09a8\u09cd\u09af\u09be\u09a8\u09cd\u09af',
      splitSum: '\u09ae\u09cb\u099f', resetSplit: '\u09ad\u09be\u0997 \u09b0\u09bf\u09b8\u09c7\u099f \u0995\u09b0\u09c1\u09a8',
      pfLabel: '\u09aa\u09cd\u09b0\u09ad\u09bf\u09a1\u09c7\u09a8\u09cd\u099f \u09ab\u09be\u09a8\u09cd\u09a1 (PF) %', pfBaseLabel: 'PF \u09b9\u09bf\u09b8\u09be\u09ac\u09c7\u09b0 \u09ad\u09bf\u09a4\u09cd\u09a4\u09bf',
      pfBaseBasic: '\u09ae\u09c2\u09b2 \u09ac\u09c7\u09a4\u09a8', pfBaseGross: '\u09ae\u09cb\u099f \u09ac\u09c7\u09a4\u09a8',
      taxLabel: '\u09ae\u09be\u09b8\u09bf\u0995 \u0986\u09df\u0995\u09b0 (BDT)',
      otherLabel: '\u0985\u09a8\u09cd\u09af\u09be\u09a8\u09cd\u09af \u0995\u09be\u099f\u099b\u09be\u0981\u099f (BDT)',
      compute: '\u09b9\u09bf\u09b8\u09be\u09ac \u0995\u09b0\u09c1\u09a8', resultTitle: '\u09aa\u09c7-\u09b8\u09cd\u09b2\u09bf\u09aa',
      gross: '\u09ae\u09cb\u099f \u09ac\u09c7\u09a4\u09a8', pf: '\u09aa\u09cd\u09b0\u09ad\u09bf\u09a1\u09c7\u09a8\u09cd\u099f \u09ab\u09be\u09a8\u09cd\u09a1 (PF)', tax: '\u0986\u09df\u0995\u09b0',
      other: '\u0985\u09a8\u09cd\u09af\u09be\u09a8\u09cd\u09af \u0995\u09be\u099f\u099b\u09be\u0981\u099f', deductions: '\u09ae\u09cb\u099f \u0995\u09be\u099f\u099b\u09be\u0981\u099f',
      net: '\u09a8\u09bf\u099f \u09ac\u09c7\u09a4\u09a8 (\u09b9\u09be\u09a4\u09c7 \u09aa\u09be\u09ac\u09c7\u09a8)', annualGross: '\u09ac\u09be\u09b0\u09cd\u09b7\u09bf\u0995 \u09ae\u09cb\u099f', annualNet: '\u09ac\u09be\u09b0\u09cd\u09b7\u09bf\u0995 \u09a8\u09bf\u099f',
      saveLabel: '\u098f\u0987 \u09aa\u09c7-\u09b8\u09cd\u09b2\u09bf\u09aa\u09c7\u09b0 \u09ae\u09be\u09b8', saveBtn: '\u09aa\u09c7-\u09b8\u09cd\u09b2\u09bf\u09aa \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3 \u0995\u09b0\u09c1\u09a8',
      savedTitle: '\u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09aa\u09c7-\u09b8\u09cd\u09b2\u09bf\u09aa', emptySlips: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u09aa\u09c7-\u09b8\u09cd\u09b2\u09bf\u09aa \u09a8\u09c7\u0987\u0964',
      delete: '\u09ae\u09c1\u099b\u09c1\u09a8', printBtn: '\u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f',
      exportBtn: '\u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f JSON', importLabel: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f JSON',
      clearLabel: 'DELETE \u09b2\u09bf\u0996\u09c7 \u09b8\u09ac \u09ae\u09c1\u099b\u09c1\u09a8',
      clearBtn: '\u09b8\u09ac \u09ae\u09c1\u099b\u09c1\u09a8', savedMsg: '\u09aa\u09c7-\u09b8\u09cd\u09b2\u09bf\u09aa \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09df\u09c7\u099b\u09c7\u0964',
      dupMonth: '\u098f\u0987 \u09ae\u09be\u09b8\u09c7\u09b0 \u09aa\u09c7-\u09b8\u09cd\u09b2\u09bf\u09aa \u0986\u0997\u09c7\u0987 \u0986\u099b\u09c7\u0964',
      deletedMsg: '\u09aa\u09c7-\u09b8\u09cd\u09b2\u09bf\u09aa \u09ae\u09cb\u099b\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964', erasedMsg: '\u09b8\u09ac \u09aa\u09c7-\u09b8\u09cd\u09b2\u09bf\u09aa \u09ae\u09cb\u099b\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964',
      importedMsg: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09b8\u09ae\u09cd\u09aa\u09a8\u09cd\u09a8\u0964', exportEmpty: '\u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f \u0995\u09b0\u09be\u09b0 \u09ae\u09a4\u09cb \u0995\u09bf\u099b\u09c1 \u09a8\u09c7\u0987\u0964',
      err_gross_positive: '\u09ae\u09cb\u099f \u09ac\u09c7\u09a4\u09a8 0-\u098f\u09b0 \u09ac\u09c7\u09b6\u09bf \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_gross_too_large: '\u09ae\u09cb\u099f \u09ac\u09c7\u09a4\u09a8 \u0985\u09b8\u09ae\u09cd\u09ad\u09ac \u09b0\u0995\u09ae\u09c7\u09b0 \u09ac\u09dc\u0964',
      err_period_invalid: '\u09ac\u09c7\u09a4\u09a8\u09c7\u09b0 \u09a7\u09b0\u09a8 \u09ad\u09c1\u09b2\u0964',
      err_split_sum_100: '\u09ad\u09be\u0997\u09c7\u09b0 \u09af\u09cb\u0997\u09ab\u09b2 100% \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_split_range: '\u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf \u09ad\u09be\u0997 0 \u2013 100%- \u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_pf_range: 'PF 0% \u2013 50%- \u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_tax_negative: '\u0995\u09b0 \u09a8\u09c7\u099f\u09bf\u09ad \u09b9\u09a4\u09c7 \u09aa\u09be\u09b0\u09ac\u09c7 \u09a8\u09be\u0964',
      err_other_negative: '\u0985\u09a8\u09cd\u09af\u09be\u09a8\u09cd\u09af \u0995\u09be\u099f\u099b\u09be\u0981\u099f \u09a8\u09c7\u099f\u09bf\u09ad \u09b9\u09a4\u09c7 \u09aa\u09be\u09b0\u09ac\u09c7 \u09a8\u09be\u0964',
      err_deductions_exceed_gross: '\u09ae\u09cb\u099f \u0995\u09be\u099f\u099b\u09be\u0981\u099f \u09ae\u09cb\u099f \u09ac\u09c7\u09a4\u09a8\u09c7\u09b0 \u099a\u09c7\u09df\u09c7 \u0995\u09ae \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_import: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09ac\u09cd\u09af\u09b0\u09cd\u09a5 \u09b9\u09df\u09c7\u099b\u09c7: \u09ab\u09be\u0987\u09b2\u099f\u09bf \u09b8\u09a0\u09bf\u0995 \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f \u09a8\u09df\u0964',
      err_month: '\u09b8\u09a0\u09bf\u0995 \u09ae\u09be\u09b8 (YYYY-MM) \u09a6\u09be\u099b\u09c1\u09a8\u0964',
      err_clear: 'DELETE \u09b9\u09c1\u09ac\u09b9\u09c1 \u09b2\u09bf\u0996\u09c1\u09a8\u0964',
      footer: '\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u0997\u09a4 \u09aa\u09b0\u09bf\u0995\u09b2\u09cd\u09aa\u09a8\u09be\u09b0 \u099f\u09c1\u09b2\u0964 \u09a1\u09bf\u09ab\u09b2\u09cd\u099f \u09ad\u09be\u0997 \u09a8\u09bf\u09df\u09cb\u0997\u09aa\u09a4\u09cd\u09b0\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u09ae\u09bf\u09b2\u09bf\u09df\u09c7 \u09a8\u09bf\u09a8\u0964 \u0995\u09b0 \u0986\u09aa\u09a8\u09bf \u09af\u09be \u09b2\u09bf\u0996\u09ac\u09c7\u09a8 \u09a4\u09be\u0987 \u09a7\u09b0\u09be \u09b9\u09ac\u09c7\u0964 \u0995\u09cb\u09a8\u09cb \u09a1\u09c7\u099f\u09be \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7\u09b0 \u09ac\u09be\u0987\u09b0\u09c7 \u09af\u09be\u09df \u09a8\u09be\u0964'
    }
  };

  var lang = 'en';
  try {
    var savedLang = localStorage.getItem(LS_LANG);
    if (savedLang === 'bn' || savedLang === 'en') lang = savedLang;
  } catch (e) { /* private mode: stay English */ }
  var payslips = loadSlips();
  var lastResult = null;
  var lastInput = null;

  function t(key) { return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key; }

  function toBnDigits(str) {
    return String(str).replace(/[0-9]/g, function (d) { return BN_DIGITS[Number(d)]; });
  }
  function fmt(n) {
    var s = Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return lang === 'bn' ? toBnDigits(s) : s;
  }
  function fmtInt(n) {
    var s = String(Math.round(Number(n)));
    return lang === 'bn' ? toBnDigits(s) : s;
  }

  function loadSlips() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      if (!data || data.app !== L.APP || data.version !== L.VERSION) return [];
      if (!Array.isArray(data.payslips)) return [];
      return data.payslips.filter(function (r) { return L.validateRecord(r).length === 0; });
    } catch (e) { return []; }
  }
  function saveSlips() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(L.exportData(payslips))); } catch (e) { /* ignore */ }
  }

  function $(id) { return document.getElementById(id); }

  function showMsg(el, text, isError) {
    el.textContent = text;
    el.className = 'msg' + (isError ? ' error' : ' ok');
  }
  function clearMsg(el) { el.textContent = ''; el.className = 'msg'; }

  function readInputs() {
    var split = {};
    for (var i = 0; i < L.COMPONENTS.length; i++) {
      var k = L.COMPONENTS[i];
      split[k] = Number($('split-' + k).value);
    }
    return {
      gross: Number($('gross').value),
      grossPeriod: $('period').value,
      split: split,
      pfPercent: Number($('pf').value),
      pfBase: $('pfBase').value,
      taxMonthly: Number($('tax').value),
      otherDeductions: Number($('other').value)
    };
  }

  function errText(code) {
    if (code && code.indexOf('split_not_number') === 0) return t('err_split_range');
    if (code && code.indexOf('split_range') === 0) return t('err_split_range');
    return t('err_' + code) || code;
  }

  function renderResult(res) {
    var rows = [];
    function row(label, value, cls) {
      rows.push('<tr class="' + (cls || '') + '"><td>' + label + '</td><td class="num">' + fmt(value) + '</td></tr>');
    }
    row(t('basic') + ' (' + fmtInt(lastInput.split.basic) + '%)', res.components.basic);
    row(t('houseRent') + ' (' + fmtInt(lastInput.split.houseRent) + '%)', res.components.houseRent);
    row(t('medical') + ' (' + fmtInt(lastInput.split.medical) + '%)', res.components.medical);
    row(t('conveyance') + ' (' + fmtInt(lastInput.split.conveyance) + '%)', res.components.conveyance);
    row(t('others') + ' (' + fmtInt(lastInput.split.others) + '%)', res.components.others);
    row(t('gross'), res.monthlyGross, 'subtotal');
    row(t('pf') + ' (' + fmtInt(lastInput.pfPercent) + '%)', res.pf);
    row(t('tax'), res.tax);
    row(t('other'), res.other);
    row(t('deductions'), res.deductions, 'subtotal');
    row(t('net'), res.net, 'net');
    row(t('annualGross'), res.annualGross);
    row(t('annualNet'), res.annualNet);
    $('result-table').innerHTML = rows.join('');
    $('result').hidden = false;
    $('save-section').hidden = false;
  }

  function renderSlips() {
    var list = $('slip-list');
    if (!payslips.length) {
      list.innerHTML = '<p class="empty">' + t('emptySlips') + '</p>';
      return;
    }
    var sorted = payslips.slice().sort(function (a, b) { return b.month.localeCompare(a.month); });
    list.innerHTML = sorted.map(function (r) {
      return '<div class="slip-row"><div><strong>' + r.month + '</strong>' +
        '<span>' + t('gross') + ': ' + fmt(r.monthlyGross) + ' &middot; ' + t('net') + ': ' + fmt(r.net) + '</span></div>' +
        '<button class="btn danger small" data-del="' + r.id + '">' + t('delete') + '</button></div>';
    }).join('');
    list.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        payslips = payslips.filter(function (r) { return r.id !== btn.getAttribute('data-del'); });
        saveSlips(); renderSlips();
        showMsg($('slip-msg'), t('deletedMsg'), false);
      });
    });
  }

  function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
    if (lastResult) renderResult(lastResult);
    renderSlips();
  }

  function updateSplitSum() {
    var sum = 0;
    for (var i = 0; i < L.COMPONENTS.length; i++) sum += Number($('split-' + L.COMPONENTS[i]).value) || 0;
    var el = $('split-sum');
    el.textContent = t('splitSum') + ': ' + fmtInt(L.round2(sum)) + '%';
    el.className = Math.abs(L.round2(sum) - 100) < 0.001 ? 'split-sum ok' : 'split-sum error';
  }

  function compute() {
    clearMsg($('calc-msg'));
    var inp = readInputs();
    lastInput = inp;
    try {
      var res = L.computePayslip(inp);
      lastResult = res;
      renderResult(res);
    } catch (e) {
      lastResult = null;
      $('result').hidden = true;
      $('save-section').hidden = true;
      showMsg($('calc-msg'), errText(e.code), true);
    }
  }

  function init() {
    // Defaults
    $('gross').value = '60000';
    var d = L.defaultSplit();
    for (var i = 0; i < L.COMPONENTS.length; i++) $('split-' + L.COMPONENTS[i]).value = d[L.COMPONENTS[i]];
    $('pf').value = '10';
    $('tax').value = '0';
    $('other').value = '0';
    var now = new Date();
    $('month').value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

    $('lang-btn').addEventListener('click', function () {
      lang = lang === 'en' ? 'bn' : 'en';
      try { localStorage.setItem(LS_LANG, lang); } catch (e) { /* ignore */ }
      applyLang(); updateSplitSum();
    });

    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-panel').forEach(function (p) { p.hidden = true; });
        btn.classList.add('active');
        $(btn.getAttribute('data-tab')).hidden = false;
      });
    });

    L.COMPONENTS.forEach(function (k) {
      $('split-' + k).addEventListener('input', updateSplitSum);
    });
    $('reset-split').addEventListener('click', function () {
      var dd = L.defaultSplit();
      for (var j = 0; j < L.COMPONENTS.length; j++) $('split-' + L.COMPONENTS[j]).value = dd[L.COMPONENTS[j]];
      updateSplitSum();
    });
    $('compute-btn').addEventListener('click', compute);

    $('save-btn').addEventListener('click', function () {
      clearMsg($('slip-msg'));
      if (!lastResult) { compute(); if (!lastResult) return; }
      var month = $('month').value;
      if (!L.isValidMonth(month)) { showMsg($('slip-msg'), t('err_month'), true); return; }
      if (payslips.some(function (r) { return r.month === month; })) {
        showMsg($('slip-msg'), t('dupMonth'), true); return;
      }
      payslips.push({
        id: 'slip-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        month: month, monthlyGross: lastResult.monthlyGross, net: lastResult.net,
        pf: lastResult.pf, tax: lastResult.tax, other: lastResult.other,
        split: lastInput.split, pfPercent: lastInput.pfPercent, pfBase: lastInput.pfBase,
        createdAt: Date.now()
      });
      saveSlips(); renderSlips();
      showMsg($('slip-msg'), t('savedMsg'), false);
    });

    $('print-btn').addEventListener('click', function () { window.print(); });

    $('export-btn').addEventListener('click', function () {
      clearMsg($('data-msg'));
      if (!payslips.length) { showMsg($('data-msg'), t('exportEmpty'), true); return; }
      var blob = new Blob([JSON.stringify(L.exportData(payslips), null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'salary-calculator-bd-export.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });

    $('import-file').addEventListener('change', function (ev) {
      clearMsg($('data-msg'));
      var file = ev.target.files && ev.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          var out = L.validateImport(data);
          payslips = out.records;
          saveSlips(); renderSlips();
          showMsg($('data-msg'), t('importedMsg'), false);
        } catch (e) {
          showMsg($('data-msg'), t('err_import'), true);
        }
      };
      reader.readAsText(file);
      ev.target.value = '';
    });

    $('clear-btn').addEventListener('click', function () {
      clearMsg($('data-msg'));
      if ($('clear-confirm').value !== 'DELETE') { showMsg($('data-msg'), t('err_clear'), true); return; }
      payslips = [];
      saveSlips(); renderSlips();
      $('clear-confirm').value = '';
      showMsg($('data-msg'), t('erasedMsg'), false);
    });

    applyLang();
    updateSplitSum();
    compute();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
