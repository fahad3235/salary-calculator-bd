'use strict';
/* Headless-Chrome smoke test via raw CDP. Run: node tests/smoke.test.js
   Uses /opt/meta-chromium/chrome + Node's global WebSocket client. */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 9231;
const FILE = 'file://' + path.resolve(__dirname, '..', 'index.html');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + String(extra).slice(0, 300) : '')); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const chrome = spawn('/opt/meta-chromium/chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    '--remote-debugging-port=' + PORT, '--remote-debugging-address=127.0.0.1',
    'about:blank',
  ], { stdio: 'ignore' });
  try {
    let list = null;
    for (let i = 0; i < 50 && !list; i++) {
      try { const r = await fetch('http://127.0.0.1:' + PORT + '/json/list'); if (r.ok) list = await r.json(); } catch (e) { await sleep(200); }
    }
    if (!list) throw new Error('no CDP list');
    const page = list.find((p) => p.type === 'page') || list[0];
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let nextId = 1;
    const pending = new Map();
    const consoleErrors = [];
    const pageErrors = [];
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); return; }
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') consoleErrors.push(JSON.stringify(msg.params.args));
      if (msg.method === 'Runtime.exceptionThrown') pageErrors.push(msg.params.exceptionDetails.exception ? msg.params.exceptionDetails.exception.description : 'exception');
      if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') consoleErrors.push(msg.params.entry.text);
    };
    const send = (method, params) => new Promise((resolve) => {
      const id = nextId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params: params || {} }));
    });
    const ev = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.result && r.result.exceptionDetails) return { error: JSON.stringify(r.result.exceptionDetails) };
      return r.result && r.result.result ? r.result.result.value : undefined;
    };
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Log.enable');
    await send('Page.navigate', { url: FILE });
    await sleep(1500);

    check('title', await ev('document.title') === 'Salary Calculator BD -- Gross to Net Payslip', await ev('document.title'));
    check('default net 56,400.00', (await ev("document.getElementById('result-table').innerText")).includes('56,400.00'));
    check('split sum 100%', (await ev("document.getElementById('split-sum').textContent")).includes('100%'));

    // Gross 100000 -> PF 6000 -> net 94000
    await ev("document.getElementById('gross').value='100000'; document.getElementById('compute-btn').click();");
    await sleep(300);
    check('gross 100000 -> net 94,000.00', (await ev("document.getElementById('result-table').innerText")).includes('94,000.00'));

    // Validation: split sum 90 -> error
    await ev("document.getElementById('split-basic').value='50'; document.getElementById('compute-btn').click();");
    await sleep(300);
    check('split sum 90 -> inline error', (await ev("document.getElementById('calc-msg').textContent")).includes('100%'));
    // Restore + recompute
    await ev("document.getElementById('split-basic').value='60'; document.getElementById('gross').value='60000'; document.getElementById('compute-btn').click();");
    await sleep(300);
    check('restored -> net 56,400.00', (await ev("document.getElementById('result-table').innerText")).includes('56,400.00'));

    // Save payslip for 2026-10, then reload -> persists
    await ev("document.getElementById('month').value='2026-10'; document.getElementById('save-btn').click();");
    await sleep(300);
    check('save shows month in list', (await ev("document.getElementById('slip-list').innerText")).includes('2026-10'));
    await send('Page.reload');
    await sleep(1500);
    check('payslip persists after reload', (await ev("document.getElementById('slip-list').innerText")).includes('2026-10'));

    // Duplicate month rejected
    await ev("document.getElementById('month').value='2026-10'; document.getElementById('save-btn').click();");
    await sleep(300);
    check('duplicate month rejected', (await ev("document.getElementById('slip-msg').textContent")).length > 0);

    // Delete it
    await ev("document.querySelector('[data-del]').click();");
    await sleep(300);
    check('delete removes payslip', !(await ev("document.getElementById('slip-list').innerText")).includes('2026-10'));

    // BN toggle renders Bengali digits
    await ev("document.getElementById('lang-btn').click();");
    await sleep(300);
    const bnText = await ev('document.body.innerText');
    check('BN toggle shows Bengali digits', /[\u09e6-\u09ef]/.test(bnText) && bnText.includes('\u09ac\u09c7\u09a4\u09a8'));
    // Back to EN
    await ev("document.getElementById('lang-btn').click();");
    await sleep(300);

    // Tabs: Payslips panel becomes visible
    await ev("document.querySelector('[data-tab=\"panel-slips\"]').click();");
    await sleep(200);
    check('Payslips tab shows', await ev("!document.getElementById('panel-slips').hidden"));
    await ev("document.querySelector('[data-tab=\"panel-calc\"]').click();");
    await sleep(200);

    // 390px mobile: no horizontal overflow
    await send('Page.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await sleep(500);
    const overflow = await ev('document.documentElement.scrollWidth');
    check('390px no horizontal overflow', overflow <= 390, 'scrollWidth=' + overflow);
    await send('Page.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

    check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));
    check('zero page errors', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '));

    ws.close();
  } finally {
    chrome.kill('SIGKILL');
  }
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('SMOKE HARNESS ERROR', e); process.exit(2); });
