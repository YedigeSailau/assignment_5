// Task 1 – Higher or Lower (gadget prices)
(() => {
  'use strict';
  // ---- all numbers of the game are constants ----
  const START_LIVES = 3;
  const WIN_STREAK = 10;
  const ITEMS = [
    { name: 'USB cable', price: 9 }, { name: 'Wireless mouse', price: 25 },
    { name: 'Mechanical keyboard', price: 90 }, { name: 'Bluetooth speaker', price: 60 },
    { name: 'Smartwatch', price: 199 }, { name: 'Gaming headset', price: 120 },
    { name: 'Tablet', price: 329 }, { name: 'Smartphone', price: 799 },
    { name: 'Monitor 27"', price: 249 }, { name: 'Laptop', price: 1199 },
    { name: 'Drone', price: 449 }, { name: 'Webcam', price: 60 }
  ];

  const $ = (id) => document.getElementById(id);
  const el = {
    lives: $('g-lives'), streak: $('g-streak'), best: $('g-best'),
    cur: $('g-current'), next: $('g-next'), msg: $('g-msg'), warn: $('g-warn'),
    higher: $('g-higher'), lower: $('g-lower'), restart: $('g-restart')
  };
  let state;

  // fair random: min and max both included
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pickIndex(exclude) {
    let i;
    do { i = randInt(0, ITEMS.length - 1); } while (i === exclude);
    return i;
  }

  function newGame() {
    const best = state ? state.best : 0;
    const cur = pickIndex(-1);
    state = { lives: START_LIVES, streak: 0, best, cur, next: pickIndex(cur), over: false, result: '', msg: 'Is the next item more expensive or cheaper?', kind: '', revealed: false };
    el.warn.textContent = '';
    render();
  }

  function guess(choice) {
    // invalid move: show a warning, do NOT touch the state
    if (choice !== 'higher' && choice !== 'lower') { el.warn.textContent = 'Invalid move.'; return; }
    if (state.over) { el.warn.textContent = 'The game is over. Press Restart to play again.'; return; }
    el.warn.textContent = '';

    const a = ITEMS[state.cur], b = ITEMS[state.next];
    // equal prices count as a right guess
    const correct = (choice === 'higher' && b.price >= a.price) || (choice === 'lower' && b.price <= a.price);
    state.revealed = true;
    const info = `${b.name} costs $${b.price} (${a.name}: $${a.price}). `;

    if (correct) {
      state.streak += 1;
      if (state.streak > state.best) { state.best = state.streak; }
      state.msg = info + 'Correct!'; state.kind = 'good';
    } else {
      state.lives -= 1;
      state.streak = 0;
      state.msg = info + 'Wrong!'; state.kind = 'bad';
    }

    if (state.streak === WIN_STREAK) { state.over = true; state.result = 'win'; }
    else if (state.lives === 0) { state.over = true; state.result = 'loss'; }
    else { state.cur = state.next; state.next = pickIndex(state.cur); }
    render();
  }

  function renderItem(box, item, showPrice) {
    box.replaceChildren();
    const name = document.createElement('b'); name.textContent = item.name;
    const price = document.createElement('span'); price.className = 'price';
    price.textContent = showPrice ? `$${item.price}` : '$ ???';
    box.append(name, price);
  }

  function render() {
    el.lives.textContent = '♥'.repeat(state.lives) || '0';
    el.streak.textContent = state.streak;
    el.best.textContent = state.best;
    // after the last move the revealed price belongs to the old "next" item
    renderItem(el.cur, ITEMS[state.cur], true);
    renderItem(el.next, ITEMS[state.next], false);
    el.msg.textContent = state.msg;
    el.msg.className = 'msg ' + state.kind;
    el.higher.disabled = state.over;
    el.lower.disabled = state.over;
    const old = document.getElementById('g-final');
    if (old) old.remove();
    if (state.over) {
      const f = document.createElement('p');
      f.id = 'g-final';
      f.className = 'final ' + state.result;
      f.textContent = state.result === 'win' ? `You win! Streak of ${WIN_STREAK}!` : 'Game over: no lives left.';
      el.msg.after(f);
    }
  }

  document.querySelector('#task1 .row').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn === el.restart) newGame(); else guess(btn.dataset.guess);
  });
  newGame();
})();
