const {chapters, notes} = window.STORY;
const $ = id => document.getElementById(id);
const shell = $('readerShell');
const book = $('book');
const panel = $('notePanel');
const storyText = $('storyText');
const conceptDialog = $('conceptDialog');
const storageKey = 'the-second-bell-discoveries-v1';
const noteLocations = new Map();
const noteOrder = [];

chapters.forEach((chapter, chapterIndex) => {
  for (const match of chapter.html.matchAll(/data-note="([^"]+)"/g)) {
    if (!notes[match[1]]) throw new Error(`Missing note: ${match[1]}`);
    if (noteLocations.has(match[1])) throw new Error(`Repeated note: ${match[1]}`);
    noteLocations.set(match[1], chapterIndex);
    noteOrder.push(match[1]);
  }
});
if (noteOrder.length !== Object.keys(notes).length) throw new Error('A note is missing from the story.');

let visited;
try { visited = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]').filter(id => noteLocations.has(id))); }
catch { visited = new Set(); }
let currentChapter = -1;
let activeNote = null;
let lastTrigger = null;

function fromHash() {
  const match = /^#chapter-(\d+)$/.exec(location.hash);
  return match ? Math.max(0, Math.min(chapters.length - 1, Number(match[1]) - 1)) : 0;
}

function updateDiscoveryCount() {
  $('discoveryCount').textContent = `${visited.size}/${noteOrder.length} discoveries`;
  document.querySelectorAll('.concept-list [data-note]').forEach(button => {
    button.classList.toggle('is-found', visited.has(button.dataset.note));
  });
}

function closeNote(restoreFocus = false) {
  if (!activeNote) return;
  shell.classList.remove('has-note');
  document.body.classList.remove('note-open');
  panel.setAttribute('aria-hidden', 'true');
  panel.inert = true;
  storyText.querySelectorAll('.mark.is-active').forEach(button => {
    button.classList.remove('is-active');
    button.setAttribute('aria-expanded', 'false');
  });
  activeNote = null;
  if (restoreFocus && lastTrigger?.isConnected) lastTrigger.focus({preventScroll:true});
}

function render(index) {
  closeNote();
  currentChapter = index;
  const chapter = chapters[index];
  book.dataset.art = chapter.art;
  book.style.setProperty('--accent', chapter.color);
  $('coverChapter').textContent = `${chapter.number} · 0${chapters.length}`;
  $('coverEyebrow').textContent = chapter.eyebrow;
  $('chapterTitle').textContent = chapter.title;
  $('chapterDeck').textContent = chapter.deck;
  $('coverQuote').textContent = chapter.imageLine;
  $('artLabel').textContent = chapter.eyebrow;
  $('readingChapter').textContent = `CHAPTER ${chapter.number} / 0${chapters.length}`;
  $('readingEyebrow').textContent = chapter.eyebrow;
  $('readingTitle').textContent = chapter.title;
  $('readingDeck').textContent = chapter.deck;
  $('pageCount').textContent = `${index + 1} / ${chapters.length}`;
  $('checkQuestion').textContent = chapter.question;
  $('checkAnswer').textContent = chapter.answer;
  $('readingCheck').open = false;
  storyText.innerHTML = chapter.html;
  storyText.querySelectorAll('[data-note]').forEach(button => {
    button.setAttribute('aria-controls', 'notePanel');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', `${button.textContent.trim()} — open a context note`);
    if (visited.has(button.dataset.note)) button.classList.add('was-opened');
  });
  $('chapterNav').replaceChildren();
  chapters.forEach((item, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = `<span>${item.number}</span>${item.title}`;
    if (i === index) button.setAttribute('aria-current', 'page');
    button.addEventListener('click', () => selectChapter(i));
    $('chapterNav').append(button);
  });
  $('prevChapter').disabled = index === 0;
  $('nextChapter').disabled = index === chapters.length - 1;
  $('readingScroll').scrollTop = 0;
  document.title = `${chapter.title} · The Second Bell`;
}

function selectChapter(index) {
  if (index < 0 || index >= chapters.length) return;
  location.hash = `chapter-${index + 1}`;
  render(index);
  if (matchMedia('(max-width: 680px)').matches) window.scrollTo({top:0,behavior:'smooth'});
}

