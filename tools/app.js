/* Leafover: source editing, figure browsing, live compilation, and PDF viewing. */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const translations = {
  '切换项目侧栏': 'Toggle project sidebar', '切换源码面板': 'Toggle source panel',
  '终端': 'Terminal', '打开终端 (Ctrl+`)': 'Open terminal (Ctrl+`)',
  '重新编译': 'Recompile', '编译中…': 'Compiling…', '编译失败': 'Compilation failed',
  '切换主题': 'Toggle theme', '打包下载 LaTeX 源码': 'Download LaTeX source', '下载 PDF': 'Download PDF',
  '大纲': 'Outline', '文件': 'Files', '搜索': 'Search', 'DOCUMENT OUTLINE': 'DOCUMENT OUTLINE',
  'PROJECT FILES': 'PROJECT FILES', '论文根目录文本文件、tables/research/notes 及 figures 图片和 PDF': 'Project source files and figures',
  '在项目中搜索': 'Search project', '区分大小写': 'Match case', '全词匹配': 'Whole word',
  '正则表达式': 'Regular expression', '输入关键词搜索论文源码': 'Search paper source files',
  '已打开的文件': 'Open files', '保存 (Ctrl/Cmd+S)': 'Save (Ctrl/Cmd+S)', '载入中': 'Loading',
  '搜索当前文件 (Ctrl/Cmd+F)': 'Find in current file (Ctrl/Cmd+F)', '搜索当前文件': 'Find in current file',
  '隐藏源码': 'Hide source', '上一个匹配': 'Previous match', '下一个匹配': 'Next match',
  '关闭搜索': 'Close search', '关闭': 'Close', '论文源码编辑器': 'Paper source editor', '正在载入源码…': 'Loading source…',
  '引用补全': 'Citation suggestions', '自动保存': 'Autosave', '拖动调整宽度': 'Drag to resize',
  '拖动调整终端高度': 'Drag to resize terminal', '新建终端': 'New terminal',
  '终止当前终端': 'Stop current terminal', '收起终端': 'Collapse terminal',
  '上一页 (←)': 'Previous page (←)', '下一页 (→)': 'Next page (→)', '当前页': 'Current page',
  '缩小 (-)': 'Zoom out (-)', '放大 (+)': 'Zoom in (+)', '适合宽度': 'Fit width', '整页': 'Fit page',
  '搜索 PDF (Ctrl/Cmd+F)': 'Search PDF (Ctrl/Cmd+F)', '搜索 PDF': 'Search PDF',
  '双击 PDF 正文可定位到对应源码': 'Double-click PDF text to locate its source',
  '重新编译后启用 PDF 到源码定位': 'Recompile to enable PDF-to-source navigation',
  '日志': 'Logs', '在新标签页打开原始 PDF': 'Open original PDF in a new tab',
  '正在载入论文': 'Loading paper', '首次编译可能需要一点时间': 'The first compilation may take a moment',
  '编译日志': 'Compilation log', '等待编译': 'Waiting for compilation', '复制日志': 'Copy log',
  '暂无编译日志。': 'No compilation log yet.', '快速打开': 'Quick open',
  '输入文件名，@ 搜索章节，: 跳转行号': 'Type a file name, @ for sections, : for line numbers',
  '↑↓ 选择': '↑↓ Select', 'Enter 打开': 'Enter Open', 'Esc 关闭': 'Esc Close',
  'PDF→源码': 'PDF→Source', '从文件列表打开文件': 'Open a file from the file list',
  '未打开文件': 'No file open', '保存中…': 'Saving…', '外部修改冲突': 'External edit conflict',
  '文件已在外部修改，请刷新页面后重新编辑': 'This file changed outside Leafover. Refresh before editing again.',
  '已保存': 'Saved', '未保存': 'Unsaved', '保存失败': 'Save failed', '表达式错误': 'Invalid expression',
  '当前预览不是可搜索的源码文件': 'The current preview is not a searchable source file',
  '载入失败': 'Load failed', 'PDF 预览': 'PDF preview', '图片预览': 'Image preview', '预览': 'Preview',
  '没有找到匹配内容': 'No matches found',
  '搜索 .tex、.bib 和 Markdown 源码': 'Search .tex, .bib, and Markdown files',
  '当前未保存内容也会参与搜索': 'Unsaved changes are included', '图': 'Figure',
  '正在搜索…': 'Searching…', '搜索中…': 'Searching…',
  '仅显示前 500 个文本结果': 'Showing the first 500 text matches',
  'PDF 暂时不可用': 'PDF unavailable', '请重新编译': 'Please recompile',
  '编译失败，点击“日志”查看详情': 'Compilation failed. Open Logs for details.',
  '源码尚未保存，已取消编译': 'Compilation cancelled because the source is not saved',
  '终端已连接': 'Terminal connected', '终端已断开': 'Terminal disconnected',
  '正在连接': 'Connecting', '论文目录': 'Paper directory', 'xterm.js 载入失败': 'Failed to load xterm.js',
  '终端组件载入失败': 'Failed to load terminal component',
  '解锁远程终端': 'Unlock remote terminal', '输入此工作台的终端访问密钥。': 'Enter the terminal access key for this workspace.',
  '终端访问密钥': 'Terminal access key', '解锁终端': 'Unlock terminal',
  '较早的终端输出已被截断': 'Earlier terminal output was truncated',
  '终端进程已退出': 'Terminal process exited', '终端连接波动，正在自动重试': 'Terminal connection interrupted; retrying',
  '暂无终端会话': 'No terminal session', '文件列表已更新': 'File list updated',
  'PDF 已更新': 'PDF updated', '连接中断': 'Connection lost',
  '没有匹配的文件或章节': 'No matching files or sections', '日志已复制': 'Log copied',
  '无法定位此 PDF 链接，请尝试重新载入 PDF': 'Could not follow this PDF link. Try reloading the PDF.',
  '跳转到引用位置': 'Go to reference',
  'pdf.js 加载失败': 'Failed to load pdf.js', '请确认地址以 / 结尾后刷新。': 'Ensure the URL ends in /, then refresh.',
  '主题色': 'Accent color', '经典绿': 'Classic green', '天空蓝': 'Sky blue',
  '紫罗兰': 'Violet', '暖橙': 'Warm orange', '玫瑰红': 'Rose',
  '自定义颜色': 'Custom color', '恢复默认绿色': 'Restore default green',
};
Object.assign(translations, {
  '项目设置': 'Project settings', 'LaTeX 主文件': 'Main LaTeX file',
  '从论文自动读取标题': 'Read the title from the paper', '显示标题': 'Display title',
  '输入自定义标题': 'Enter a custom title',
  '编译器': 'Compiler', '检测中…': 'Checking…', '一键安装': 'Install', '安装日志': 'Installation log',
  '已安装': 'Installed', '未安装': 'Not installed', '安装中…': 'Installing…', '安装失败': 'Installation failed',
  '取消': 'Cancel', '保存设置': 'Save settings', '设置已保存': 'Settings saved',
});
const reverseTranslations = Object.fromEntries(Object.entries(translations).map(([zh, en]) => [en, zh]));
let locale = localStorage.getItem('leafover-language') || (navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en');
if (!['zh', 'en'].includes(locale)) locale = 'en';
function tr(zh) { return locale === 'en' ? (translations[zh] || zh) : zh; }
function localized(zh, en) { return locale === 'en' ? en : zh; }
function localizeInterface() {
  document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement?.closest('textarea, pre, .source-highlights, .text-layer, .xterm')) continue;
    const source = node._leafoverSource ?? reverseTranslations[node.textContent.trim()] ?? node.textContent;
    if (translations[source.trim()]) {
      node._leafoverSource = source;
      node.textContent = source.replace(source.trim(), tr(source.trim()));
    }
  }
  for (const element of document.querySelectorAll('[title], [aria-label], [placeholder]')) {
    for (const attribute of ['title', 'aria-label', 'placeholder']) {
      const current = element.getAttribute(attribute);
      if (!current) continue;
      const source = element.dataset[`leafover${attribute.replace('-', '')}`] || reverseTranslations[current] || current;
      if (translations[source]) {
        element.dataset[`leafover${attribute.replace('-', '')}`] = source;
        element.setAttribute(attribute, tr(source));
      }
    }
  }
  const switcher = $('#language-toggle');
  switcher.textContent = locale === 'zh' ? 'EN' : '中';
  switcher.title = switcher.ariaLabel = locale === 'zh' ? '切换到英文' : 'Switch to Chinese';
}
const scroller = $('#pdf-scroller');
const strip = $('#pdf-strip');
const workspace = $('#workspace');

if (typeof pdfjsLib === 'undefined') {
  $('#pdf-hint').innerHTML = `<strong>${tr('pdf.js 加载失败')}</strong><span>${tr('请确认地址以 / 结尾后刷新。')}</span>`;
  throw new Error('pdf.js is not available');
}
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs/pdf.worker.min.js', location.href).href;

let pdf = null;
let scale = null;
let fitMode = 'width';
let pageCount = 0;
let pages = [];
let mainSource = 'main.tex';
let currentSource = mainSource;
let currentFigure = null;
let currentFigureRevision = null;
let sourceRevision = null;
let sourceDirty = false;
let sourceMode = 'source';
let saveTimer = null;
let sourceSavePromise = null;
let compilePending = false;
let sourceLoadToken = 0;
let navigationToken = 0;
let openTabs = [];
let activeTabKey = null;
let lastPdf;
let lastProject;
let lastState = '';
let lastStatusData = null;
let latestLog = '';
let renderTimer;
let toastTimer;
let lineNumberFrame;
let terminal = null;
let terminalAccessKey = sessionStorage.getItem('leafover-terminal-access-key') || '';
let terminalSessions = [];
try {
  const storedSessions = JSON.parse(sessionStorage.getItem('paper-preview-terminal-sessions') || '[]');
  if (Array.isArray(storedSessions)) terminalSessions = storedSessions.filter((item) => item && typeof item.id === 'string');
} catch (_) {
  terminalSessions = [];
}
const legacyTerminalSession = sessionStorage.getItem('paper-preview-terminal-session');
if (legacyTerminalSession && !terminalSessions.some((item) => item.id === legacyTerminalSession)) {
  terminalSessions.push({id: legacyTerminalSession, title: 'Terminal 1'});
}
sessionStorage.removeItem('paper-preview-terminal-session');
let activeTerminalId = sessionStorage.getItem('paper-preview-active-terminal') || terminalSessions[0]?.id || null;
if (!terminalSessions.some((item) => item.id === activeTerminalId)) activeTerminalId = terminalSessions[0]?.id || null;
let terminalCounter = terminalSessions.reduce((maximum, item) => {
  const number = Number(String(item.title || '').match(/\d+/)?.[0]);
  return Math.max(maximum, Number.isFinite(number) ? number : 0);
}, 0);
let terminalOffset = 0;
let terminalPollFailures = 0;
let terminalPollTimer;
let terminalPollController;
let terminalResizeTimer;
let terminalInputTimer;
let terminalInputQueue = [];
let terminalInputBusy = false;
let projectData = {files: [], figures: [], outline: []};
let projectSearchTimer;
let projectSearchToken = 0;
let projectSearchResults = [];
let projectSearchIndex = -1;
let projectSearchSummary = null;
let sourceFindMatches = [];
let sourceFindIndex = -1;
let pdfFindTimer;
let pdfFindToken = 0;
let pdfFindMatches = [];
let pdfFindIndex = -1;
let lastSearchContext = 'source';
let quickOpenItems = [];
let quickOpenIndex = 0;
const expandedFigureFolders = new Set();
const expandedSourceFolders = new Set();
let citationEntries = [];
let citationIndexRevision = null;
let citationLoadToken = 0;
let citationSuggestions = [];
let citationSuggestionIndex = 0;
let citationContext = null;
const composingInputs = new WeakSet();

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function searchOptions(prefix) {
  return {
    caseSensitive: $(`#${prefix}-case`)?.classList.contains('active') || false,
    wholeWord: $(`#${prefix}-word`)?.classList.contains('active') || false,
    regex: $(`#${prefix}-regex`)?.classList.contains('active') || false,
  };
}

function makeSearchExpression(query, options) {
  if (!query) return null;
  let pattern = options.regex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (options.wholeWord) pattern = `(?<!\\w)(?:${pattern})(?!\\w)`;
  return new RegExp(pattern, options.caseSensitive ? 'g' : 'gi');
}

function textMatches(text, query, options) {
  const expression = makeSearchExpression(query, options);
  if (!expression) return [];
  const matches = [];
  for (const match of text.matchAll(expression)) {
    matches.push({start: match.index, end: match.index + Math.max(1, match[0].length)});
    if (matches.length >= 2000) break;
  }
  return matches;
}

function bindCommittedInput(selector, onInput, onCompositionStart = () => {}) {
  const input = $(selector);
  let endTimer;
  input.addEventListener('compositionstart', () => {
    composingInputs.add(input);
    clearTimeout(endTimer);
    onCompositionStart();
  });
  input.addEventListener('compositionend', () => {
    composingInputs.delete(input);
    endTimer = setTimeout(onInput, 0);
  });
  input.addEventListener('input', (event) => {
    if (event.isComposing || composingInputs.has(input)) return;
    clearTimeout(endTimer);
    onInput();
  });
}

function isComposingKey(event) {
  return event.isComposing || event.keyCode === 229 || composingInputs.has(event.currentTarget);
}

