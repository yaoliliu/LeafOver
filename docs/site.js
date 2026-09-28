'use strict';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const defaultTitle = 'Back to Basics: Let Denoising Generative Models Denoise';
const accents = ['#168c59', '#3294d3', '#7c62be', '#d07a31', '#c35872'];
const figures = [
  {name: 'figures/teaser-update.pdf', image: './assets/teaser-update.webp'},
  {name: 'figures/framework.pdf', image: './assets/framework.webp'},
  {name: 'figures/loss.pdf', image: './assets/loss.webp'}
];
const zh = {
  tryDemo:'体验展示',features:'功能',install:'安装',openWorkspace:'探索工作台 ↗',installLocally:'本地安装 ↓',
  agentTerminal:'与 agent 协作的终端',livePreview:'实时 PDF 预览',localFiles:'本地 LaTeX 文件',
  interactivePreview:'交互式预览',workspaceHeading:'亲手探索工作台',
  workspaceIntro:'浏览 JiT 的真实 TeX 源码，连续翻看 18 页论文。安装后即可在终端与 agent 协作。',
  staticNotice:'这是静态展示页。编辑内容只保存在当前浏览器；编译、写入项目文件、安装编译器与运行终端命令需要本地安装。',
  getFullApp:'获取完整应用 →',outline:'大纲',files:'文件',search:'搜索',
  documentOutline:'论文目录',projectFiles:'项目文件',searchPrompt:'搜索示例中的 TeX 文件。',
  browserOnly:'仅浏览器内编辑',fitWidth:'适合宽度',find:'查找',loadingPaper:'正在载入论文…',
  clickToSource:'点击页面跳转到相关源码',pdfSource:'PDF↔源码',source:'源码',preview:'预览',
  terminal:'终端',recompile:'重新编译',
  terminalPlaceholder:'安装后可在这里与 coding agent 协作；它修改的 LaTeX 会自动编译成旁边的 PDF。静态展示页不会执行命令。',
  installForTerminal:'安装 LeafOver 后使用终端 →',
  showcaseCaption:'放心探索。原始项目文件不会被修改。',
  capabilities:'功能一览',flowHeading:'与 agent 一起写论文',
  flowIntro:'展示页呈现操作体验；安装后可使用完整工作流。',
  featureEditor:'真正的源码编辑器',featureEditorText:'多标签、自动保存、文件导航和源码搜索，让论文内容触手可及。',
  featurePreview:'并排实时 PDF',featurePreviewText:'连续滚动查看 PDF；本地安装后，源码修改会自动重编译，还能通过 SyncTeX 在 PDF 和源码间跳转。',
  featureSearch:'全项目搜索',featureSearchText:'搜索当前文件、项目源码或生成的 PDF。',
  featureSettings:'按你的习惯设置',featureSettingsText:'选择论文标题、编译器、明暗主题、主题色和语言。本地可从设置中安装缺失的编译器。',
  featureTerminal:'与 coding agent 并肩写作',featureTerminalText:'在本地应用的项目终端与 agent 协作；它修改 LaTeX 后，PDF 自动重编译并更新。',
  featureExport:'带走你的成果',featureExportText:'导出 LaTeX 源码和 PDF。论文保存在普通的本地文件中。',
  getStarted:'开始使用',installHeading:'你的论文，你的机器。',
  installText:'克隆仓库，运行一个脚本。必要时 LeafOver 会安装 JiT 示例所需的 TeX 包，然后启动完整的本地工作台。',
  installFootnote:'需要 Python 3.10+。自动 TeX 安装支持 Debian/Ubuntu 和 macOS；已有 TeX 环境也能直接运行。',
  copy:'复制',readDocs:'阅读安装说明 ↗',
  footerText:'开源 LaTeX 工作台。JiT 论文和图片保留其原有署名及 CC BY 4.0 许可。',
  projectSettings:'项目设置',mainFile:'LaTeX 主文件',compiler:'编译器',
  compilerNotice:'更换编译器和一键安装引擎需要在本地应用中完成。',
  automaticTitle:'从论文自动读取标题',displayTitle:'显示标题',cancel:'取消',saveSettings:'保存设置'
};
const en = Object.fromEntries($$('[data-i18n]').map((element) => [element.dataset.i18n, element.textContent]));

