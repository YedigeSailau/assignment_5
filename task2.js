// Task 2 – Kanban board built from an array of objects
(() => {
  'use strict';
  const WIP_LIMIT = 3; // max cards in "In progress"
  const COLUMNS = [
    { key: 'todo', title: 'To do' },
    { key: 'progress', title: 'In progress' },
    { key: 'done', title: 'Done' }
  ];
  const cards = [
    { id: 1, title: 'Design header', tag: 'design', priority: 2, hours: 3, urgent: false, status: 'todo' },
    { id: 2, title: 'Write HTML skeleton', tag: 'html', priority: 3, hours: 2, urgent: true, status: 'progress' },
    { id: 3, title: 'Style the footer', tag: 'css', priority: 1, hours: 1, urgent: false, status: 'todo' },
    { id: 4, title: 'Add dark theme', tag: 'css', priority: 2, hours: 4, urgent: false, status: 'todo' },
    { id: 5, title: 'Form validation', tag: 'js', priority: 3, hours: 5, urgent: true, status: 'progress' },
    { id: 6, title: 'Image gallery', tag: 'html', priority: 1, hours: 3, urgent: false, status: 'done' },
    { id: 7, title: 'Mobile menu', tag: 'js', priority: 2, hours: 3, urgent: false, status: 'todo' },
    { id: 8, title: 'Logo and colors', tag: 'design', priority: 3, hours: 2, urgent: false, status: 'done' },
    { id: 9, title: 'Fix console errors', tag: 'js', priority: 3, hours: 1, urgent: true, status: 'todo' },
    { id: 10, title: 'Responsive grid', tag: 'css', priority: 2, hours: 4, urgent: false, status: 'done' },
    { id: 11, title: 'Write README', tag: 'docs', priority: 1, hours: 2, urgent: false, status: 'todo' },
    { id: 12, title: 'Deploy to GitHub Pages', tag: 'docs', priority: 2, hours: 1, urgent: false, status: 'progress' }
  ];
  let filterTag = 'all', query = '', sortByPriority = false, message = '', messageKind = '';

  const $ = (id) => document.getElementById(id);
  const board = $('k-board'), tagSelect = $('k-tag'), search = $('k-search'), sortBtn = $('k-sort');
  const bar = $('k-progress'), barText = $('k-progress-text'), msgEl = $('k-msg');

  function fillTags() {
    const tags = ['all'];
    for (const c of cards) { if (!tags.includes(c.tag)) tags.push(c.tag); }
    for (const t of tags) {
      const o = document.createElement('option');
      o.value = t; o.textContent = t === 'all' ? 'All tags' : t;
      tagSelect.append(o);
    }
  }
  const countIn = (status) => cards.filter((c) => c.status === status).length;

  function buildCard(c, colIndex) {
    const li = document.createElement('li');
    li.className = `kcard p${c.priority}` + (c.status === 'done' ? ' done' : '');
    const t = document.createElement('div'); t.className = 'ttl'; t.textContent = c.title;
    const meta = document.createElement('div'); meta.className = 'meta';
    const tag = document.createElement('span'); tag.className = 'badge'; tag.textContent = c.tag;
    meta.append(tag);
    if (c.urgent) { const u = document.createElement('span'); u.className = 'badge urgent'; u.textContent = 'urgent'; meta.append(u); }
    meta.append(`P${c.priority} · ${c.hours} h`);
    const row = document.createElement('div');
    for (const dir of [-1, 1]) {
      const target = colIndex + dir;
      if (target < 0 || target >= COLUMNS.length) continue;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn ghost';
      b.dataset.action = 'move'; b.dataset.id = c.id; b.dataset.dir = dir;
      b.textContent = dir < 0 ? '←' : '→';
      b.setAttribute('aria-label', `Move "${c.title}" to ${COLUMNS[target].title}`);
      row.append(b);
    }
    li.append(t, meta, row);
    return li;
  }

  // the only render function: called after every change
  function render() {
    board.replaceChildren();
    let shown = 0;
    COLUMNS.forEach((col, i) => {
      let list = cards.filter((c) => c.status === col.key &&
        (filterTag === 'all' || c.tag === filterTag) &&
        c.title.toLowerCase().includes(query.toLowerCase()));
      if (sortByPriority) list = [...list].sort((a, b) => b.priority - a.priority);
      shown += list.length;

      const section = document.createElement('section'); section.className = 'col';
      const h = document.createElement('h3');
      const name = document.createElement('span'); name.textContent = col.title;
      const cnt = document.createElement('span');
      const total = countIn(col.key);
      cnt.textContent = col.key === 'progress' ? `${total}/${WIP_LIMIT}` : total;
      h.append(name, cnt);
      if (col.key === 'progress' && total >= WIP_LIMIT) section.classList.add('full');
      const ul = document.createElement('ul'); ul.className = 'cards';
      for (const c of list) ul.append(buildCard(c, i));
      if (list.length === 0) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'No cards'; section.append(h, p); }
      else section.append(h, ul);
      board.append(section);
    });

    // own loop: finished cards and hours
    let doneCount = 0, doneHours = 0, allHours = 0;
    for (const c of cards) { allHours += c.hours; if (c.status === 'done') { doneCount++; doneHours += c.hours; } }
    bar.max = cards.length; bar.value = doneCount;
    barText.textContent = `${doneCount} of ${cards.length} cards done · ${doneHours} of ${allHours} h`;
    sortBtn.setAttribute('aria-pressed', String(sortByPriority));

    if (shown === 0) { msgEl.textContent = 'Nothing found. Change the search or the tag.'; msgEl.className = 'msg bad'; }
    else { msgEl.textContent = message; msgEl.className = 'msg ' + messageKind; }
  }

  // event delegation: one listener for all card buttons
  board.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="move"]');
    if (!btn) return;
    const card = cards.find((c) => c.id === Number(btn.dataset.id));
    const from = COLUMNS.findIndex((col) => col.key === card.status);
    const to = from + Number(btn.dataset.dir);
    if (to < 0 || to >= COLUMNS.length) return;
    const target = COLUMNS[to].key;
    if (target === 'progress' && countIn('progress') >= WIP_LIMIT) {
      message = `Blocked: "In progress" already has ${WIP_LIMIT} cards. Finish one first.`; messageKind = 'bad';
    } else {
      card.status = target; message = `"${card.title}" moved to ${COLUMNS[to].title}.`; messageKind = 'good';
    }
    render();
  });
  tagSelect.addEventListener('change', () => { filterTag = tagSelect.value; message = ''; render(); });
  search.addEventListener('input', () => { query = search.value.trim(); message = ''; render(); });
  sortBtn.addEventListener('click', () => { sortByPriority = !sortByPriority; render(); });

  fillTags();
  render();
})();