function switchRailTab(name) {
  workspace.classList.remove('rail-hidden');
  $$('.rail-tab').forEach((item) => item.classList.toggle('active', item.dataset.tab === name));
  $$('.rail-panel').forEach((panel) => panel.classList.toggle('active', panel.id === `${name}-panel`));
  $('#project-rail').classList.toggle('searching', name === 'search');
}

function setSaveState(label, state = '') {
  const button = $('#save-source');
  button.textContent = label;
  button.className = `save-state ${state}`;
  button.disabled = sourceMode !== 'source';
}

function tabKey(kind, name) {
  return `${kind}:${name}`;
}

function rememberActiveTabView() {
  const tab = openTabs.find((item) => item.key === activeTabKey);
  if (!tab) return;
  if (sourceMode === 'source') {
    const editor = $('#source-editor');
    tab.view = {selectionStart: editor.selectionStart, selectionEnd: editor.selectionEnd,
      scrollTop: editor.scrollTop, scrollLeft: editor.scrollLeft};
  } else if (sourceMode === 'figure') {
    tab.scrollTop = $('#figure-preview').scrollTop;
  }
}

function renderOpenTabs() {
  const container = $('#editor-tabs');
  container.innerHTML = openTabs.map((tab) => {
    const label = tab.kind === 'figure' ? `figures/${tab.name}` : tab.name;
    const icon = tab.kind === 'figure' ? (tab.type === 'pdf' ? 'P' : 'I') : tab.name.endsWith('.bib') ? 'B' : tab.name.endsWith('.md') ? 'M' : 'T';
    return `<div class="file-tab ${tab.key === activeTabKey ? 'active' : ''}" role="tab" tabindex="0" aria-selected="${tab.key === activeTabKey}" data-key="${escapeHtml(tab.key)}" title="${escapeHtml(label)}"><span class="tex-icon">${icon}</span><span class="file-tab-name">${escapeHtml(label)}</span><button class="file-tab-close" type="button" title="${tr('关闭')} ${escapeHtml(label)}" aria-label="${tr('关闭')} ${escapeHtml(label)}">×</button></div>`;
  }).join('');
  container.querySelector('.file-tab.active')?.scrollIntoView({block: 'nearest', inline: 'nearest'});
}

function activateOpenTab(kind, name, metadata = {}) {
  const key = tabKey(kind, name);
  let tab = openTabs.find((item) => item.key === key);
  if (!tab) {
    tab = {key, kind, name, ...metadata};
    openTabs.push(tab);
  } else {
    Object.assign(tab, metadata);
  }
  activeTabKey = key;
  renderOpenTabs();
  return tab;
}

async function switchOpenTab(key) {
  if (key === activeTabKey) return;
  const tab = openTabs.find((item) => item.key === key);
  if (!tab) return;
  if (tab.kind === 'source') await loadSource(tab.name);
  else await openFigure(tab.name, tab.type, tab.size, tab.revision);
}

async function closeOpenTab(key) {
  const index = openTabs.findIndex((item) => item.key === key);
  if (index < 0) return;
  if (key !== activeTabKey) {
    openTabs[index].preview?.remove();
    openTabs.splice(index, 1);
    renderOpenTabs();
    return;
  }
  const request = ++navigationToken;
  if (sourceDirty && !(await saveSource())) return;
  if (request !== navigationToken) return;
  openTabs[index].preview?.remove();
  openTabs.splice(index, 1);
  activeTabKey = null;
  sourceMode = 'none';
  sourceDirty = false;
  currentSource = null;
  currentFigure = null;
  ++sourceLoadToken;
  $$('.file-row, .figure-row').forEach((row) => row.classList.remove('active'));
  $('#source-find').hidden = true;
  renderSourceHighlights();
  $('#source-editor').hidden = false;
  $('#source-editor').disabled = true;
  $('#source-editor').value = '';
  $('#source-editor').placeholder = tr('从文件列表打开文件');
  $('#line-numbers').hidden = true;
  $('#figure-preview').hidden = true;
  $('#source-lines').textContent = '—';
  $('#editor-mode').textContent = tr('未打开文件');
  setSaveState('—');
  renderOpenTabs();
  const next = openTabs[Math.min(index, openTabs.length - 1)];
  if (next) await switchOpenTab(next.key);
}

function renderLineNumbers() {
  const editor = $('#source-editor');
  if (editor.hidden || editor.clientWidth === 0) return;
  const computed = getComputedStyle(editor);
  const lineHeight = parseFloat(computed.lineHeight);
  const contentWidth = editor.clientWidth - parseFloat(computed.paddingLeft) - parseFloat(computed.paddingRight);
  const measure = document.createElement('div');
  Object.assign(measure.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    visibility: 'hidden',
    width: `${contentWidth}px`,
    font: computed.font,
    letterSpacing: computed.letterSpacing,
    lineHeight: computed.lineHeight,
    tabSize: computed.tabSize,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  });
  document.body.appendChild(measure);
  const fragment = document.createDocumentFragment();
  editor.value.split('\n').forEach((line, index) => {
    measure.textContent = line || '\u200b';
    const marker = document.createElement('span');
    marker.className = 'line-number';
    marker.textContent = index + 1;
    marker.style.height = `${Math.max(lineHeight, Math.ceil(measure.getBoundingClientRect().height))}px`;
    fragment.appendChild(marker);
  });
  measure.remove();
  $('#line-numbers').replaceChildren(fragment);
}

function updateEditorMetrics() {
  const lines = ($('#source-editor').value.match(/\n/g) || []).length + 1;
  $('#source-lines').textContent = localized(`${lines} 行 · 自动换行`, `${lines} lines · soft wrap`);
  cancelAnimationFrame(lineNumberFrame);
  lineNumberFrame = requestAnimationFrame(renderLineNumbers);
}

function cleanBibValue(value) {
  return value.replace(/[{}]/g, '').replace(/\\[a-zA-Z]+\s*/g, '').replace(/\s+/g, ' ').trim();
}

function bibField(block, name) {
  const match = new RegExp(`\\b${name}\\s*=\\s*`, 'i').exec(block);
  if (!match) return '';
  let index = match.index + match[0].length;
  const opener = block[index];
  if (opener === '{') {
    let depth = 1;
    const start = ++index;
    for (; index < block.length; index += 1) {
      if (block[index] === '{' && block[index - 1] !== '\\') depth += 1;
      else if (block[index] === '}' && block[index - 1] !== '\\' && --depth === 0) break;
    }
    return cleanBibValue(block.slice(start, index));
  }
  if (opener === '"') {
    const start = ++index;
    while (index < block.length && (block[index] !== '"' || block[index - 1] === '\\')) index += 1;
    return cleanBibValue(block.slice(start, index));
  }
  const end = block.indexOf(',', index);
  return cleanBibValue(block.slice(index, end < 0 ? block.length : end));
}