function showNote(id, trigger) {
  const note = notes[id];
  if (!note) return;
  closeNote();
  activeNote = id;
  lastTrigger = trigger;
  if (trigger) {
    trigger.classList.add('is-active', 'was-opened');
    trigger.setAttribute('aria-expanded', 'true');
  }
  visited.add(id);
  try { localStorage.setItem(storageKey, JSON.stringify([...visited])); } catch {}
  updateDiscoveryCount();
  panel.dataset.kind = note.kind;
  $('noteKind').textContent = {device:'Literary device',poetry:'Poetry & rhythm',word:'Earlier English'}[note.kind];
  $('noteTitle').textContent = note.title;
  $('noteQuote').textContent = note.quote;
  $('noteDefinition').textContent = note.definition;
  $('noteHere').textContent = note.here;
  $('noteTransfer').textContent = note.transfer;
  $('transferHeading').textContent = note.kind === 'word' ? 'In today’s English' : 'Try it outside the story';
  $('noteScanWrap').hidden = !note.scan;
  $('noteScan').textContent = note.scan || '';
  const position = noteOrder.indexOf(id);
  $('noteProgress').textContent = `IDEA ${position + 1} OF ${noteOrder.length}`;
  $('nextNote').disabled = position === noteOrder.length - 1;
  $('nextNote').textContent = position === noteOrder.length - 1 ? 'End of the story' : 'Next discovery →';
  shell.classList.add('has-note');
  document.body.classList.add('note-open');
  panel.inert = false;
  panel.setAttribute('aria-hidden', 'false');
  panel.querySelector('.note-scroll').scrollTop = 0;
  $('noteTitle').focus({preventScroll:true});
}

function jumpToNote(id) {
  const index = noteLocations.get(id);
  if (index === undefined) return;
  if (index !== currentChapter) selectChapter(index);
  const trigger = storyText.querySelector(`[data-note="${id}"]`);
  showNote(id, trigger);
  if (trigger && !matchMedia('(max-width: 680px)').matches) trigger.scrollIntoView({block:'center',behavior:'smooth'});
}

function buildConceptIndex() {
  const groups = [
    {kind:'device',title:'Literary devices',description:'Look for clues, choices, and double meanings.'},
    {kind:'poetry',title:'Poetry & rhythm',description:'Hear what the actors do with a line.'},
    {kind:'word',title:'Earlier English',description:'Find familiar meanings behind unfamiliar words.'}
  ];
  for (const group of groups) {
    const section = document.createElement('section');
    section.className = 'concept-group';
    const heading = document.createElement('h3'); heading.textContent = group.title;
    const lead = document.createElement('p'); lead.textContent = group.description;
    const list = document.createElement('div'); list.className = 'concept-list';
    for (const id of noteOrder.filter(id => notes[id].kind === group.kind)) {
      const button = document.createElement('button');
      button.type = 'button'; button.dataset.note = id; button.textContent = notes[id].title;
      button.addEventListener('click', () => { conceptDialog.close(); jumpToNote(id); });
      list.append(button);
    }
    section.append(heading, lead, list);
    $('conceptGroups').append(section);
  }
  updateDiscoveryCount();
}

storyText.addEventListener('click', event => {
  const trigger = event.target.closest('[data-note]');
  if (trigger && storyText.contains(trigger)) showNote(trigger.dataset.note, trigger);
});
$('closeNote').addEventListener('click', () => closeNote(true));
$('noteBackdrop').addEventListener('click', () => closeNote(true));
$('nextNote').addEventListener('click', () => {
  const next = noteOrder[noteOrder.indexOf(activeNote) + 1];
  if (next) jumpToNote(next);
});
$('prevChapter').addEventListener('click', () => selectChapter(currentChapter - 1));
$('nextChapter').addEventListener('click', () => selectChapter(currentChapter + 1));
$('conceptIndexButton').addEventListener('click', () => { closeNote(); conceptDialog.showModal(); });
$('closeConceptDialog').addEventListener('click', () => conceptDialog.close());
conceptDialog.addEventListener('click', event => { if (event.target === conceptDialog) conceptDialog.close(); });
window.addEventListener('hashchange', () => { const index = fromHash(); if (index !== currentChapter) render(index); });
window.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeNote(true);
  if (conceptDialog.open || activeNote) return;
  if (event.altKey && event.key === 'ArrowRight') { event.preventDefault(); selectChapter(currentChapter + 1); }
  if (event.altKey && event.key === 'ArrowLeft') { event.preventDefault(); selectChapter(currentChapter - 1); }
});

buildConceptIndex();
render(fromHash());
