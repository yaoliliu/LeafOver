// Exercise the actual click handler with all network requests left pending.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(process.argv[2] || path.join(__dirname, '../tools/app.js'), 'utf8');
const code = source.slice(source.indexOf("const settingsDialog ="), source.indexOf("const storedWidth ="));
const elements = new Map();
function $(id) {
  if (!elements.has(id)) elements.set(id, {value: '', checked: false, open: false,
    handlers: {}, addEventListener(event, fn) { this.handlers[event] = fn; },
    replaceChildren() {}, showModal() { this.open = true; }, close() { this.open = false; }, focus() {}});
  return elements.get(id);
}
let projectRequests = 0;
let stalled = true;
let installRequests = 0;
const status = {settings: {main_file: 'main.tex', title: '', compiler: 'xelatex'}, main_files: ['main.tex'],
  compilers: [{id: 'xelatex', installed: true}, {id: 'lualatex', installed: false}],
  installation: {state: 'idle', compiler: null, error: '', log: ''}};
const context = { $, projectData: {settings: {main_file: 'main.tex', title: '', compiler: 'xelatex'}, files: [{name: 'main.tex'}], detected_title: 'Paper'},
  mainSource: 'main.tex', Option: function (name, value) { return {name, value}; },
  tr: s => s, localized: (zh, en) => en, setTimeout, clearTimeout,
  fetch: async (url) => {
    if (stalled) return new Promise(() => {});
    if (url === 'api/compilers/install') {
      installRequests++;
      status.compilers[1].installed = true;
      status.installation = {state: 'ok', compiler: 'lualatex', error: '', log: ''};
    }
    return {ok: true, json: async () => status};
  }, loadProject: () => { projectRequests++; return new Promise(() => {}); }};
vm.runInNewContext(code, context);
$('#settings-toggle').handlers.click();
assert.equal($('#project-settings').open, true, 'Settings must open before any network response');
assert.equal(projectRequests, 0, 'Opening settings must not reload the full project');
console.log('PASS: settings opens immediately while the network is stalled.');

(async () => {
  stalled = false;
  $('#settings-toggle').handlers.click();
  await new Promise(resolve => setImmediate(resolve));
  $('#settings-compiler').value = 'lualatex';
  $('#settings-compiler').handlers.change();
  assert.equal($('#compiler-install').hidden, false, 'Missing compiler must offer installation');
  assert.equal($('#settings-save').disabled, true, 'Cannot select a missing compiler before installation');
  await $('#compiler-install').handlers.click();
  assert.equal(installRequests, 1);
  assert.equal($('#compiler-install').hidden, true);
  assert.equal($('#settings-save').disabled, false);
  console.log('PASS: missing compiler offers installation and enables saving after success.');
})().catch(error => { console.error(error); process.exitCode = 1; });
