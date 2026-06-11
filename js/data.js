let _data = null;

/* ── Shared marquee builder ──────────── */
function buildBulbRow(count) {
  const row = document.createElement('div');
  row.className = 'bulb-row';
  for (let i = 0; i < count; i++) {
    const b = document.createElement('span');
    b.className = 'bulb';
    row.appendChild(b);
  }
  return row;
}

function buildMarqueeSign(textContent, bulbCount = 18) {
  const sign = document.createElement('div');
  sign.className = 'marquee-sign';
  sign.appendChild(buildBulbRow(bulbCount));
  const board = document.createElement('div');
  board.className = 'marquee-board';
  const txt = document.createElement('div');
  txt.className = 'marquee-text';
  txt.setAttribute('aria-label', textContent);
  txt.textContent = textContent;
  board.appendChild(txt);
  sign.appendChild(board);
  sign.appendChild(buildBulbRow(bulbCount));
  return { sign, textEl: txt };
}

async function loadData() {
  if (_data) return _data;
  const res = await fetch('data/walloffame.json');
  _data = await res.json();
  return _data;
}

function getEintrag(nr) {
  return _data?.eintraege.find(e => e.nr === nr) ?? null;
}

function getAllEintraege() {
  return _data?.eintraege ?? [];
}

function getPrev(nr) {
  const all = getAllEintraege();
  const idx = all.findIndex(e => e.nr === nr);
  return idx > 0 ? all[idx - 1] : null;
}

function getNext(nr) {
  const all = getAllEintraege();
  const idx = all.findIndex(e => e.nr === nr);
  return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
}
