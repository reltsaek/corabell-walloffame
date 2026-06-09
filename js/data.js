let _data = null;

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
