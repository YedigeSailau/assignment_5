// Task 3 – Character creator with live validation
(() => {
  'use strict';
  const TOTAL_POINTS = 20, SKILL_MIN = 1, SKILL_MAX = 10;
  const TAKEN_NAMES = ['arthur', 'merlin', 'gandalf', 'conan'];
  const SKILLS = ['strength', 'agility', 'magic', 'vitality'];
  const CLASS_MIN = { mage: 'magic', warrior: 'strength', rogue: 'agility' }; // main skill of each class
  const CLASS_MIN_VALUE = 5;
  const WARRIOR_MAX_MAGIC = 3;

  const form = document.getElementById('c-form');
  form.noValidate = true; // browser bubbles off; HTML attributes stay
  const $ = (id) => document.getElementById(id);
  const fields = ['name', 'class', 'color', ...SKILLS];
  const input = (f) => $('c-' + f);
  const touched = {};
  const summary = $('c-summary'), preview = $('c-preview'), result = $('c-result');

  const num = (f) => { const v = input(f).value.trim(); return v === '' ? NaN : Number(v); };
  const used = () => SKILLS.reduce((s, f) => s + (Number.isFinite(num(f)) ? num(f) : 0), 0);

  // each validator returns an error text or '' (valid)
  const rules = {
    name() {
      const v = input('name').value.trim();
      if (v === '') return 'Enter a name.';
      if (v.length < 3 || v.length > 16) return 'Name must be 3–16 characters.';
      if (!/^[A-Za-z]+$/.test(v)) return 'Use letters only (A–Z).';
      if (TAKEN_NAMES.includes(v.toLowerCase())) return `The name "${v}" is already taken.`;
      return '';
    },
    class() { return input('class').value === '' ? 'Choose a class.' : ''; },
    color() { return input('color').value === '' ? 'Choose a color.' : ''; }
  };
  SKILLS.forEach((f) => {
    rules[f] = () => {
      const n = num(f);
      if (Number.isNaN(n)) return 'Enter a number.';
      if (!Number.isInteger(n)) return 'Use a whole number.';
      if (n < SKILL_MIN || n > SKILL_MAX) return `Value must be ${SKILL_MIN}–${SKILL_MAX}.`;
      const cls = input('class').value;
      if (cls && CLASS_MIN[cls] === f && n < CLASS_MIN_VALUE) return `A ${cls} needs ${f} ${CLASS_MIN_VALUE} or more.`;
      if (cls === 'warrior' && f === 'magic' && n > WARRIOR_MAX_MAGIC) return `A warrior can have magic ${WARRIOR_MAX_MAGIC} at most.`;
      return '';
    };
  });
  function pointsError() {
    const left = TOTAL_POINTS - used();
    if (left > 0) return `Spend ${left} more point${left === 1 ? '' : 's'}.`;
    if (left < 0) return `${-left} point${left === -1 ? '' : 's'} too many.`;
    return '';
  }

  function show(f) {
    const msg = rules[f]();
    const box = input(f);
    $(`c-${f}-err`).textContent = msg;
    box.setAttribute('aria-invalid', String(msg !== ''));
    box.classList.toggle('valid', msg === '');
    if (box.getAttribute('aria-describedby') !== `c-${f}-err`) box.setAttribute('aria-describedby', `c-${f}-err`);
    return msg;
  }
  function showPoints() {
    const left = TOTAL_POINTS - used();
    $('c-left').textContent = left;
    document.querySelector('.points').classList.toggle('over', left < 0);
    const anyTouched = SKILLS.some((f) => touched[f]);
    const msg = anyTouched ? pointsError() : '';
    $('c-points-err').textContent = msg;
    return anyTouched ? msg : '';
  }
  function validateTouched() { fields.forEach((f) => { if (touched[f]) show(f); }); showPoints(); }

  function buildCard(target, final) {
    target.replaceChildren();
    target.className = 'char' + (final ? ' final-card' : '') + (input('color').value ? ' ' + input('color').value : '');
    const h = document.createElement('h4');
    h.textContent = input('name').value.trim() || 'Nameless hero';
    const sub = document.createElement('div');
    sub.textContent = `Class: ${input('class').value || '—'} · Color: ${input('color').value || '—'}`;
    const ul = document.createElement('ul');
    SKILLS.forEach((f) => { const li = document.createElement('li'); li.textContent = `${f}: ${input(f).value || 0}`; ul.append(li); });
    target.append(h, sub, ul);
  }

  fields.forEach((f) => {
    input(f).addEventListener('blur', () => { touched[f] = true; validateTouched(); });
    const live = () => { if (touched[f]) validateTouched(); buildCard(preview); showPoints(); };
    input(f).addEventListener('input', live);
    input(f).addEventListener('change', live);
    input(f).addEventListener('input', () => { $('c-left').textContent = TOTAL_POINTS - used(); document.querySelector('.points').classList.toggle('over', used() > TOTAL_POINTS); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    fields.forEach((f) => { touched[f] = true; });
    const bad = fields.filter((f) => show(f) !== '');
    const pe = pointsError();
    $('c-points-err').textContent = pe;
    const count = bad.length + (pe ? 1 : 0);
    if (count > 0) {
      summary.className = 'summary';
      summary.textContent = `Please fix ${count} error${count === 1 ? '' : 's'}.`;
      (bad.length ? input(bad[0]) : input(SKILLS[0])).focus();
      return;
    }
    TAKEN_NAMES.push(input('name').value.trim().toLowerCase());
    buildCard(result, true);
    const ok = document.createElement('p'); ok.textContent = 'Character created!'; ok.className = 'final win';
    result.prepend(ok);
    summary.textContent = '';
    form.reset();
    fields.forEach((f) => { touched[f] = false; $(`c-${f}-err`).textContent = ''; input(f).removeAttribute('aria-invalid'); input(f).classList.remove('valid'); });
    $('c-points-err').textContent = '';
    $('c-left').textContent = TOTAL_POINTS;
    buildCard(preview);
  });

  buildCard(preview);
})();