let settings;
try { settings = JSON.parse(localStorage.getItem('leafover-showcase-settings') || '{}'); } catch (_) { settings = {}; }
settings = Object.assign({theme:'dark', accent:accents[0], language:'en', compiler:'pdflatex', title:'', autoTitle:true}, settings);
let edits;
try { edits = JSON.parse(localStorage.getItem('leafover-showcase-edits') || '{}'); } catch (_) { edits = {}; }
const sourceCache = new Map();
const openTabs = [];
let project = {outline:[], files:[]};
let activeFile = '';
let pdfDoc = null;
let pageNumber = 1;
let zoomFactor = 1;
let pdfPages = [];
let renderToken = 0;
let visibleRenderFrame = 0;
let toastTimer;
let searchTimer;

function saveSettings() {
  try { localStorage.setItem('leafover-showcase-settings', JSON.stringify(settings)); } catch (_) {}
}
function saveEdits() {
  try { localStorage.setItem('leafover-showcase-edits', JSON.stringify(edits)); } catch (_) {}
}
function text(key) { return settings.language === 'zh' ? (zh[key] || en[key] || key) : (en[key] || key); }
function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('visible'), 3200);
}
function applyPreferences() {
  document.documentElement.dataset.theme = settings.theme === 'light' ? 'light' : 'dark';
  document.documentElement.lang = settings.language === 'zh' ? 'zh-CN' : 'en';
  document.documentElement.style.setProperty('--accent', accents.includes(settings.accent) ? settings.accent : accents[0]);
  $('#language-button').textContent = settings.language === 'zh' ? 'EN' : '中';
  $$('.site-header [data-i18n], main [data-i18n], footer [data-i18n], dialog [data-i18n]').forEach((element) => {
    element.textContent = text(element.dataset.i18n);
  });
  $('#workspace-title').textContent = settings.autoTitle || !settings.title ? defaultTitle : settings.title;
  if ($('#hero-headline')) $('#hero-headline').innerHTML = settings.language === 'zh'
    ? 'Agent 正在写。<br><em>论文实时呈现。</em>'
    : 'Your agent writes.<br><em>See the paper live.</em>';
  if ($('#hero-description')) $('#hero-description').textContent = settings.language === 'zh'
    ? '在项目终端与 coding agent 对话，随手查看它修改的 LaTeX 和旁边实时更新的 PDF。'
    : 'Talk to your coding agent in the project terminal, then watch its LaTeX edits become a live PDF beside your source.';
  saveSettings();
}
function makeButton(className, label, callback) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', callback);
  return button;
}
async function sourceText(name) {
  if (Object.prototype.hasOwnProperty.call(edits, name)) return edits[name];
  if (sourceCache.has(name)) return sourceCache.get(name);
  const response = await fetch('./data/' + name);
  if (!response.ok) throw new Error('Could not load ' + name);
  const body = await response.text();
  sourceCache.set(name, body);
  return body;
}
function renderLineNumbers() {
  const editor = $('#source-editor');
  const count = editor.value.split('\n').length;
  $('#line-numbers').textContent = Array.from({length:count}, (_, index) => index + 1).join('\n');
}
function renderTabs() {
  const list = $('#editor-tabs');
  list.replaceChildren();
  for (const name of openTabs) {
    const tab = makeButton('editor-tab' + (name === activeFile ? ' active' : ''), '', () => openFile(name));
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(name === activeFile));
    const icon = document.createElement('span');
    icon.className = 'file-icon';
    icon.textContent = name.startsWith('figures/') ? 'F' : name.endsWith('.bib') ? 'B' : 'T';
    const label = document.createElement('span');
    label.className = 'tab-name';
    label.textContent = name.split('/').at(-1);
    const close = document.createElement('span');
    close.className = 'tab-close';
    close.textContent = '×';
    close.addEventListener('click', (event) => {
      event.stopPropagation();
      const index = openTabs.indexOf(name);
      openTabs.splice(index, 1);
      if (activeFile === name) openFile(openTabs[Math.max(0, index - 1)] || 'main.tex');
      else renderTabs();
    });
    tab.append(icon, label, close);
    list.append(tab);
  }
}
function markSelectedFile() {
  $$('.outline-item,.file-item').forEach((item) => item.classList.toggle('active', item.dataset.file === activeFile));
}
async function openFile(name, line) {
  if (name.startsWith('figures/')) {
    const item = figures.find((figure) => figure.name === name);
    if (!item) return;
    activeFile = name;
    if (!openTabs.includes(name)) openTabs.push(name);
    $('#source-editor').hidden = true;
    $('#line-numbers').hidden = true;
    $('#figure-view').hidden = false;
    $('#figure-image').src = item.image;
    $('#figure-image').alt = name;
    $('#figure-name').textContent = name;
    $('#source-status').textContent = name;
    renderTabs();
    markSelectedFile();
    return;
  }
  if (!project.files.includes(name)) return;
  try {
    const content = await sourceText(name);
    activeFile = name;
    if (!openTabs.includes(name)) openTabs.push(name);
    $('#source-editor').hidden = false;
    $('#line-numbers').hidden = false;
    $('#figure-view').hidden = true;
    $('#source-editor').value = content;
    $('#source-status').textContent = name + ' · ' + (settings.language === 'zh' ? '已保存到浏览器' : 'Saved in browser');
    renderLineNumbers();
    renderTabs();
    markSelectedFile();
    if (line) jumpToLine(line);
  } catch (error) { toast(error.message); }
}
function jumpToLine(line) {
  const editor = $('#source-editor');
  const lines = editor.value.split('\n');
  const start = lines.slice(0, Math.max(0, line - 1)).join('\n').length + (line > 1 ? 1 : 0);
  editor.focus();
  editor.setSelectionRange(start, start + (lines[line - 1] || '').length);
  editor.scrollTop = Math.max(0, (line - 5) * 19);
}
function renderOutline() {
  const list = $('#outline-list');
  list.replaceChildren();
  for (const item of project.outline) {
    const button = makeButton('outline-item level-' + item.level, '', () => {
      openFile(item.file, item.line);
      if (window.innerWidth <= 600) $('#demo-grid').classList.remove('rail-open');
    });
    button.dataset.file = item.file;
    const number = document.createElement('span');
    number.className = 'outline-num';
    number.textContent = item.number;
    const title = document.createElement('span');
    title.className = 'outline-text';
    title.textContent = item.title;
    title.title = item.title;
    button.append(number, title);
    list.append(button);
  }
}
function renderFiles() {
  const list = $('#file-list');
  list.replaceChildren();
  const groups = [
    ['PAPER SOURCE', project.files.filter((name) => !name.includes('/'))],
    ['CONFIGS', project.files.filter((name) => name.startsWith('configs/'))],
    ['FIGURES', figures.map((item) => item.name)]
  ];
  for (const [heading, names] of groups) {
    const folder = document.createElement('div');
    folder.className = 'folder-label';
    folder.textContent = heading;
    list.append(folder);
    for (const name of names) {
      const button = makeButton('file-item', '', () => openFile(name));
      button.dataset.file = name;
      const icon = document.createElement('span');
      icon.className = 'file-icon';
      icon.textContent = name.startsWith('figures/') ? 'F' : name.endsWith('.bib') ? 'B' : 'T';
      const label = document.createElement('span');
      label.textContent = name;
      button.append(icon, label);
      list.append(button);
    }
  }
}
async function searchProject() {
  const query = $('#project-search').value.trim().toLowerCase();
  const list = $('#search-results');
  list.replaceChildren();
  if (!query) { const hint = document.createElement('p'); hint.textContent = text('searchPrompt'); list.append(hint); return; }
  const matches = [];
  await Promise.all(project.files.map(async (name) => {
    try {
      const lines = (await sourceText(name)).split('\n');
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(query) && matches.length < 80) matches.push({name, line:index + 1, preview:line.trim()});
      });
    } catch (_) {}
  }));
  matches.sort((a,b) => a.name.localeCompare(b.name) || a.line - b.line);
  if (!matches.length) { const hint = document.createElement('p'); hint.textContent = settings.language === 'zh' ? '没有找到匹配。' : 'No matches found.'; list.append(hint); return; }
  for (const match of matches.slice(0, 40)) {
    const button = makeButton('search-result', '', () => openFile(match.name, match.line));
    const title = document.createElement('strong');
    title.textContent = match.name + ':' + match.line;
    const preview = document.createElement('span');
    preview.textContent = match.preview;
    button.append(title, preview);
    list.append(button);
  }
}
function findInSource() {
  if (activeFile.startsWith('figures/')) return;
  const query = $('#source-find').value;
  const editor = $('#source-editor');
  if (!query) { $('#source-find-count').textContent = '0 / 0'; return; }
  const haystack = editor.value.toLowerCase();
  const needle = query.toLowerCase();
  const positions = [];
  let from = 0;
  while ((from = haystack.indexOf(needle, from)) !== -1 && positions.length < 500) {
    positions.push(from);
    from += Math.max(1, needle.length);
  }
  const after = positions.findIndex((position) => position > editor.selectionStart);
  const index = after === -1 ? 0 : after;
  $('#source-find-count').textContent = positions.length ? (index + 1) + ' / ' + positions.length : '0 / 0';
  if (positions.length) {
    editor.focus();
    editor.setSelectionRange(positions[index], positions[index] + query.length);
    const line = editor.value.slice(0, positions[index]).split('\n').length;
    editor.scrollTop = Math.max(0, (line - 5) * 19);
  }
}
function showSourceFind() {
  $('#find-bar').hidden = false;
  $('#source-find').focus();
}
function renderQuickResults() {
  const query = $('#quick-input').value.trim().toLowerCase();
  const list = $('#quick-results');
  list.replaceChildren();
  for (const name of [...project.files, ...figures.map((figure) => figure.name)].filter((name) => name.toLowerCase().includes(query)).slice(0, 12)) {
    const button = makeButton('quick-result', name, () => {
      $('#quick-dialog').close();
      openFile(name);
    });
    list.append(button);
  }
}
function fitWidth() { zoomFactor = 1; renderPdfPage(); }
function ensurePdfPagesContainer() {
  let container = $('#pdf-pages');
  if (!container) {
    container = document.createElement('div');
    container.id = 'pdf-pages';
    container.className = 'pdf-pages';
    const legacyCanvas = $('#pdf-canvas');
    if (legacyCanvas) legacyCanvas.before(container);
    else $('#pdf-stage').append(container);
  }
  return container;
}
function createPdfPages() {
  // A previously cached single-page script still expects this canvas.
  const container = ensurePdfPagesContainer();
  $('#pdf-canvas')?.remove();
  container.replaceChildren();
  pdfPages = [];
  for (let number = 1; number <= pdfDoc.numPages; number++) {
    const node = document.createElement('div');
    node.className = 'pdf-page';
    node.dataset.page = number;
    const canvas = document.createElement('canvas');
    canvas.hidden = true;
    canvas.setAttribute('aria-label', `JiT paper PDF page ${number}`);
    const placeholder = document.createElement('div');
    placeholder.className = 'pdf-page-placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.textContent = String(number).padStart(2, '0');
    const badge = document.createElement('span');
    badge.className = 'pdf-page-number';
    badge.textContent = `${number} / ${pdfDoc.numPages}`;
    node.append(canvas, placeholder, badge);
    container.append(node);
    pdfPages.push({node, canvas, placeholder, task:null, promise:null, pendingVersion:-1, renderedVersion:-1});
  }
}
async function paintPdfPage(index) {
  const entry = pdfPages[index];
  if (!entry || !pdfDoc) return;
  const version = renderToken;
  if (entry.renderedVersion === version) return;
  if (entry.pendingVersion === version) return entry.promise;
  const previousTask = entry.task;
  entry.pendingVersion = version;
  entry.promise = (async () => {
    try {
      if (previousTask) {
        previousTask.cancel();
        await previousTask.promise.catch(() => {});
      }
      if (version !== renderToken) return;
      const page = await pdfDoc.getPage(index + 1);
      if (version !== renderToken) return;
      const viewport = page.getViewport({scale:entry.scale});
      const ratio = window.devicePixelRatio || 1;
      const canvas = entry.canvas;
      canvas.width = Math.round(viewport.width * ratio);
      canvas.height = Math.round(viewport.height * ratio);
      canvas.style.width = viewport.width + 'px';
      canvas.style.height = viewport.height + 'px';
      const context = canvas.getContext('2d');
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      entry.task = page.render({canvasContext:context, viewport});
      await entry.task.promise;
      if (version !== renderToken) return;
      canvas.hidden = false;
      entry.placeholder.hidden = true;
      entry.renderedVersion = version;
      if (index === 0) $('#pdf-loading').hidden = true;
    } catch (error) {
      if (version === renderToken && error.name !== 'RenderingCancelledException') {
        entry.placeholder.textContent = settings.language === 'zh' ? '页面加载失败' : 'Page unavailable';
        if (index === 0) ($('#pdf-loading-text') || $('#pdf-loading')).textContent = settings.language === 'zh' ? 'PDF 加载失败。' : 'PDF could not be loaded.';
      }
    } finally {
      if (entry.pendingVersion === version) entry.pendingVersion = -1;
    }
  })();
  return entry.promise;
}
function renderVisiblePdfPages() {
  if (visibleRenderFrame) return;
  visibleRenderFrame = requestAnimationFrame(() => {
    visibleRenderFrame = 0;
    const stage = $('#pdf-stage');
    const bounds = stage.getBoundingClientRect();
    pdfPages.forEach((entry, index) => {
      const pageBounds = entry.node.getBoundingClientRect();
      if (pageBounds.bottom >= bounds.top - stage.clientHeight && pageBounds.top <= bounds.bottom + stage.clientHeight) {
        void paintPdfPage(index);
      }
    });
  });
}
async function renderPdfPage() {
  if (!pdfDoc || !pdfPages.length) return;
  const stage = $('#pdf-stage');
  const base = await pdfDoc.getPage(1);
  const dimensions = base.getViewport({scale:1});
  const fit = Math.min(1.55, Math.max(.4, (stage.clientWidth - 38) / dimensions.width));
  const scale = fit * zoomFactor;
  renderToken++;
  pdfPages.forEach((entry) => {
    entry.scale = scale;
    entry.node.style.width = `${dimensions.width * scale}px`;
    entry.node.style.height = `${dimensions.height * scale}px`;
    entry.canvas.hidden = true;
    entry.placeholder.hidden = false;
    entry.renderedVersion = -1;
  });
  goToPage(pageNumber, false);
  renderVisiblePdfPages();
  await paintPdfPage(pageNumber - 1);
}
function goToPage(number, smooth = true) {
  if (!pdfDoc) return;
  pageNumber = Math.max(1, Math.min(pdfDoc.numPages, Math.round(Number(number) || 1)));
  $('#page-input').value = pageNumber;
  const stage = $('#pdf-stage');
  const entry = pdfPages[pageNumber - 1];
  if (!entry) return;
  const top = stage.scrollTop + entry.node.getBoundingClientRect().top - stage.getBoundingClientRect().top - 13;
  stage.scrollTo({top:Math.max(0, top), behavior:smooth ? 'smooth' : 'auto'});
  renderVisiblePdfPages();
}
async function searchPdf() {
  if (!pdfDoc) return;
  const query = $('#pdf-find').value.trim().toLowerCase();
  if (!query) return;
  const total = pdfDoc.numPages;
  for (let offset = 1; offset <= total; offset++) {
    const candidate = ((pageNumber - 1 + offset) % total) + 1;
    const page = await pdfDoc.getPage(candidate);
    const content = await page.getTextContent();
    if (content.items.map((item) => item.str).join(' ').toLowerCase().includes(query)) {
      goToPage(candidate);
      toast((settings.language === 'zh' ? '在第 ' : 'Found on page ') + candidate + (settings.language === 'zh' ? ' 页找到匹配。' : '.'));
      return;
    }
  }
  toast(settings.language === 'zh' ? 'PDF 中没有找到匹配。' : 'No PDF match found.');
}
function switchRail(panel) {
  $$('.rail-tab').forEach((button) => button.classList.toggle('active', button.dataset.panel === panel));
  $$('.rail-panel').forEach((element) => element.classList.toggle('active', element.id === panel + '-panel'));
  if (panel === 'search') $('#project-search').focus();
}
function openSettings() {
  $('#settings-compiler').value = settings.compiler;
  $('#settings-auto-title').checked = settings.autoTitle;
  $('#settings-title').value = settings.title;
  $('#settings-title').disabled = settings.autoTitle;
  $('#settings-dialog').showModal();
}
function bindControls() {
  ensurePdfPagesContainer();
  $$('.rail-tab').forEach((button) => button.addEventListener('click', () => switchRail(button.dataset.panel)));
  $('#project-search').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(searchProject, 180); });
  $('#source-editor').addEventListener('input', () => {
    edits[activeFile] = $('#source-editor').value;
    saveEdits();
    renderLineNumbers();
    $('#source-status').textContent = activeFile + ' · ' + (settings.language === 'zh' ? '已保存到浏览器' : 'Saved in browser');
  });
  $('#source-editor').addEventListener('scroll', () => { $('#line-numbers').scrollTop = $('#source-editor').scrollTop; });
  $('#source-editor').addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const editor = event.currentTarget;
      const start = editor.selectionStart;
      editor.setRangeText('  ', start, editor.selectionEnd, 'end');
      editor.dispatchEvent(new Event('input'));
    }
  });
  $('#source-find-button').addEventListener('click', showSourceFind);
  $('#source-find').addEventListener('input', findInSource);
  $('#source-find-next').addEventListener('click', findInSource);
  $('#source-find-close').addEventListener('click', () => { $('#find-bar').hidden = true; });
  $('#quick-open-button').addEventListener('click', () => { renderQuickResults(); $('#quick-dialog').showModal(); $('#quick-input').focus(); });
  $('#quick-input').addEventListener('input', renderQuickResults);
  $('#quick-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); $('#quick-results button')?.click(); }
    if (event.key === 'ArrowDown') { event.preventDefault(); $('#quick-results button')?.focus(); }
  });
  $('#quick-close').addEventListener('click', () => $('#quick-dialog').close());
  $('#settings-button').addEventListener('click', openSettings);
  $('#settings-close').addEventListener('click', () => $('#settings-dialog').close());
  $('#settings-cancel').addEventListener('click', () => $('#settings-dialog').close());
  $('#settings-auto-title').addEventListener('change', () => { $('#settings-title').disabled = $('#settings-auto-title').checked; });
  $('#settings-form').addEventListener('submit', (event) => {
    event.preventDefault();
    settings.compiler = $('#settings-compiler').value;
    settings.autoTitle = $('#settings-auto-title').checked;
    settings.title = $('#settings-title').value.trim();
    applyPreferences();
    $('#settings-dialog').close();
    toast(settings.language === 'zh' ? '展示设置已保存在浏览器。编译器更换需要本地应用。' : 'Display settings saved in this browser. Compiler changes need the local app.');
  });
  $('#theme-button').addEventListener('click', () => { settings.theme = settings.theme === 'dark' ? 'light' : 'dark'; applyPreferences(); renderPdfPage(); });
  $('#accent-button').addEventListener('click', () => { settings.accent = accents[(accents.indexOf(settings.accent) + 1) % accents.length]; applyPreferences(); });
  $('#language-button').addEventListener('click', () => { settings.language = settings.language === 'en' ? 'zh' : 'en'; applyPreferences(); });
  $('#compile-button').addEventListener('click', () => toast(settings.language === 'zh' ? '真实编译需要本地安装 LeafOver。' : 'Real compilation is available in the locally installed app.'));
  $('#terminal-button').addEventListener('click', () => { $('#terminal-drawer').hidden = !$('#terminal-drawer').hidden; });
  $('#terminal-close').addEventListener('click', () => { $('#terminal-drawer').hidden = true; });
  $('#sidebar-toggle').addEventListener('click', () => {
    if (window.innerWidth <= 600) $('#demo-grid').classList.toggle('rail-open');
    else $('#demo-grid').classList.toggle('rail-hidden');
    setTimeout(renderPdfPage, 80);
  });
  $('#mobile-source').addEventListener('click', () => {
    $('#demo-grid').classList.remove('mobile-preview');
    $('#mobile-source').classList.add('active');
    $('#mobile-preview').classList.remove('active');
  });
  $('#mobile-preview').addEventListener('click', () => {
    $('#demo-grid').classList.add('mobile-preview');
    $('#mobile-preview').classList.add('active');
    $('#mobile-source').classList.remove('active');
    setTimeout(renderPdfPage, 80);
  });
  $('#prev-page').addEventListener('click', () => goToPage(pageNumber - 1));
  $('#next-page').addEventListener('click', () => goToPage(pageNumber + 1));
  $('#page-input').addEventListener('change', (event) => goToPage(event.target.value));
  $('#zoom-out').addEventListener('click', () => { zoomFactor = Math.max(.5, zoomFactor - .15); renderPdfPage(); });
  $('#zoom-in').addEventListener('click', () => { zoomFactor = Math.min(2.5, zoomFactor + .15); renderPdfPage(); });
  $('#fit-width').addEventListener('click', fitWidth);
  $('#pdf-find-button').addEventListener('click', () => { $('#pdf-find-bar').hidden = false; $('#pdf-find').focus(); });
  $('#pdf-find-close').addEventListener('click', () => { $('#pdf-find-bar').hidden = true; });
  $('#pdf-find-next').addEventListener('click', searchPdf);
  $('#pdf-find').addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); searchPdf(); } });
  $('#pdf-stage').addEventListener('scroll', () => {
    renderVisiblePdfPages();
    const stage = $('#pdf-stage');
    const midpoint = stage.getBoundingClientRect().top + stage.clientHeight * .45;
    const visible = pdfPages.findIndex((entry) => entry.node.getBoundingClientRect().bottom >= midpoint);
    if (visible >= 0) {
      pageNumber = visible + 1;
      if (document.activeElement !== $('#page-input')) $('#page-input').value = pageNumber;
    }
  }, {passive:true});
  $('#pdf-pages').addEventListener('click', (event) => {
    const page = event.target.closest('.pdf-page');
    if (!page) return;
    const selectedPage = Number(page.dataset.page);
    const name = selectedPage <= 3 ? 'intro.tex' : selectedPage <= 7 ? 'method.tex' : 'experiments.tex';
    openFile(name);
    toast(settings.language === 'zh' ? '已打开相关源码；精确 SyncTeX 跳转需要本地应用。' : 'Opened related source. Exact SyncTeX navigation needs the local app.');
  });
  $('#copy-install').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('#install-code').textContent.trim()); toast(settings.language === 'zh' ? '安装命令已复制。' : 'Install commands copied.'); }
    catch (_) { toast(settings.language === 'zh' ? '请手动复制安装命令。' : 'Select and copy the install commands.'); }
  });
  document.addEventListener('keydown', (event) => {
    const command = event.ctrlKey || event.metaKey;
    if (command && event.key.toLowerCase() === 'p') {
      event.preventDefault(); renderQuickResults(); $('#quick-dialog').showModal(); $('#quick-input').focus();
    } else if (command && event.key.toLowerCase() === 'f' && document.activeElement === $('#source-editor')) {
      event.preventDefault(); showSourceFind();
    } else if (command && event.key.toLowerCase() === 's') {
      event.preventDefault(); saveEdits(); toast(settings.language === 'zh' ? '已保存到浏览器。' : 'Saved in browser.');
    } else if (event.key === 'Escape') {
      $('#terminal-drawer').hidden = true;
      $('#demo-grid').classList.remove('rail-open');
    }
  });
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(renderPdfPage, 180); });
}
async function boot() {
  applyPreferences();
  bindControls();
  try {
    const response = await fetch('./data/project.json');
    if (!response.ok) throw new Error('Project metadata unavailable');
    project = await response.json();
    renderOutline();
    renderFiles();
    await openFile('main.tex');
    pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/pdf.worker.min.js';
    pdfDoc = await pdfjsLib.getDocument({url:'./assets/jit-preview.pdf'}).promise;
    $('#page-total').textContent = '/ ' + pdfDoc.numPages;
    $('#page-input').max = pdfDoc.numPages;
    createPdfPages();
    await renderPdfPage();
  } catch (error) {
    ($('#pdf-loading-text') || $('#pdf-loading')).textContent = error.message;
    toast(error.message);
  }
}
boot();