function parseBibliography(content) {
  const entries = new Map();
  const expression = /@([a-zA-Z]+)\s*\{\s*([^,\s]+)\s*,/g;
  for (const match of content.matchAll(expression)) {
    const type = match[1].toLocaleLowerCase();
    if (['comment', 'preamble', 'string'].includes(type)) continue;
    const opening = content.indexOf('{', match.index);
    let depth = 0;
    let closing = content.length;
    for (let index = opening; index < content.length; index += 1) {
      if (content[index] === '{' && content[index - 1] !== '\\') depth += 1;
      else if (content[index] === '}' && content[index - 1] !== '\\' && --depth === 0) {
        closing = index;
        break;
      }
    }
    const block = content.slice(opening + 1, closing);
    entries.set(match[2], {
      key: match[2],
      type,
      title: bibField(block, 'title'),
      author: bibField(block, 'author'),
      year: bibField(block, 'year'),
    });
  }
  return [...entries.values()].sort((left, right) => left.key.localeCompare(right.key));
}

async function refreshCitationIndex(files = projectData.files) {
  const bibliography = files.find((file) => file.name.endsWith('.bib'));
  if (!bibliography) {
    citationEntries = [];
    citationIndexRevision = null;
    closeCitationAutocomplete();
    return;
  }
  if (bibliography.revision === citationIndexRevision) return;
  const token = ++citationLoadToken;
  try {
    const response = await fetch(`api/source?file=${encodeURIComponent(bibliography.name)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (token !== citationLoadToken) return;
    citationEntries = parseBibliography(data.content);
    citationIndexRevision = data.revision;
    updateCitationAutocomplete();
  } catch (_) {
    // Keep the previous index available if a background refresh briefly fails.
  }
}

function citationAtCaret() {
  const editor = $('#source-editor');
  if (sourceMode !== 'source' || !currentSource.endsWith('.tex') || editor.selectionStart !== editor.selectionEnd) return null;
  const caret = editor.selectionStart;
  const before = editor.value.slice(Math.max(0, caret - 600), caret);
  const match = before.match(/\\(?:[a-zA-Z]*cite[a-zA-Z]*|nocite)\*?(?:\[[^\]\n]*\]){0,2}\{([^{}\n]*)$/);
  if (!match) return null;
  const contents = match[1];
  const parts = contents.split(',');
  const tail = parts.at(-1);
  const prefix = tail.trimStart();
  if (/\s/.test(prefix)) return null;
  return {
    caret,
    start: caret - prefix.length,
    prefix,
    used: new Set(parts.slice(0, -1).map((key) => key.trim()).filter(Boolean)),
  };
}

function editorCaretCoordinates(caret) {
  const editor = $('#source-editor');
  const computed = getComputedStyle(editor);
  const mirror = document.createElement('div');
  Object.assign(mirror.style, {
    position: 'fixed',
    visibility: 'hidden',
    left: '-10000px',
    top: '0',
    width: `${editor.clientWidth}px`,
    minHeight: `${editor.clientHeight}px`,
    padding: computed.padding,
    border: '0',
    boxSizing: computed.boxSizing,
    font: computed.font,
    letterSpacing: computed.letterSpacing,
    lineHeight: computed.lineHeight,
    tabSize: computed.tabSize,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    wordBreak: computed.wordBreak,
  });
  mirror.textContent = editor.value.slice(0, caret);
  const marker = document.createElement('span');
  marker.textContent = '\u200b';
  mirror.appendChild(marker);
  document.body.appendChild(mirror);
  const point = {left: editor.offsetLeft + marker.offsetLeft - editor.scrollLeft, top: editor.offsetTop + marker.offsetTop - editor.scrollTop + parseFloat(computed.lineHeight)};
  mirror.remove();
  return point;
}

function positionCitationAutocomplete() {
  const menu = $('#citation-autocomplete');
  if (menu.hidden || !citationContext) return;
  const wrap = $('#source-wrap');
  const point = editorCaretCoordinates(citationContext.caret);
  const left = Math.max(50, Math.min(point.left, wrap.clientWidth - menu.offsetWidth - 8));
  let top = point.top + 4;
  if (top + menu.offsetHeight > wrap.clientHeight - 8) top = point.top - menu.offsetHeight - 24;
  menu.style.left = `${left}px`;
  menu.style.top = `${Math.max(8, top)}px`;
}

function closeCitationAutocomplete() {
  $('#citation-autocomplete').hidden = true;
  citationSuggestions = [];
  citationSuggestionIndex = 0;
  citationContext = null;
}

function renderCitationAutocomplete() {
  const menu = $('#citation-autocomplete');
  if (!citationContext || !citationSuggestions.length) {
    closeCitationAutocomplete();
    return;
  }
  menu.innerHTML = citationSuggestions.map((entry, index) => `
    <button class="citation-option ${index === citationSuggestionIndex ? 'active' : ''}" role="option" aria-selected="${index === citationSuggestionIndex}" data-citation-index="${index}">
      <span class="citation-key">${escapeHtml(entry.key)}</span><span class="citation-year">${escapeHtml(entry.year)}</span>
      <span class="citation-detail">${escapeHtml(entry.title || entry.author || entry.type)}</span>
    </button>`).join('');
  menu.hidden = false;
  $$('.citation-option').forEach((button) => button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    acceptCitation(Number(button.dataset.citationIndex));
  }));
  positionCitationAutocomplete();
}

function updateCitationAutocomplete() {
  citationContext = citationAtCaret();
  if (!citationContext || !citationEntries.length) {
    closeCitationAutocomplete();
    return;
  }
  const term = citationContext.prefix.toLocaleLowerCase();
  citationSuggestions = citationEntries.filter((entry) => {
    if (citationContext.used.has(entry.key)) return false;
    return !term || `${entry.key} ${entry.title} ${entry.author}`.toLocaleLowerCase().includes(term);
  }).sort((left, right) => {
    const leftKey = left.key.toLocaleLowerCase();
    const rightKey = right.key.toLocaleLowerCase();
    return Number(rightKey.startsWith(term)) - Number(leftKey.startsWith(term)) || leftKey.localeCompare(rightKey);
  }).slice(0, 8);
  citationSuggestionIndex = 0;
  renderCitationAutocomplete();
}

function moveCitationSelection(delta) {
  if (!citationSuggestions.length) return;
  citationSuggestionIndex = (citationSuggestionIndex + delta + citationSuggestions.length) % citationSuggestions.length;
  renderCitationAutocomplete();
  $('#citation-autocomplete .citation-option.active')?.scrollIntoView({block: 'nearest'});
}

function acceptCitation(index = citationSuggestionIndex) {
  const entry = citationSuggestions[index];
  const context = citationContext;
  if (!entry || !context) return;
  const editor = $('#source-editor');
  const hasClosingBrace = editor.value[context.caret] === '}';
  editor.setRangeText(entry.key + (hasClosingBrace ? '' : '}'), context.start, context.caret, 'end');
  const end = context.start + entry.key.length + 1;
  editor.setSelectionRange(end, end);
  closeCitationAutocomplete();
  editor.dispatchEvent(new Event('input', {bubbles: true}));
  editor.focus();
}

async function persistSourceRevision() {
  const name = currentSource;
  const content = $('#source-editor').value;
  const revision = sourceRevision;
  setSaveState(tr('保存中…'), 'saving');
  try {
    const response = await fetch('api/source', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name, content, base_revision: revision}),
    });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 409) {
        setSaveState(tr('外部修改冲突'), 'conflict');
        showToast(tr('文件已在外部修改，请刷新页面后重新编辑'));
        return false;
      }
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    if (currentSource === name && sourceMode === 'source') {
      sourceRevision = data.revision;
      if (name.endsWith('.bib')) {
        citationEntries = parseBibliography(content);
        citationIndexRevision = data.revision;
      }
      if ($('#source-editor').value === content) {
        sourceDirty = false;
        setSaveState(tr('已保存'));
      } else {
        setSaveState(tr('未保存'), 'dirty');
        saveTimer = setTimeout(saveSource, 700);
      }
    }
    return true;
  } catch (error) {
    setSaveState(tr('保存失败'), 'conflict');
    showToast(localized(`保存失败：${error.message}`, `Save failed: ${error.message}`));
    return false;
  }
}

async function saveSource() {
  clearTimeout(saveTimer);
  if (sourceSavePromise) {
    const saved = await sourceSavePromise;
    if (!saved) return false;
    return sourceDirty ? saveSource() : true;
  }
  if (sourceMode !== 'source' || !sourceDirty) return true;
  const request = persistSourceRevision();
  sourceSavePromise = request;
  const saved = await request;
  if (sourceSavePromise === request) sourceSavePromise = null;
  if (!saved) return false;
  return sourceDirty ? saveSource() : true;
}

function syncSourceHighlights() {
  const layer = $('#source-highlights');
  const editor = $('#source-editor');
  if (layer.hidden) return;
  layer.style.left = `${$('#line-numbers').offsetWidth}px`;
  layer.style.width = `${editor.clientWidth}px`;
  layer.style.height = `${editor.clientHeight}px`;
  layer.scrollTop = editor.scrollTop;
}

function renderSourceHighlights() {
  const layer = $('#source-highlights');
  const content = $('#source-editor').value;
  if ($('#source-find').hidden || !sourceFindMatches.length) {
    layer.hidden = true;
    $('#source-wrap').classList.remove('finding');
    return;
  }
  let offset = 0;
  layer.innerHTML = sourceFindMatches.map((match, index) => {
    const before = escapeHtml(content.slice(offset, match.start));
    const marked = `<mark class="${index === sourceFindIndex ? 'current' : ''}">${escapeHtml(content.slice(match.start, match.end))}</mark>`;
    offset = match.end;
    return before + marked;
  }).join('') + escapeHtml(content.slice(offset)) + '\n';
  layer.hidden = false;
  $('#source-wrap').classList.add('finding');
  requestAnimationFrame(syncSourceHighlights);
}

function scrollSourceMatchIntoView(returnToFind) {
  requestAnimationFrame(() => {
    const editor = $('#source-editor');
    const marker = $('#source-highlights mark.current');
    if (!marker) return;
    const margin = Math.min(72, editor.clientHeight * .2);
    const markerTop = marker.offsetTop;
    const markerBottom = markerTop + Math.max(marker.offsetHeight, parseFloat(getComputedStyle(editor).lineHeight));
    const visibleTop = editor.scrollTop + margin;
    const visibleBottom = editor.scrollTop + editor.clientHeight - margin;
    if (markerTop < visibleTop || markerBottom > visibleBottom) {
      editor.scrollTop = Math.max(0, markerTop - editor.clientHeight * .4);
      $('#line-numbers').scrollTop = editor.scrollTop;
      syncSourceHighlights();
    }
    if (returnToFind) $('#source-find-input').focus();
  });
}

function selectSourceMatch(index) {
  if (!sourceFindMatches.length) return;
  sourceFindIndex = (index + sourceFindMatches.length) % sourceFindMatches.length;
  const match = sourceFindMatches[sourceFindIndex];
  const editor = $('#source-editor');
  const returnToFind = document.activeElement === $('#source-find-input');
  editor.setSelectionRange(match.start, match.end);
  $('#source-find-count').textContent = `${sourceFindIndex + 1} / ${sourceFindMatches.length}`;
  renderSourceHighlights();
  scrollSourceMatchIntoView(returnToFind);
}

function navigateSourceFind(delta) {
  if (!sourceFindMatches.length) return;
  if (sourceFindIndex >= 0) {
    selectSourceMatch(sourceFindIndex + delta);
    return;
  }
  const caret = $('#source-editor').selectionStart;
  let index;
  if (delta > 0) {
    index = sourceFindMatches.findIndex((match) => match.start >= caret);
    if (index < 0) index = 0;
  } else {
    index = sourceFindMatches.length - 1;
    while (index >= 0 && sourceFindMatches[index].end > caret) index -= 1;
    if (index < 0) index = sourceFindMatches.length - 1;
  }
  selectSourceMatch(index);
}

function updateSourceFind(resetIndex = true) {
  if (composingInputs.has($('#source-find-input'))) return;
  const query = $('#source-find-input').value;
  try {
    sourceFindMatches = sourceMode === 'source' ? textMatches($('#source-editor').value, query, searchOptions('source-find')) : [];
    if (resetIndex) sourceFindIndex = sourceFindMatches.length ? 0 : -1;
    $('#source-find-input').setCustomValidity('');
    $('#source-find-count').textContent = sourceFindMatches.length ? `${sourceFindIndex + 1} / ${sourceFindMatches.length}` : '0 / 0';
    if (sourceFindIndex >= 0) selectSourceMatch(sourceFindIndex);
    else renderSourceHighlights();
  } catch (error) {
    sourceFindMatches = [];
    sourceFindIndex = -1;
    $('#source-find-count').textContent = tr('表达式错误');
    $('#source-find-input').setCustomValidity(error.message);
    renderSourceHighlights();
  }
}

function openSourceFind() {
  if (sourceMode !== 'source') {
    showToast(tr('当前预览不是可搜索的源码文件'));
    return;
  }
  lastSearchContext = 'source';
  $('#source-find').hidden = false;
  const input = $('#source-find-input');
  const editor = $('#source-editor');
  const selected = editor.value.slice(editor.selectionStart, editor.selectionEnd);
  if (selected && !selected.includes('\n') && selected.length <= 100) input.value = selected;
  updateSourceFind();
  input.focus();
  input.select();
}

function closeSourceFind() {
  $('#source-find').hidden = true;
  renderSourceHighlights();
  $('#source-editor').focus();
}

async function loadSource(name = mainSource, focusLine = null, focusColumn = null, focusLength = null, preserveView = false) {
  const request = ++navigationToken;
  if (sourceDirty && !(await saveSource())) return;
  if (request !== navigationToken) return;
  closeCitationAutocomplete();
  const editor = $('#source-editor');
  rememberActiveTabView();
  const previousView = !focusLine || preserveView
    ? openTabs.find((item) => item.key === tabKey('source', name))?.view : null;
  const token = ++sourceLoadToken;
  sourceMode = 'source';
  currentSource = name;
  currentFigure = null;
  activateOpenTab('source', name);
  revealSourcePath(name);
  $$('.file-row').forEach((row) => row.classList.toggle('active', row.dataset.file === name));
  $$('.figure-row').forEach((row) => row.classList.remove('active'));
  $('#source-editor').hidden = false;
  $('#source-editor').placeholder = '';
  $('#line-numbers').hidden = false;
  $('#figure-preview').hidden = true;
  $('#editor-mode').textContent = tr('自动保存');
  $('#source-editor').disabled = true;
  $('#source-editor').value = tr('正在载入源码…');
  setSaveState(tr('载入中'));
  try {
    const response = await fetch(`api/source?file=${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (token !== sourceLoadToken) return;
    sourceRevision = data.revision;
    sourceDirty = false;
    $('#source-editor').value = data.content;
    $('#source-editor').disabled = false;
    updateEditorMetrics();
    setSaveState(tr('已保存'));
    if (!$('#source-find').hidden) updateSourceFind();
    if (focusLine) {
      const lines = data.content.split('\n');
      const lineStart = lines.slice(0, Math.max(0, focusLine - 1)).join('\n').length + (focusLine > 1 ? 1 : 0);
      const line = lines[Math.max(0, focusLine - 1)] || '';
      const column = Math.max(0, Math.min(line.length, Number(focusColumn) || 0));
      const start = lineStart + column;
      const end = focusColumn === null ? lineStart + line.length : Math.min(lineStart + line.length, start + Math.max(1, Number(focusLength) || 1));
      editor.focus();
      editor.setSelectionRange(start, end);
      requestAnimationFrame(() => {
        const marker = $('#line-numbers').children[Math.max(0, focusLine - 1)];
        if (marker) editor.scrollTop = Math.max(0, marker.offsetTop - 50);
      });
    } else if (previousView) {
      const end = data.content.length;
      editor.setSelectionRange(Math.min(previousView.selectionStart, end), Math.min(previousView.selectionEnd, end));
      requestAnimationFrame(() => {
        editor.scrollTop = previousView.scrollTop;
        editor.scrollLeft = previousView.scrollLeft;
      });
    } else {
      editor.scrollTop = 0;
    }
  } catch (error) {
    if (token !== sourceLoadToken) return;
    $('#source-editor').value = localized(`源码载入失败：${error.message}`, `Failed to load source: ${error.message}`);
    setSaveState(tr('载入失败'), 'conflict');
  }
}

async function openFigure(name, type, size, revision) {
  const request = ++navigationToken;
  if (sourceDirty && !(await saveSource())) return;
  if (request !== navigationToken) return;
  closeCitationAutocomplete();
  rememberActiveTabView();
  $('#source-find').hidden = true;
  renderSourceHighlights();
  sourceMode = 'figure';
  currentFigure = name;
  currentFigureRevision = revision;
  const tab = activateOpenTab('figure', name, {type, size, revision});
  revealFigurePath(name);
  ++sourceLoadToken;
  $$('.file-row').forEach((row) => row.classList.remove('active'));
  $$('.figure-row').forEach((row) => row.classList.toggle('active', row.dataset.figure === name));
  $('#source-editor').hidden = true;
  $('#line-numbers').hidden = true;
  const preview = $('#figure-preview');
  if (!tab.preview || tab.previewRevision !== revision || tab.previewType !== type) {
    tab.preview?.remove();
    tab.preview = document.createElement('div');
    tab.preview.className = 'figure-tab-content';
    const url = `api/figure?file=${encodeURIComponent(name)}&v=${encodeURIComponent(revision)}`;
    tab.preview.innerHTML = type === 'pdf'
      ? `<iframe src="${url}" title="${escapeHtml(name)}"></iframe>`
      : `<img src="${url}" alt="${escapeHtml(name)}">`;
    preview.appendChild(tab.preview);
    tab.previewRevision = revision;
    tab.previewType = type;
  }
  openTabs.filter((item) => item.kind === 'figure' && item.preview).forEach((item) => {
    item.preview.hidden = item.key !== tab.key;
  });
  preview.hidden = false;
  preview.scrollTop = tab.scrollTop || 0;
  $('#source-lines').textContent = `${Math.max(1, Math.round(size / 1024))} KB`;
  $('#editor-mode').textContent = type === 'pdf' ? tr('PDF 预览') : tr('图片预览');
  setSaveState(tr('预览'));
}

function figureFolderAncestors(name) {
  const parts = String(name).split('/').filter(Boolean);
  return parts.slice(0, -1).map((_, index) => parts.slice(0, index + 1).join('/'));
}

function revealFigurePath(name) {
  const ancestors = figureFolderAncestors(name);
  ancestors.forEach((path) => expandedFigureFolders.add(path));
  if (!ancestors.length) return;
  const list = $('#figure-files');
  list.hidden = false;
  $('#figure-folder').classList.add('open');
  $$('.figure-folder-row').forEach((row) => {
    if (!expandedFigureFolders.has(row.dataset.figureFolder)) return;
    row.classList.add('open');
    if (row.nextElementSibling?.classList.contains('figure-folder-children')) {
      row.nextElementSibling.hidden = false;
    }
  });
}

function renderFigureTree(figures) {
  const root = {folders: new Map(), files: [], count: 0};
  figures.forEach((figure) => {
    const parts = String(figure.name).split('/').filter(Boolean);
    let node = root;
    node.count += 1;
    parts.slice(0, -1).forEach((part) => {
      if (!node.folders.has(part)) node.folders.set(part, {folders: new Map(), files: [], count: 0});
      node = node.folders.get(part);
      node.count += 1;
    });
    node.files.push({...figure, basename: parts.at(-1) || figure.name});
  });

  if (currentFigure) figureFolderAncestors(currentFigure).forEach((path) => expandedFigureFolders.add(path));

  function renderNode(node, parentPath = '', depth = 0) {
    const folders = [...node.folders.entries()].sort(([left], [right]) => left.localeCompare(right));
    const files = [...node.files].sort((left, right) => left.basename.localeCompare(right.basename));
    const folderHtml = folders.map(([name, child]) => {
      const path = parentPath ? `${parentPath}/${name}` : name;
      const open = expandedFigureFolders.has(path);
      return `<button class="figure-folder-row ${open ? 'open' : ''}" data-figure-folder="${escapeHtml(path)}" style="--figure-indent:${depth * 14}px">
        <span class="chevron">›</span><span class="folder-icon">▰</span>
        <span class="file-name" title="${escapeHtml(path)}">${escapeHtml(name)}</span><span class="count">${child.count}</span>
      </button><div class="figure-folder-children" ${open ? '' : 'hidden'}>${renderNode(child, path, depth + 1)}</div>`;
    }).join('');
    const fileHtml = files.map((figure) => `
      <button class="figure-row ${figure.name === currentFigure ? 'active' : ''}" data-figure="${escapeHtml(figure.name)}" data-type="${escapeHtml(figure.type)}" data-size="${figure.size}" data-revision="${escapeHtml(figure.revision)}" style="--figure-indent:${depth * 14}px">
        <span class="file-icon">${figure.type === 'pdf' ? 'P' : 'I'}</span>
        <span class="file-name" title="${escapeHtml(figure.name)}">${escapeHtml(figure.basename)}</span>
      </button>`).join('');
    return folderHtml + fileHtml;
  }

  $('#figure-files').innerHTML = renderNode(root);
  $$('.figure-folder-row').forEach((row) => row.addEventListener('click', () => {
    const path = row.dataset.figureFolder;
    const children = row.nextElementSibling;
    const open = !expandedFigureFolders.has(path);
    if (open) expandedFigureFolders.add(path);
    else expandedFigureFolders.delete(path);
    row.classList.toggle('open', open);
    if (children?.classList.contains('figure-folder-children')) children.hidden = !open;
  }));
  $$('.figure-row').forEach((button) => button.addEventListener('click', () => {
    workspace.classList.remove('source-hidden');
    openFigure(button.dataset.figure, button.dataset.type, Number(button.dataset.size), button.dataset.revision);
  }));
}

function revealSourcePath(name) {
  const parts = String(name).split('/').filter(Boolean);
  parts.slice(0, -1).forEach((_, index) => expandedSourceFolders.add(parts.slice(0, index + 1).join('/')));
  $$('.source-folder-row').forEach((row) => {
    const open = expandedSourceFolders.has(row.dataset.sourceFolder);
    row.classList.toggle('open', open);
    if (row.nextElementSibling?.classList.contains('source-folder-children')) row.nextElementSibling.hidden = !open;
  });
}

function renderSourceTree(files) {
  const root = {folders: new Map(), files: [], count: 0};
  files.forEach((file) => {
    const parts = String(file.name).split('/').filter(Boolean);
    let node = root;
    parts.slice(0, -1).forEach((part) => {
      if (!node.folders.has(part)) node.folders.set(part, {folders: new Map(), files: [], count: 0});
      node = node.folders.get(part);
      node.count += 1;
    });
    node.files.push({...file, basename: parts.at(-1) || file.name});
  });
  if (currentSource) revealSourcePath(currentSource);

  function renderNode(node, parentPath = '', depth = 0) {
    const folders = [...node.folders.entries()].sort(([left], [right]) => left.localeCompare(right));
    const folderHtml = folders.map(([name, child]) => {
      const path = parentPath ? `${parentPath}/${name}` : name;
      const open = expandedSourceFolders.has(path);
      return `<button class="source-folder-row ${open ? 'open' : ''}" data-source-folder="${escapeHtml(path)}" style="--file-indent:${depth * 14}px">
        <span class="chevron">›</span><span class="folder-icon">▰</span>
        <span class="file-name" title="${escapeHtml(path)}">${escapeHtml(name)}</span><span class="count">${child.count}</span>
      </button><div class="source-folder-children" ${open ? '' : 'hidden'}>${renderNode(child, path, depth + 1)}</div>`;
    }).join('');
    const fileHtml = node.files.map((file) => {
      const suffix = file.basename.split('.').at(-1)?.toLowerCase();
      const icon = suffix === 'bib' ? 'B' : suffix === 'md' ? 'M' : suffix === 'json' ? 'J' : suffix === 'tex' ? 'T' : '·';
      return `<button class="file-row ${file.name === currentSource ? 'active' : ''}" data-file="${escapeHtml(file.name)}" style="--file-indent:${depth * 14}px" title="${escapeHtml(file.name)}">
        <span class="file-icon">${icon}</span><span class="file-name">${escapeHtml(file.basename)}</span>
        <span class="file-size">${Math.max(1, Math.round(file.size / 1024))}K</span>
      </button>`;
    }).join('');
    return folderHtml + fileHtml;
  }

  $('#files').innerHTML = renderNode(root);
  $$('.source-folder-row').forEach((row) => row.addEventListener('click', () => {
    const path = row.dataset.sourceFolder;
    const open = !expandedSourceFolders.has(path);
    if (open) expandedSourceFolders.add(path);
    else expandedSourceFolders.delete(path);
    row.classList.toggle('open', open);
    row.nextElementSibling.hidden = !open;
  }));
}

function highlightedPreview(result) {
  const start = Math.max(0, Math.min(result.preview.length, result.column));
  const end = Math.max(start, Math.min(result.preview.length, result.end));
  return `${escapeHtml(result.preview.slice(0, start))}<mark>${escapeHtml(result.preview.slice(start, end))}</mark>${escapeHtml(result.preview.slice(end))}`;
}

function renderProjectSearchResults() {
  const container = $('#project-search-results');
  if (!projectSearchResults.length) {
    container.innerHTML = $('#project-search-input').value
      ? `<div class="search-empty">${tr('没有找到匹配内容')}</div>`
      : `<div class="search-empty">${tr('搜索 .tex、.bib 和 Markdown 源码')}<br>${tr('当前未保存内容也会参与搜索')}</div>`;
    return;
  }
  const grouped = new Map();
  projectSearchResults.forEach((result, index) => {
    if (!grouped.has(result.file)) grouped.set(result.file, []);
    grouped.get(result.file).push({...result, index});
  });
  container.innerHTML = [...grouped.entries()].map(([file, results]) => `
    <section class="search-file-group"><div class="search-file-heading"><span>${escapeHtml(file)}</span><span>${results.length}</span></div>
      ${results.map((result) => `<button class="search-result ${result.index === projectSearchIndex ? 'active' : ''}" data-search-index="${result.index}"><span class="search-result-line">${result.kind === 'figure' ? tr('图') : result.line}</span><span class="search-result-text">${highlightedPreview(result)}</span></button>`).join('')}
    </section>`).join('');
  container.querySelectorAll('.search-result').forEach((button) => button.addEventListener('click', () => openProjectSearchResult(Number(button.dataset.searchIndex))));
}

async function openProjectSearchResult(index) {
  const result = projectSearchResults[index];
  if (!result) return;
  projectSearchIndex = index;
  renderProjectSearchResults();
  workspace.classList.remove('source-hidden');
  if (result.kind === 'figure') {
    const figure = projectData.figures.find((item) => item.name === result.figure);
    if (figure) await openFigure(figure.name, figure.type, figure.size, figure.revision);
    return;
  }
  await loadSource(result.file, result.line, result.column, result.end - result.column);
}

function moveProjectSearchSelection(delta) {
  if (!projectSearchResults.length) return;
  projectSearchIndex = (projectSearchIndex + delta + projectSearchResults.length) % projectSearchResults.length;
  renderProjectSearchResults();
  $(`.search-result[data-search-index="${projectSearchIndex}"]`)?.scrollIntoView({block: 'nearest'});
}

async function runProjectSearch() {
  if (composingInputs.has($('#project-search-input'))) return;
  clearTimeout(projectSearchTimer);
  const query = $('#project-search-input').value.trim();
  const token = ++projectSearchToken;
  projectSearchIndex = -1;
  if (!query) {
    projectSearchResults = [];
    projectSearchSummary = null;
    $('#project-search-summary').textContent = tr('输入关键词搜索论文源码');
    $('#project-search-summary').classList.remove('error');
    renderProjectSearchResults();
    return;
  }
  $('#project-search-summary').textContent = tr('正在搜索…');
  $('#project-search-summary').classList.remove('error');
  const options = searchOptions('project-search');
  const payload = {
    query,
    case_sensitive: options.caseSensitive,
    whole_word: options.wholeWord,
    regex: options.regex,
  };
  if (sourceMode === 'source') {
    payload.current_file = currentSource;
    payload.current_content = $('#source-editor').value;
  }
  try {
    const response = await fetch('api/search', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (token !== projectSearchToken) return;
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    const figureResults = [];
    for (const figure of projectData.figures) {
      let matches = [];
      try {
        matches = textMatches(figure.name, query, options);
      } catch (_) {
        break;
      }
      if (matches.length) figureResults.push({kind: 'figure', file: 'figures', figure: figure.name, line: 0, column: matches[0].start, end: matches[0].end, preview: figure.name});
    }
    projectSearchResults = [...data.results, ...figureResults];
    projectSearchIndex = projectSearchResults.length ? 0 : -1;
    const fileCount = new Set(projectSearchResults.map((result) => result.kind === 'figure' ? `figures/${result.figure}` : result.file)).size;
    const total = data.total + figureResults.length;
    projectSearchSummary = {total, fileCount, truncated: data.truncated};
    showProjectSearchSummary();
    renderProjectSearchResults();
  } catch (error) {
    if (token !== projectSearchToken) return;
    projectSearchResults = [];
    $('#project-search-summary').textContent = error.message;
    $('#project-search-summary').classList.add('error');
    renderProjectSearchResults();
  }
}

function showProjectSearchSummary() {
  if (!projectSearchSummary) return;
  const {total, fileCount, truncated} = projectSearchSummary;
  $('#project-search-summary').textContent = localized(`${total} 个结果 · ${fileCount} 个文件${truncated ? ' · 仅显示前 500 个文本结果' : ''}`, `${total} results · ${fileCount} files${truncated ? ' · Showing the first 500 text matches' : ''}`);
}

function scheduleProjectSearch() {
  if (composingInputs.has($('#project-search-input'))) return;
  clearTimeout(projectSearchTimer);
  projectSearchTimer = setTimeout(runProjectSearch, 150);
}

function openProjectSearch() {
  switchRailTab('search');
  const input = $('#project-search-input');
  input.focus();
  input.select();
}

async function loadProject() {
  try {
    const response = await fetch('api/project');
    const data = await response.json();
    projectData = data;
    mainSource = data.settings?.main_file || 'main.tex';
    $('#terminal-toggle').hidden = !data.terminal_enabled;
    refreshCitationIndex(data.files);
    $('#document-title').textContent = data.title;
    document.title = `${data.title} · LeafOver`;
    $('#outline').innerHTML = data.outline.map((item) => `
      <button class="outline-item level-${item.level}" data-file="${escapeHtml(item.file || mainSource)}" data-line="${item.line}">
        <span class="outline-number">${item.number}</span><span class="outline-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</span>
      </button>`).join('');
    renderSourceTree(data.files);
    $('#figure-count').textContent = data.figure_count;
    renderFigureTree(data.figures);
    $$('.outline-item').forEach((button) => button.addEventListener('click', () => {
      workspace.classList.remove('source-hidden');
      loadSource(button.dataset.file || mainSource, Number(button.dataset.line));
    }));
    $$('.file-row').forEach((button) => button.addEventListener('click', () => {
      workspace.classList.remove('source-hidden');
      loadSource(button.dataset.file);
    }));
    if (sourceMode === 'figure' && currentFigure) {
      const openFigureMetadata = data.figures.find((figure) => figure.name === currentFigure);
      if (openFigureMetadata && openFigureMetadata.revision !== currentFigureRevision) {
        await openFigure(
          openFigureMetadata.name,
          openFigureMetadata.type,
          openFigureMetadata.size,
          openFigureMetadata.revision,
        );
      }
    } else if (sourceMode === 'source' && currentSource) {
      const openSourceMetadata = data.files.find((file) => file.name === currentSource);
      if (sourceRevision !== null && openSourceMetadata && openSourceMetadata.revision !== sourceRevision) {
        if (sourceDirty || sourceSavePromise) {
          setSaveState(tr('外部修改冲突'), 'conflict');
          showToast(localized(`${currentSource} 已在外部更新，当前未保存内容未被覆盖`, `${currentSource} changed externally. Unsaved changes were preserved.`));
        } else {
          await loadSource(currentSource, null, null, null, true);
          showToast(localized(`${currentSource} 已更新`, `${currentSource} updated`));
        }
      }
    }
    if ($('#project-search-input').value) scheduleProjectSearch();
    if (!$('#quick-open').hidden) renderQuickOpen();
  } catch (error) {
    $('#outline').innerHTML = `<div class="rail-label">${localized('项目元数据载入失败', 'Failed to load project metadata')}: ${escapeHtml(error.message)}</div>`;
  }
}

function layoutPages() {
  for (const page of pages) {
    if (!page.baseWidth) continue;
    page.wrap.style.width = `${Math.round(page.baseWidth * scale)}px`;
    page.wrap.style.height = `${Math.round(page.baseHeight * scale)}px`;
  }
}

async function inverseSearch(pageNumber, event, wrap) {
  if (!event.target.closest('span')) return;
  const rect = wrap.getBoundingClientRect();
  const x = (event.clientX - rect.left) / scale;
  const y = (event.clientY - rect.top) / scale;
  try {
    const response = await fetch(`api/synctex?page=${pageNumber}&x=${x.toFixed(3)}&y=${y.toFixed(3)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    workspace.classList.remove('source-hidden');
    await loadSource(data.file, data.line);
    showToast(localized(`已定位到 ${data.file}:${data.line}`, `Located ${data.file}:${data.line}`));
  } catch (error) {
    showToast(localized(`无法定位源码：${error.message}`, `Could not locate source: ${error.message}`));
  }
}

async function ensurePdfText(index) {
  const entry = pages[index];
  if (!entry || entry.textContent) return entry?.textContent || {items: [], styles: {}};
  const page = await pdf.getPage(index + 1);
  entry.textContent = await page.getTextContent();
  return entry.textContent;
}

function applyPdfSearchHighlights(pageIndex) {
  const entry = pages[pageIndex];
  if (!entry?.textDivs) return;
  entry.textDivs.forEach((element) => element.classList.remove('pdf-search-match', 'current'));
  pdfFindMatches.forEach((match, index) => {
    if (match.pageIndex !== pageIndex) return;
    match.itemIndexes.forEach((itemIndex) => {
      entry.textDivs[itemIndex]?.classList.add('pdf-search-match');
      if (index === pdfFindIndex) entry.textDivs[itemIndex]?.classList.add('current');
    });
  });
}

async function selectPdfMatch(index) {
  if (!pdfFindMatches.length) return;
  pdfFindIndex = (index + pdfFindMatches.length) % pdfFindMatches.length;
  const match = pdfFindMatches[pdfFindIndex];
  $('#pdf-find-count').textContent = `${pdfFindIndex + 1} / ${pdfFindMatches.length}`;
  await renderPage(match.pageIndex);
  pages.forEach((_, pageIndex) => applyPdfSearchHighlights(pageIndex));
  goToPage(match.pageIndex + 1);
}

async function runPdfFind() {
  if (composingInputs.has($('#pdf-find-input'))) return;
  clearTimeout(pdfFindTimer);
  const query = $('#pdf-find-input').value;
  const token = ++pdfFindToken;
  pdfFindMatches = [];
  pdfFindIndex = -1;
  pages.forEach((_, pageIndex) => applyPdfSearchHighlights(pageIndex));
  if (!query || !pdf) {
    $('#pdf-find-count').textContent = '0 / 0';
    return;
  }
  $('#pdf-find-count').textContent = tr('搜索中…');
  const needle = query.toLocaleLowerCase();
  const contentByPage = await Promise.all(pages.map((_, pageIndex) => ensurePdfText(pageIndex)));
  if (token !== pdfFindToken) return;
  contentByPage.forEach((content, pageIndex) => {
    const items = content.items;
    let pageText = '';
    const ranges = [];
    items.forEach((item, itemIndex) => {
      if (pageText) pageText += ' ';
      const start = pageText.length;
      pageText += item.str;
      ranges.push({start, end: pageText.length, itemIndex});
    });
    const haystack = pageText.toLocaleLowerCase();
    let offset = 0;
    while ((offset = haystack.indexOf(needle, offset)) !== -1 && pdfFindMatches.length < 2000) {
      const end = offset + needle.length;
      const itemIndexes = ranges.filter((range) => range.end > offset && range.start < end).map((range) => range.itemIndex);
      if (itemIndexes.length) pdfFindMatches.push({pageIndex, itemIndexes});
      offset += Math.max(1, needle.length);
    }
  });
  pdfFindIndex = pdfFindMatches.length ? 0 : -1;
  $('#pdf-find-count').textContent = pdfFindMatches.length ? `1 / ${pdfFindMatches.length}` : '0 / 0';
  if (pdfFindMatches.length) await selectPdfMatch(0);
}

function openPdfFind() {
  lastSearchContext = 'pdf';
  $('#pdf-find').hidden = false;
  const input = $('#pdf-find-input');
  input.focus();
  input.select();
}

function closePdfFind() {
  $('#pdf-find').hidden = true;
  pdfFindMatches = [];
  pdfFindIndex = -1;
  pages.forEach((_, pageIndex) => applyPdfSearchHighlights(pageIndex));
}

async function followPdfDestination(destination) {
  const document = pdf;
  try {
    const dest = typeof destination === 'string' ? await document.getDestination(destination) : destination;
    if (!Array.isArray(dest)) throw new Error('Missing PDF destination');
    const index = typeof dest[0] === 'number' ? dest[0] : await document.getPageIndex(dest[0]);
    const page = await document.getPage(index + 1);
    if (pdf !== document) return;
    const entry = pages[index];
    if (!entry) return;
    const viewport = page.getViewport({scale});
    let top = 0;
    if (dest[1]?.name === 'XYZ' && Number.isFinite(dest[3])) {
      top = viewport.convertToViewportPoint(dest[2] ?? page.view[0], dest[3])[1];
    } else if (['FitH', 'FitBH'].includes(dest[1]?.name) && Number.isFinite(dest[2])) {
      top = viewport.convertToViewportPoint(page.view[0], dest[2])[1];
    }
    scroller.scrollTo({top: Math.max(0, entry.wrap.offsetTop + top - 24), behavior: 'smooth'});
    renderPage(index);
  } catch (_) {
    showToast(tr('无法定位此 PDF 链接，请尝试重新载入 PDF'));
  }
}

async function renderPdfLinks(page, entry, viewport) {
  const annotations = await page.getAnnotations({intent: 'display'});
  if (entry.renderedScale !== viewport.scale || !pages.includes(entry)) return;
  entry.linkLayer.replaceChildren();
  for (const annotation of annotations) {
    if (annotation.subtype !== 'Link' || (!annotation.dest && !annotation.url)) continue;
    const link = document.createElement('a');
    link.className = 'pdf-link';
    if (annotation.dest) {
      link.href = '#pdf-destination';
      link.title = tr('跳转到引用位置');
      link.addEventListener('click', (event) => {
        event.preventDefault();
        followPdfDestination(annotation.dest);
      });
    } else {
      if (!/^(https?:|mailto:)/i.test(annotation.url)) continue;
      link.href = annotation.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.title = annotation.url;
    }
    link.setAttribute('aria-label', link.title);
    const [x1, y1, x2, y2] = viewport.convertToViewportRectangle(annotation.rect);
    // Percentages keep the hit areas aligned while a zoom render is pending.
    Object.assign(link.style, {
      left: `${100 * Math.min(x1, x2) / viewport.width}%`,
      top: `${100 * Math.min(y1, y2) / viewport.height}%`,
      width: `${100 * Math.abs(x2 - x1) / viewport.width}%`,
      height: `${100 * Math.abs(y2 - y1) / viewport.height}%`,
    });
    entry.linkLayer.appendChild(link);
  }
}

async function renderPage(index) {
  const entry = pages[index];
  if (!entry || !entry.baseWidth) return;
  if (entry.renderedScale === scale) {
    applyPdfSearchHighlights(index);
    return;
  }
  const intendedScale = scale;
  const version = (entry.renderVersion || 0) + 1;
  entry.renderVersion = version;
  entry.renderedScale = intendedScale;
  try {
    if (entry.canvasTask) {
      entry.canvasTask.cancel();
      await entry.canvasTask.promise.catch(() => {});
    }
    if (entry.renderVersion !== version || !pages.includes(entry)) return;
    const page = await pdf.getPage(index + 1);
    if (entry.renderVersion !== version || !pages.includes(entry)) return;
    const viewport = page.getViewport({scale: intendedScale});
    const pixelRatio = window.devicePixelRatio || 1;
    const context = entry.canvas.getContext('2d');
    entry.canvas.width = Math.round(viewport.width * pixelRatio);
    entry.canvas.height = Math.round(viewport.height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    entry.textLayer.replaceChildren();
    entry.textLayer.style.setProperty('--scale-factor', intendedScale);
    entry.canvasTask = page.render({canvasContext: context, viewport});
    const canvasTask = entry.canvasTask.promise;
    // Zooming can cancel this render while text content is still loading.
    canvasTask.catch(() => {});
    const textContent = await ensurePdfText(index);
    if (entry.renderVersion !== version || !pages.includes(entry)) return;
    const textDivs = [];
    const textTask = pdfjsLib.renderTextLayer({
      textContentSource: textContent,
      container: entry.textLayer,
      viewport,
      textDivs,
    }).promise;
    await Promise.all([canvasTask, textTask, renderPdfLinks(page, entry, viewport)]);
    if (entry.renderVersion !== version || !pages.includes(entry)) return;
    entry.textDivs = textDivs;
    applyPdfSearchHighlights(index);
  } catch (_) {
    if (entry.renderVersion === version) entry.renderedScale = null;
  }
}

function renderVisible() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    const top = scroller.scrollTop;
    const height = scroller.clientHeight;
    pages.forEach((entry, index) => {
      if (entry.wrap.offsetTop + entry.wrap.offsetHeight >= top - height && entry.wrap.offsetTop <= top + 2 * height) renderPage(index);
    });
  }, 45);
}

function currentPage() {
  const middle = scroller.scrollTop + scroller.clientHeight * .45;
  for (let i = 0; i < pages.length; i += 1) {
    if (middle < pages[i].wrap.offsetTop + pages[i].wrap.offsetHeight) return i + 1;
  }
  return pageCount || 1;
}

function updatePageControl() {
  if (document.activeElement !== $('#page-input')) $('#page-input').value = currentPage();
}

function goToPage(pageNumber) {
  const target = Math.max(1, Math.min(pageCount, Number(pageNumber) || 1));
  const entry = pages[target - 1];
  if (entry) scroller.scrollTo({top: Math.max(0, entry.wrap.offsetTop - 16), behavior: 'smooth'});
}

async function applyFit(mode, keepPage = true) {
  if (!pdf || !pages.length || !pages[0].baseWidth) return;
  const visiblePage = currentPage();
  fitMode = mode;
  const first = pages[0];
  if (mode === 'page') {
    scale = Math.min((scroller.clientWidth - 70) / first.baseWidth, (scroller.clientHeight - 52) / first.baseHeight);
    $('#zoom-value').textContent = tr('整页');
  } else {
    scale = (scroller.clientWidth - 70) / first.baseWidth;
    $('#zoom-value').textContent = tr('适合宽度');
  }
  scale = Math.max(.3, Math.min(4, scale));
  pages.forEach((entry) => { entry.renderedScale = null; });
  layoutPages();
  if (keepPage) requestAnimationFrame(() => goToPage(visiblePage));
  renderVisible();
}

function setScale(nextScale) {
  if (!pdf || scale === null) return;
  const visiblePage = currentPage();
  scale = Math.max(.3, Math.min(4, nextScale));
  fitMode = 'custom';
  $('#zoom-value').textContent = `${Math.round(scale * 100)}%`;
  pages.forEach((entry) => { entry.renderedScale = null; });
  layoutPages();
  requestAnimationFrame(() => goToPage(visiblePage));
  renderVisible();
}

async function loadPdf(keepPosition = false) {
  const visiblePage = keepPosition ? currentPage() : 1;
  try {
    pdf = await pdfjsLib.getDocument({url: `pdf?ts=${Date.now()}`}).promise;
    pageCount = pdf.numPages;
    $('#page-total').textContent = pageCount;
    strip.innerHTML = '';
    pages = [];
    for (let index = 0; index < pageCount; index += 1) {
      const wrap = document.createElement('div');
      wrap.className = 'pdf-page';
      const canvas = document.createElement('canvas');
      const textLayer = document.createElement('div');
      textLayer.className = 'text-layer';
      textLayer.addEventListener('dblclick', (event) => inverseSearch(index + 1, event, wrap));
      const linkLayer = document.createElement('div');
      linkLayer.className = 'pdf-link-layer';
      const badge = document.createElement('span');
      badge.className = 'page-badge';
      badge.textContent = index + 1;
      wrap.append(canvas, textLayer, linkLayer, badge);
      strip.appendChild(wrap);
      pages.push({wrap, canvas, textLayer, linkLayer, baseWidth: null, baseHeight: null, renderedScale: null, textContent: null, textDivs: []});
    }
    await Promise.all(pages.map(async (entry, index) => {
      const page = await pdf.getPage(index + 1);
      const viewport = page.getViewport({scale: 1});
      entry.baseWidth = viewport.width;
      entry.baseHeight = viewport.height;
    }));
    await applyFit(fitMode === 'page' ? 'page' : 'width', false);
    requestAnimationFrame(() => goToPage(visiblePage));
    if (!$('#pdf-find').hidden && $('#pdf-find-input').value) runPdfFind();
  } catch (error) {
    pdf = null;
    pageCount = 0;
    $('#page-total').textContent = '—';
    strip.innerHTML = `<div class="empty-state"><strong>${tr('PDF 暂时不可用')}</strong><span>${escapeHtml(error.message)} · ${tr('请重新编译')}</span></div>`;
  }
}

function setStatus(data) {
  lastStatusData = data;
  const previousState = lastState;
  const dot = $('#status-dot');
  const label = $('#compile-label');
  const button = $('#compile-button');
  const logDot = $('.log-dot');
  dot.className = `status-dot ${data.state || ''}`;
  button.disabled = data.state === 'compiling';
  const labels = {idle: tr('重新编译'), compiling: data.elapsed ? localized(`编译中 ${data.elapsed}s`, `Compiling ${data.elapsed}s`) : tr('编译中…'), ok: tr('重新编译'), error: tr('编译失败')};
  label.textContent = labels[data.state] || tr('重新编译');
  logDot.className = `log-dot ${data.state === 'error' ? 'error' : data.state === 'ok' ? 'ok' : ''}`;
  if (data.log) {
    latestLog = data.log;
    $('#log-content').textContent = data.log;
  }
  const summary = data.state === 'compiling' ? localized(`正在运行 latexmk${data.elapsed ? ` · ${data.elapsed}s` : ''} · 继续显示上一版 PDF`, `Running latexmk${data.elapsed ? ` · ${data.elapsed}s` : ''} · showing the previous PDF`) : data.state === 'error' ? tr('编译失败') : data.duration ? localized(`成功 · ${data.duration}s`, `Success · ${data.duration}s`) : tr('等待编译');
  $('#log-summary').textContent = summary;
  if (data.state === 'error' && previousState && previousState !== 'error') {
    showToast(tr('编译失败，点击“日志”查看详情'));
  }
  lastState = data.state;
}

async function compilePaper() {
  if (compilePending) return;
  compilePending = true;
  try {
    if (!(await saveSource())) {
      showToast(tr('源码尚未保存，已取消编译'));
      return;
    }
    setStatus({state: 'compiling'});
    const response = await fetch('compile', {method: 'POST'});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  } catch (error) {
    setStatus({state: 'error', log: String(error)});
  } finally {
    compilePending = false;
  }
}

function setTerminalStatus(state, detail = '') {
  const dot = $('#terminal-status-dot');
  dot.className = `terminal-status-dot ${state}`;
  dot.title = detail || (state === 'live' ? tr('终端已连接') : state === 'dead' ? tr('终端已断开') : tr('正在连接'));
}

function setTerminalCwd(cwd) {
  const label = $('#terminal-cwd');
  const parts = String(cwd || '').split('/').filter(Boolean);
  label.textContent = parts.length ? `${parts[parts.length - 1]}/` : 'paper/';
  label.title = cwd || tr('论文目录');
}

function terminalDimensions() {
  const host = $('#terminal-host');
  const hostStyle = getComputedStyle(host);
  const screen = host.querySelector('.xterm-screen');
  const screenRect = screen?.getBoundingClientRect();
  const renderedCharWidth = terminal?.cols && screenRect?.width ? screenRect.width / terminal.cols : 0;
  const renderedLineHeight = terminal?.rows && screenRect?.height ? screenRect.height / terminal.rows : 0;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = `${terminal?.options.fontSize || 12}px ${terminal?.options.fontFamily || 'monospace'}`;
  const charWidth = renderedCharWidth || context.measureText('W').width || 7.25;
  const lineHeight = renderedLineHeight || 15;
  const horizontalPadding = parseFloat(hostStyle.paddingLeft) + parseFloat(hostStyle.paddingRight);
  const verticalPadding = parseFloat(hostStyle.paddingTop) + parseFloat(hostStyle.paddingBottom);
  // Keep the final cell clear of overlay scrollbars and glyph overhang.
  const usableWidth = host.clientWidth - horizontalPadding - 14;
  const usableHeight = host.clientHeight - verticalPadding - 4;
  return {
    columns: Math.max(20, Math.floor(usableWidth / charWidth)),
    rows: Math.max(4, Math.floor(usableHeight / lineHeight)),
  };
}

async function terminalRequest(action, payload) {
  const response = await fetch(`api/terminal/${action}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-LeafOver-Terminal-Token': terminalAccessKey},
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function ensureTerminalRenderer() {
  if (terminal) return true;
  if (typeof Terminal === 'undefined') {
    setTerminalStatus('dead', tr('xterm.js 载入失败'));
    showToast(tr('终端组件载入失败'));
    return false;
  }
  terminal = new Terminal({
    cursorBlink: true,
    cursorStyle: 'bar',
    fontFamily: 'SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12,
    lineHeight: 1.25,
    scrollback: 5000,
    theme: terminalTheme(),
  });
  terminal.open($('#terminal-host'));
  terminal.attachCustomKeyEventHandler(handleTerminalShortcut);
  terminal.onData(queueTerminalInput);
  return true;
}

function terminalTheme() {
  const light = document.documentElement.dataset.theme === 'light';
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#138a55';
  return light ? {
    background: '#f8fbf9', foreground: '#24362a', cursor: accent, cursorAccent: '#f8fbf9',
    selectionBackground: `${accent}55`, selectionInactiveBackground: `${accent}33`,
    black: '#24332a', red: '#ae3d48', green: '#1c7958', yellow: '#946012',
    blue: '#176da8', magenta: '#874b9e', cyan: '#007d8d', white: '#e9f3f8',
    brightBlack: '#697b70', brightRed: '#c4525b', brightGreen: '#26936b',
    brightYellow: '#a9781d', brightBlue: '#2589c6', brightMagenta: '#a05db8',
    brightCyan: '#1696a6', brightWhite: '#ffffff',
  } : {
    background: '#111713', foreground: '#dce4de', cursor: accent, cursorAccent: '#111713',
    selectionBackground: `${accent}66`, selectionInactiveBackground: `${accent}33`,
    black: '#1c211d', red: '#e06c75', green: '#72c991', yellow: '#d7ba7d',
    blue: '#73a7d8', magenta: '#c792d4', cyan: '#69c3b3', white: '#dce4de',
    brightBlack: '#68736c', brightRed: '#f28b92', brightGreen: '#8bdda7',
    brightYellow: '#ead08f', brightBlue: '#8abcec', brightMagenta: '#d9a7e3',
    brightCyan: '#83d8ca', brightWhite: '#f3f6f4',
  };
}

function handleTerminalShortcut(event) {
  if (event.ctrlKey || event.shiftKey) return true;
  const commandKeys = {ArrowLeft: '\x01', ArrowRight: '\x05', Backspace: '\x15'};
  const optionKeys = {ArrowLeft: '\x1bb', ArrowRight: '\x1bf', Backspace: '\x1b\x7f'};
  const data = event.metaKey && !event.altKey ? commandKeys[event.key]
    : event.altKey && !event.metaKey ? optionKeys[event.key] : null;
  if (!data) return true;
  event.preventDefault();
  if (event.type === 'keydown') queueTerminalInput(data);
  return false;
}

function decodeTerminalData(encoded) {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function writeTerminal(data) {
  if (!terminal || data == null || data.length === 0) return;
  const chunkSize = data instanceof Uint8Array ? 64 * 1024 : data.length;
  for (let offset = 0; offset < data.length; offset += chunkSize) {
    const chunk = data.slice(offset, offset + chunkSize);
    await new Promise((resolve) => terminal.write(chunk, resolve));
    if (offset + chunkSize < data.length) await new Promise(requestAnimationFrame);
  }
}

function persistTerminalSessions() {
  sessionStorage.setItem('paper-preview-terminal-sessions', JSON.stringify(terminalSessions));
  if (activeTerminalId) sessionStorage.setItem('paper-preview-active-terminal', activeTerminalId);
  else sessionStorage.removeItem('paper-preview-active-terminal');
}

function activeTerminalSession() {
  return terminalSessions.find((item) => item.id === activeTerminalId) || null;
}

function renderTerminalTabs() {
  $('#terminal-tabs').innerHTML = terminalSessions.map((item) => {
    const title = localized(`终端 ${String(item.title).match(/\d+/)?.[0] || '1'}`, `Terminal ${String(item.title).match(/\d+/)?.[0] || '1'}`);
    return `
    <div class="terminal-tab ${item.id === activeTerminalId ? 'active' : ''}" role="tab" aria-selected="${item.id === activeTerminalId}">
      <button class="terminal-tab-switch" data-terminal="${escapeHtml(item.id)}" title="${title}">${title}</button>
      <button class="terminal-tab-close" data-close-terminal="${escapeHtml(item.id)}" title="${tr('关闭')} ${title}">×</button>
    </div>`;
  }).join('');
  $$('.terminal-tab-switch').forEach((button) => button.addEventListener('click', () => selectTerminalSession(button.dataset.terminal)));
  $$('.terminal-tab-close').forEach((button) => button.addEventListener('click', () => stopTerminal(button.dataset.closeTerminal)));
}

function selectTerminalSession(sessionId) {
  const session = terminalSessions.find((item) => item.id === sessionId);
  if (!session) return;
  clearTimeout(terminalPollTimer);
  terminalPollController?.abort();
  activeTerminalId = session.id;
  terminalOffset = 0;
  terminalPollFailures = 0;
  if (terminal) terminal.reset();
  setTerminalCwd(session.cwd);
  setTerminalStatus('');
  persistTerminalSessions();
  renderTerminalTabs();
  resizeTerminal();
  pollTerminal();
  terminal?.focus();
}

async function createTerminalSession() {
  const data = await terminalRequest('start', terminalDimensions());
  terminalCounter += 1;
  const session = {id: data.session, title: `Terminal ${terminalCounter}`, cwd: data.cwd};
  terminalSessions.push(session);
  selectTerminalSession(session.id);
  setTerminalStatus('live');
  return session;
}

async function pollTerminal() {
  clearTimeout(terminalPollTimer);
  const sessionId = activeTerminalId;
  if (!sessionId || !$('#terminal-drawer').classList.contains('open')) return;
  const controller = new AbortController();
  terminalPollController = controller;
  try {
    const response = await fetch(`api/terminal/output?session=${encodeURIComponent(sessionId)}&offset=${terminalOffset}&wait=20`, {
      signal: controller.signal,
      headers: {'X-LeafOver-Terminal-Token': terminalAccessKey},
    });
    if (sessionId !== activeTerminalId) return;
    if (response.status === 404) {
      await stopTerminal(sessionId, false);
      if (!terminalSessions.length) await createTerminalSession();
      return;
    }
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error || `HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    terminalPollFailures = 0;
    if (data.truncated) await writeTerminal(`\r\n\x1b[33m[${tr('较早的终端输出已被截断')}]\x1b[0m\r\n`);
    if (data.data) await writeTerminal(decodeTerminalData(data.data));
    if (sessionId !== activeTerminalId) return;
    terminalOffset = data.offset;
    const session = activeTerminalSession();
    setTerminalCwd(session?.cwd);
    setTerminalStatus(data.alive ? 'live' : 'dead', data.alive ? tr('终端已连接') : tr('终端进程已退出'));
    terminalPollTimer = setTimeout(pollTerminal, data.alive ? 0 : 800);
  } catch (error) {
    if (error.name === 'AbortError') return;
    if (sessionId !== activeTerminalId) return;
    if (error.status === 401) {
      showTerminalUnlock(error.message);
      return;
    }
    terminalPollFailures += 1;
    setTerminalStatus(terminalPollFailures >= 3 ? 'dead' : '', localized(`连接波动，正在重试：${error.message}`, `Connection interrupted; retrying: ${error.message}`));
    if (terminalPollFailures === 3) showToast(tr('终端连接波动，正在自动重试'));
    terminalPollTimer = setTimeout(pollTerminal, terminalPollFailures >= 3 ? 1200 : 350);
  }
}

async function flushTerminalInput() {
  clearTimeout(terminalInputTimer);
  if (terminalInputBusy || !terminalInputQueue.length) return;
  const pending = terminalInputQueue.shift();
  terminalInputBusy = true;
  try {
    await terminalRequest('input', pending);
  } catch (error) {
    if (pending.session === activeTerminalId) void writeTerminal(`\r\n\x1b[31m[${localized(`输入失败：${error.message}`, `Input failed: ${error.message}`)}]\x1b[0m\r\n`);
  } finally {
    terminalInputBusy = false;
    if (terminalInputQueue.length) terminalInputTimer = setTimeout(flushTerminalInput, 0);
  }
}

function queueTerminalInput(data) {
  if (!activeTerminalId) return;
  const last = terminalInputQueue[terminalInputQueue.length - 1];
  if (last?.session === activeTerminalId) last.data += data;
  else terminalInputQueue.push({session: activeTerminalId, data});
  if (!terminalInputBusy) {
    clearTimeout(terminalInputTimer);
    terminalInputTimer = setTimeout(flushTerminalInput, 0);
  }
}

function resizeTerminal() {
  clearTimeout(terminalResizeTimer);
  terminalResizeTimer = setTimeout(async () => {
    if (!terminal || !$('#terminal-drawer').classList.contains('open')) return;
    const dimensions = terminalDimensions();
    terminal.resize(dimensions.columns, dimensions.rows);
    const sessionId = activeTerminalId;
    if (!sessionId) return;
    try {
      await terminalRequest('resize', {session: sessionId, ...dimensions});
    } catch (_) {
      // The output poll will recover an expired session.
    }
  }, 40);
}

async function openTerminal() {
  closeLogs();
  workspace.classList.remove('source-hidden');
  workspace.classList.add('terminal-open');
  $('#terminal-drawer').classList.add('open');
  $('#terminal-drawer').setAttribute('aria-hidden', 'false');
  $('#terminal-toggle').classList.add('active');
  if (projectData.terminal_auth_required && !terminalAccessKey) {
    showTerminalUnlock();
    return;
  }
  $('#terminal-unlock').hidden = true;
  if (!ensureTerminalRenderer()) return;
  requestAnimationFrame(async () => {
    renderTerminalTabs();
    resizeTerminal();
    if (!activeTerminalSession()) {
      try {
        await createTerminalSession();
      } catch (error) {
        if (error.status === 401) {
          showTerminalUnlock(error.message);
          return;
        }
        setTerminalStatus('dead', error.message);
        showToast(localized(`终端启动失败：${error.message}`, `Terminal failed to start: ${error.message}`));
        void writeTerminal(`\x1b[31m${localized(`终端启动失败：${error.message}`, `Terminal failed to start: ${error.message}`)}\x1b[0m\r\n`);
        return;
      }
    } else {
      selectTerminalSession(activeTerminalId);
    }
    terminal.focus();
  });
}

function showTerminalUnlock(message = '') {
  terminalAccessKey = '';
  sessionStorage.removeItem('leafover-terminal-access-key');
  clearTimeout(terminalPollTimer);
  terminalPollController?.abort();
  $('#terminal-unlock-error').textContent = message;
  $('#terminal-unlock').hidden = false;
  $('#terminal-access-key').focus();
}

function closeTerminalDrawer() {
  workspace.classList.remove('terminal-open');
  $('#terminal-drawer').classList.remove('open');
  $('#terminal-drawer').setAttribute('aria-hidden', 'true');
  $('#terminal-toggle').classList.remove('active');
  clearTimeout(terminalPollTimer);
  terminalPollController?.abort();
}

async function stopTerminal(sessionId = activeTerminalId, notifyServer = true) {
  clearTimeout(terminalPollTimer);
  terminalPollController?.abort();
  if (sessionId && notifyServer) {
    try {
      await terminalRequest('stop', {session: sessionId});
    } catch (_) {
      // The process may already have exited.
    }
  }
  terminalSessions = terminalSessions.filter((item) => item.id !== sessionId);
  terminalInputQueue = terminalInputQueue.filter((item) => item.session !== sessionId);
  if (activeTerminalId === sessionId) {
    activeTerminalId = terminalSessions[terminalSessions.length - 1]?.id || null;
    terminalOffset = 0;
    if (terminal) terminal.reset();
  }
  persistTerminalSessions();
  renderTerminalTabs();
  if (activeTerminalId && $('#terminal-drawer').classList.contains('open')) selectTerminalSession(activeTerminalId);
  else {
    setTerminalCwd('');
    setTerminalStatus('dead', tr('暂无终端会话'));
  }
}

async function newTerminal() {
  if (!$('#terminal-unlock').hidden) return;
  try {
    await createTerminalSession();
    terminal.focus();
  } catch (error) {
    if (error.status === 401) {
      showTerminalUnlock(error.message);
      return;
    }
    setTerminalStatus('dead', error.message);
    showToast(localized(`终端启动失败：${error.message}`, `Terminal failed to start: ${error.message}`));
  }
}

async function poll() {
  try {
    const response = await fetch('poll');
    const data = await response.json();
    $('#sync-indicator').classList.toggle('ready', Boolean(data.synctex));
    $('#sync-indicator').title = data.synctex ? tr('双击 PDF 正文可定位到对应源码') : tr('重新编译后启用 PDF 到源码定位');
    if (data.state === 'compiling' || data.state !== lastState || data.log !== latestLog) setStatus(data);
    if (lastProject === undefined) lastProject = data.project;
    else if (data.project && data.project !== lastProject) {
      lastProject = data.project;
      await loadProject();
      showToast(tr('文件列表已更新'));
    }
    if (lastPdf === undefined) lastPdf = data.pdf;
    else if (data.pdf && data.pdf !== lastPdf) {
      lastPdf = data.pdf;
      await loadPdf(true);
      showToast(tr('PDF 已更新'));
    }
  } catch (_) {
    $('#compile-label').textContent = tr('连接中断');
    $('#status-dot').className = 'status-dot error';
  }
}

function quickOpenCandidates(query) {
  if (query.startsWith('@')) {
    const term = query.slice(1).trim().toLocaleLowerCase();
    return projectData.outline.filter((item) => !term || item.title.toLocaleLowerCase().includes(term)).map((item) => ({
      kind: 'outline', name: `${item.number ? `${item.number} ` : ''}${item.title}`, detail: `${item.file || mainSource}:${item.line}`, file: item.file || mainSource, line: item.line,
    }));
  }
  if (query.startsWith(':')) {
    const line = Number(query.slice(1));
    return Number.isInteger(line) && line > 0 ? [{kind: 'line', name: localized(`跳转到第 ${line} 行`, `Go to line ${line}`), detail: sourceMode === 'source' ? currentSource : mainSource, line}] : [];
  }
  const term = query.trim().toLocaleLowerCase();
  const candidates = [
    ...projectData.files.map((file) => ({kind: 'source', name: file.name, detail: `${Math.max(1, Math.round(file.size / 1024))} KB`, file})),
    ...projectData.figures.map((figure) => ({kind: 'figure', name: `figures/${figure.name}`, detail: figure.type.toUpperCase(), figure})),
  ].filter((item) => !term || item.name.toLocaleLowerCase().includes(term));
  return candidates.sort((a, b) => {
    const aName = a.name.toLocaleLowerCase();
    const bName = b.name.toLocaleLowerCase();
    return Number(bName.startsWith(term)) - Number(aName.startsWith(term)) || aName.localeCompare(bName);
  });
}

function renderQuickOpen() {
  quickOpenItems = quickOpenCandidates($('#quick-open-input').value).slice(0, 40);
  quickOpenIndex = Math.max(0, Math.min(quickOpenIndex, quickOpenItems.length - 1));
  const kindLabel = {source: 'T', figure: 'I', outline: '§', line: ':'};
  $('#quick-open-results').innerHTML = quickOpenItems.length ? quickOpenItems.map((item, index) => `
    <button class="quick-open-item ${index === quickOpenIndex ? 'active' : ''}" data-quick-index="${index}"><span class="quick-open-kind">${kindLabel[item.kind]}</span><span class="quick-open-name">${escapeHtml(item.name)}</span><span class="quick-open-detail">${escapeHtml(item.detail)}</span></button>`).join('') : `<div class="search-empty">${tr('没有匹配的文件或章节')}</div>`;
  $$('.quick-open-item').forEach((button) => button.addEventListener('click', () => openQuickItem(Number(button.dataset.quickIndex))));
}

async function openQuickItem(index = quickOpenIndex) {
  const item = quickOpenItems[index];
  if (!item) return;
  closeQuickOpen();
  workspace.classList.remove('source-hidden');
  if (item.kind === 'source') await loadSource(item.file.name);
  else if (item.kind === 'figure') await openFigure(item.figure.name, item.figure.type, item.figure.size, item.figure.revision);
  else if (item.kind === 'outline') await loadSource(item.file || mainSource, item.line);
  else if (item.kind === 'line') await loadSource(sourceMode === 'source' ? currentSource : mainSource, item.line);
}

function openQuickOpen() {
  $('#quick-open').hidden = false;
  $('#quick-open-input').value = '';
  quickOpenIndex = 0;
  renderQuickOpen();
  $('#quick-open-input').focus();
}

function closeQuickOpen() {
  $('#quick-open').hidden = true;
}

function openLogs() {
  closeTerminalDrawer();
  $('#log-drawer').classList.add('open');
  $('#log-drawer').setAttribute('aria-hidden', 'false');
}

function closeLogs() {
  $('#log-drawer').classList.remove('open');
  $('#log-drawer').setAttribute('aria-hidden', 'true');
}

function showToast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 1800);
}

$$('.rail-tab').forEach((tab) => tab.addEventListener('click', () => {
  switchRailTab(tab.dataset.tab);
}));

$('#sidebar-toggle').addEventListener('click', () => workspace.classList.toggle('rail-hidden'));
$('#source-toggle').addEventListener('click', () => workspace.classList.toggle('source-hidden'));
$('#source-close').addEventListener('click', () => workspace.classList.add('source-hidden'));
$('#editor-tabs').addEventListener('click', (event) => {
  const tab = event.target.closest('.file-tab');
  if (!tab) return;
  if (event.target.closest('.file-tab-close')) closeOpenTab(tab.dataset.key);
  else switchOpenTab(tab.dataset.key);
});
$('#editor-tabs').addEventListener('keydown', (event) => {
  const tab = event.target.closest('.file-tab');
  if (!tab || event.target.closest('.file-tab-close')) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    switchOpenTab(tab.dataset.key);
  }
});
$('#figure-folder').addEventListener('click', () => {
  const list = $('#figure-files');
  list.hidden = !list.hidden;
  $('#figure-folder').classList.toggle('open', !list.hidden);
});
$('#save-source').addEventListener('click', saveSource);
$('#source-editor').addEventListener('input', () => {
  sourceDirty = true;
  setSaveState(tr('未保存'), 'dirty');
  updateEditorMetrics();
  updateCitationAutocomplete();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveSource, 700);
  if (!$('#source-find').hidden) {
    sourceFindIndex = -1;
    updateSourceFind(false);
  }
  if ($('#search-panel').classList.contains('active') && $('#project-search-input').value) scheduleProjectSearch();
});
$('#source-editor').addEventListener('scroll', () => {
  $('#line-numbers').scrollTop = $('#source-editor').scrollTop;
  syncSourceHighlights();
});
$('#source-editor').addEventListener('keydown', (event) => {
  if (!$('#citation-autocomplete').hidden) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveCitationSelection(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      acceptCitation();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      closeCitationAutocomplete();
      return;
    }
  }
  if (event.key !== 'Tab') return;
  event.preventDefault();
  const editor = event.currentTarget;
  const start = editor.selectionStart;
  editor.setRangeText('  ', start, editor.selectionEnd, 'end');
  editor.dispatchEvent(new Event('input', {bubbles: true}));
});
$('#source-editor').addEventListener('click', updateCitationAutocomplete);
document.addEventListener('pointerdown', (event) => {
  if (!event.target.closest('#source-editor, #citation-autocomplete')) closeCitationAutocomplete();
});
$('#source-wrap').addEventListener('pointerdown', () => { lastSearchContext = 'source'; });
$('#source-search-button').addEventListener('click', openSourceFind);
$('#source-find-close').addEventListener('click', closeSourceFind);
$('#source-find-prev').addEventListener('click', () => navigateSourceFind(-1));
$('#source-find-next').addEventListener('click', () => navigateSourceFind(1));
bindCommittedInput('#source-find-input', () => updateSourceFind());
$('#source-find-input').addEventListener('keydown', (event) => {
  if (isComposingKey(event)) return;
  if (event.key === 'Enter') {
    event.preventDefault();
    navigateSourceFind(event.shiftKey ? -1 : 1);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    closeSourceFind();
  }
});
['case', 'word', 'regex'].forEach((option) => $('#source-find-' + option).addEventListener('click', (event) => {
  event.currentTarget.classList.toggle('active');
  updateSourceFind();
}));
bindCommittedInput('#project-search-input', scheduleProjectSearch, () => {
  clearTimeout(projectSearchTimer);
  ++projectSearchToken;
});
$('#project-search-input').addEventListener('keydown', (event) => {
  if (isComposingKey(event)) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    moveProjectSearchSelection(event.key === 'ArrowDown' ? 1 : -1);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    openProjectSearchResult(projectSearchIndex);
  }
});
['case', 'word', 'regex'].forEach((option) => $('#project-search-' + option).addEventListener('click', (event) => {
  event.currentTarget.classList.toggle('active');
  runProjectSearch();
}));
$('#compile-button').addEventListener('click', compilePaper);
$('#download-source').addEventListener('click', async () => {
  if (await saveSource()) window.location.assign('download-source');
});
$('#previous-page').addEventListener('click', () => goToPage(currentPage() - 1));
$('#next-page').addEventListener('click', () => goToPage(currentPage() + 1));
$('#page-input').addEventListener('change', (event) => goToPage(event.target.value));
$('#page-input').addEventListener('keydown', (event) => { if (event.key === 'Enter') { goToPage(event.target.value); event.target.blur(); } });
$('#zoom-out').addEventListener('click', () => setScale(scale - .12));
$('#zoom-in').addEventListener('click', () => setScale(scale + .12));
$('#zoom-value').addEventListener('click', () => applyFit('width'));
$('#fit-page').addEventListener('click', () => applyFit('page'));
$('.pdf-pane').addEventListener('pointerdown', () => { lastSearchContext = 'pdf'; });
$('#pdf-search-button').addEventListener('click', openPdfFind);
$('#pdf-find-close').addEventListener('click', closePdfFind);
$('#pdf-find-prev').addEventListener('click', () => selectPdfMatch(pdfFindIndex - 1));
$('#pdf-find-next').addEventListener('click', () => selectPdfMatch(pdfFindIndex + 1));
bindCommittedInput('#pdf-find-input', () => {
  clearTimeout(pdfFindTimer);
  pdfFindTimer = setTimeout(runPdfFind, 150);
}, () => {
  clearTimeout(pdfFindTimer);
  ++pdfFindToken;
});
$('#pdf-find-input').addEventListener('keydown', (event) => {
  if (isComposingKey(event)) return;
  if (event.key === 'Enter') {
    event.preventDefault();
    selectPdfMatch(pdfFindIndex + (event.shiftKey ? -1 : 1));
  } else if (event.key === 'Escape') {
    event.preventDefault();
    closePdfFind();
  }
});
$('#logs-button').addEventListener('click', openLogs);
$('#close-logs').addEventListener('click', closeLogs);
$('#copy-log').addEventListener('click', async () => { await navigator.clipboard.writeText(latestLog || tr('暂无编译日志。')); showToast(tr('日志已复制')); });
$('#terminal-toggle').addEventListener('click', () => {
  if ($('#terminal-drawer').classList.contains('open')) closeTerminalDrawer();
  else openTerminal();
});
$('#terminal-close').addEventListener('click', closeTerminalDrawer);
$('#terminal-stop').addEventListener('click', () => stopTerminal());
$('#terminal-new').addEventListener('click', newTerminal);
$('#terminal-unlock').addEventListener('submit', (event) => {
  event.preventDefault();
  terminalAccessKey = $('#terminal-access-key').value.trim();
  if (!terminalAccessKey) return;
  sessionStorage.setItem('leafover-terminal-access-key', terminalAccessKey);
  $('#terminal-access-key').value = '';
  openTerminal();
});
bindCommittedInput('#quick-open-input', () => { quickOpenIndex = 0; renderQuickOpen(); });
$('#quick-open-input').addEventListener('keydown', (event) => {
  if (isComposingKey(event)) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (quickOpenItems.length) quickOpenIndex = (quickOpenIndex + (event.key === 'ArrowDown' ? 1 : -1) + quickOpenItems.length) % quickOpenItems.length;
    renderQuickOpen();
    $('.quick-open-item.active')?.scrollIntoView({block: 'nearest'});
  } else if (event.key === 'Enter') {
    event.preventDefault();
    openQuickItem();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    closeQuickOpen();
  }
});
$('#quick-open').addEventListener('pointerdown', (event) => { if (event.target === event.currentTarget) closeQuickOpen(); });

const storedTerminalHeight = Number(localStorage.getItem('paper-preview-terminal-height'));
if (storedTerminalHeight >= 180 && storedTerminalHeight <= window.innerHeight * .8) {
  document.documentElement.style.setProperty('--terminal-height', `${storedTerminalHeight}px`);
}
$('#terminal-resizer').addEventListener('pointerdown', (event) => {
  event.preventDefault();
  $('#terminal-resizer').classList.add('dragging');
  const onMove = (moveEvent) => {
    const area = workspace.getBoundingClientRect();
    const height = Math.max(180, Math.min(area.height - 180, area.bottom - moveEvent.clientY - 8));
    document.documentElement.style.setProperty('--terminal-height', `${height}px`);
    localStorage.setItem('paper-preview-terminal-height', height.toFixed(0));
    resizeTerminal();
    positionCitationAutocomplete();
  };
  const onUp = () => {
    $('#terminal-resizer').classList.remove('dragging');
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
});

const storedTheme = localStorage.getItem('paper-preview-theme');
document.documentElement.dataset.theme = storedTheme || 'dark';
let accentColor = localStorage.getItem('leafover-accent') || '#138a55';
function applyAccent(color) {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return;
  accentColor = color.toLowerCase();
  document.documentElement.style.setProperty('--accent', accentColor);
  const channels = [1, 3, 5].map((offset) => parseInt(accentColor.slice(offset, offset + 2), 16) / 255);
  const luminance = channels.map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
  document.documentElement.style.setProperty('--accent-contrast', luminance > .23 ? '#172219' : '#ffffff');
  $('#accent-picker').value = accentColor;
  $$('.accent-preset').forEach((button) => button.classList.toggle('active', button.dataset.accent === accentColor));
  localStorage.setItem('leafover-accent', accentColor);
  if (terminal) terminal.options.theme = terminalTheme();
}
applyAccent(accentColor);
$('#accent-toggle').addEventListener('click', () => {
  const panel = $('#accent-popover');
  panel.hidden = !panel.hidden;
  $('#accent-toggle').setAttribute('aria-expanded', String(!panel.hidden));
});
$$('.accent-preset').forEach((button) => button.addEventListener('click', () => applyAccent(button.dataset.accent)));
$('#accent-picker').addEventListener('input', (event) => applyAccent(event.target.value));
$('#accent-reset').addEventListener('click', () => applyAccent('#138a55'));
document.addEventListener('pointerdown', (event) => {
  if (event.target.closest('.accent-control')) return;
  $('#accent-popover').hidden = true;
  $('#accent-toggle').setAttribute('aria-expanded', 'false');
});
$('#theme-toggle').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('paper-preview-theme', next);
  if (terminal) terminal.options.theme = terminalTheme();
});
$('#language-toggle').addEventListener('click', () => {
  locale = locale === 'zh' ? 'en' : 'zh';
  localStorage.setItem('leafover-language', locale);
  localizeInterface();
  renderOpenTabs();
  renderProjectSearchResults();
  renderTerminalTabs();
  if (!$('#quick-open').hidden) renderQuickOpen();
  if (lastStatusData) setStatus(lastStatusData);
  showProjectSearchSummary();
  if (fitMode !== 'custom') $('#zoom-value').textContent = fitMode === 'page' ? tr('整页') : tr('适合宽度');
  updateEditorMetrics();
});


const settingsDialog = $('#project-settings');
function updateTitleSetting() {
  const automatic = $('#settings-auto-title').checked;
  $('#settings-title').disabled = automatic;
  if (automatic) $('#settings-title').value = projectData.detected_title || '';
}
let compilerInfo = null;
let compilerPollTimer = null;
let settingsTouched = false;
let savingSettings = false;
let settingsOpenVersion = 0;
function populateSettings(settings, files) {
  const select = $('#settings-main');
  select.replaceChildren(...files.map(name => new Option(name, name)));
  select.value = settings.main_file;
  $('#settings-compiler').value = settings.compiler || 'xelatex';
  $('#settings-auto-title').checked = !settings.title;
  $('#settings-title').value = settings.title || '';
  updateTitleSetting();
}
function renderCompilerStatus() {
  const selected = $('#settings-compiler').value;
  const compiler = compilerInfo?.compilers.find(item => item.id === selected);
  const installation = compilerInfo?.installation;
  const busy = installation?.state === 'installing';
  const failed = installation?.compiler === selected && installation?.state === 'error';
  $('#compiler-status').textContent = tr(busy && installation.compiler === selected ? '安装中…' : failed ? '安装失败' : !compiler ? '检测中…' : compiler.installed ? '已安装' : '未安装');
  $('#compiler-install').hidden = !compiler || compiler.installed;
  $('#compiler-install').disabled = busy;
  $('#compiler-install').textContent = tr(busy ? '安装中…' : '一键安装');
  $('#compiler-log-panel').hidden = !failed;
  $('#compiler-log').textContent = failed ? [installation.error, installation.log].filter(Boolean).join('\n') : '';
  $('#settings-save').disabled = savingSettings || !compiler?.installed;
}
async function refreshCompilers() {
  clearTimeout(compilerPollTimer);
  try {
    const response = await fetch('api/compilers');
    if (!response.ok) throw new Error(localized('无法检测编译器', 'Could not check compilers'));
    compilerInfo = await response.json();
    renderCompilerStatus();
  } catch (error) { $('#compiler-status').textContent = error.message; }
  if (settingsDialog.open && compilerInfo?.installation.state === 'installing') {
    compilerPollTimer = setTimeout(refreshCompilers, 1500);
  }
}
$('#settings-toggle').addEventListener('click', () => {
  settingsTouched = false;
  const version = ++settingsOpenVersion;
  const cached = projectData.settings || {main_file: mainSource, title: '', compiler: 'xelatex'};
  const files = projectData.files.filter(file => !file.name.includes('/') && file.name.endsWith('.tex') && !file.name.startsWith('-')).map(file => file.name);
  populateSettings(cached, files.length ? files : [cached.main_file]);
  $('#settings-error').hidden = true;
  renderCompilerStatus();
  settingsDialog.showModal();
  // Paint immediately; only fetch lightweight settings, never the whole project.
  fetch('api/settings').then(response => {
    if (!response.ok) throw new Error(localized('无法读取设置', 'Could not load settings'));
    return response.json();
  }).then(data => {
    if (!settingsDialog.open || version !== settingsOpenVersion) return;
    if (!settingsTouched) populateSettings(data.settings, data.main_files);
    compilerInfo = data;
    renderCompilerStatus();
    if (data.installation.state === 'installing') refreshCompilers();
  }).catch(error => {
    if (version !== settingsOpenVersion) return;
    $('#settings-error').textContent = error.message;
    $('#settings-error').hidden = false;
  });
});
$('#settings-form').addEventListener('input', () => { settingsTouched = true; });
$('#settings-compiler').addEventListener('change', renderCompilerStatus);
settingsDialog.addEventListener('close', () => { clearTimeout(compilerPollTimer); });
$('#compiler-install').addEventListener('click', async () => {
  $('#compiler-install').disabled = true;
  $('#settings-error').hidden = true;
  try {
    const response = await fetch('api/compilers/install', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({compiler: $('#settings-compiler').value})});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || localized('安装失败', 'Installation failed'));
    compilerInfo = data;
    renderCompilerStatus();
    if (data.installation.state === 'installing') compilerPollTimer = setTimeout(refreshCompilers, 1000);
  } catch (error) {
    $('#settings-error').textContent = error.message;
    $('#settings-error').hidden = false;
    renderCompilerStatus();
  }
});
$('#settings-auto-title').addEventListener('change', () => {
  updateTitleSetting();
  if (!$('#settings-auto-title').checked) $('#settings-title').focus();
});
for (const id of ['settings-close', 'settings-cancel']) $( '#' + id).addEventListener('click', () => settingsDialog.close());
$('#settings-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const save = $('#settings-save');
  savingSettings = true;
  save.disabled = true;
  $('#settings-error').hidden = true;
  try {
    const automatic = $('#settings-auto-title').checked;
    const title = automatic ? '' : $('#settings-title').value.trim();
    if (!automatic && !title) throw new Error(localized('请输入标题或启用自动读取', 'Enter a title or enable automatic detection'));
    if (sourceDirty && !(await saveSource())) throw new Error(localized('请先保存当前文件', 'Save the current file first'));
    const response = await fetch('api/settings', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({main_file: $('#settings-main').value, title, compiler: $('#settings-compiler').value})});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || localized('保存失败', 'Could not save settings'));
    projectData.settings = result.settings;
    mainSource = result.settings.main_file;
    settingsDialog.close();
    loadProject().then(() => { if (result.main_changed) loadSource(mainSource); });
    showToast(tr('设置已保存'));
  } catch (error) {
    $('#settings-error').textContent = error.message;
    $('#settings-error').hidden = false;
  } finally { savingSettings = false; renderCompilerStatus(); }
});

const storedWidth = Number(localStorage.getItem('paper-preview-source-width'));
if (storedWidth >= 25 && storedWidth <= 65) document.documentElement.style.setProperty('--source-width', `${storedWidth}%`);
$('#splitter').addEventListener('pointerdown', (event) => {
  event.preventDefault();
  const splitter = $('#splitter');
  const grabOffset = event.clientX - splitter.getBoundingClientRect().left;
  splitter.classList.add('dragging');
  const onMove = (moveEvent) => {
    const rect = workspace.getBoundingClientRect();
    const railWidth = workspace.classList.contains('rail-hidden') ? 0 : $('#project-rail').getBoundingClientRect().width;
    const sourceWidth = moveEvent.clientX - grabOffset - rect.left - railWidth;
    const width = Math.max(25, Math.min(65, (sourceWidth / rect.width) * 100));
    document.documentElement.style.setProperty('--source-width', `${width}%`);
    localStorage.setItem('paper-preview-source-width', width.toFixed(1));
    updateEditorMetrics();
    resizeTerminal();
    positionCitationAutocomplete();
  };
  const onUp = () => {
    $('#splitter').classList.remove('dragging');
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    if (fitMode !== 'custom') applyFit(fitMode);
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
});

scroller.addEventListener('scroll', () => { updatePageControl(); renderVisible(); });
scroller.addEventListener('wheel', (event) => {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault();
    setScale(scale * Math.exp(-event.deltaY * .0018));
  }
}, {passive: false});

document.addEventListener('keydown', (event) => {
  if ($('#project-settings').open) return;
  const commandKey = event.ctrlKey || event.metaKey;
  if ((event.ctrlKey || event.metaKey) && event.key === '`') {
    if ($('#terminal-toggle').hidden) return;
    event.preventDefault();
    if ($('#terminal-drawer').classList.contains('open')) closeTerminalDrawer();
    else openTerminal();
    return;
  }
  if (event.target.closest?.('#terminal-host')) return;
  if (commandKey && event.shiftKey && event.key.toLowerCase() === 'f') {
    event.preventDefault();
    openProjectSearch();
    return;
  }
  if (commandKey && event.key.toLowerCase() === 'p') {
    event.preventDefault();
    openQuickOpen();
    return;
  }
  if (commandKey && event.key.toLowerCase() === 'f') {
    event.preventDefault();
    if (event.target.closest?.('.pdf-pane') || lastSearchContext === 'pdf') openPdfFind();
    else openSourceFind();
    return;
  }
  if (commandKey && event.key.toLowerCase() === 's') {
    event.preventDefault();
    saveSource();
    return;
  }
  const typing = ['INPUT', 'TEXTAREA'].includes(event.target.tagName) || event.target.isContentEditable;
  if (typing) return;
  if (event.key === 'r' || event.key === 'R') compilePaper();
  else if (event.key === '+' || event.key === '=') setScale(scale + .12);
  else if (event.key === '-') setScale(scale - .12);
  else if (event.key === '0') applyFit('width');
  else if (event.key === 'ArrowLeft' || event.key === 'k') goToPage(currentPage() - 1);
  else if (event.key === 'ArrowRight' || event.key === 'j') goToPage(currentPage() + 1);
  else if (event.key === 'Escape') {
    closeLogs();
    closeQuickOpen();
    if (!$('#source-find').hidden) closeSourceFind();
    if (!$('#pdf-find').hidden) closePdfFind();
  }
});

window.addEventListener('beforeunload', (event) => {
  if (!sourceDirty) return;
  event.preventDefault();
  event.returnValue = '';
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    updateEditorMetrics();
    syncSourceHighlights();
    resizeTerminal();
    positionCitationAutocomplete();
    if (fitMode === 'custom') renderVisible();
    else applyFit(fitMode);
  }, 150);
});

localizeInterface();
loadProject().then(() => loadSource(mainSource));
loadPdf(false);
poll();
setInterval(poll, 1200);
