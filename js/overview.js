/* ── Helpers ─────────────────────────── */
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

function buildHeaderDeco(container, count = 32) {
  container.innerHTML = '';
  container.appendChild(buildBulbRow(count));
}

function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1).trimEnd() + '…';
}

/* ── Build one teaser card ───────────── */
function buildCard(eintrag, index) {
  const a = document.createElement('a');
  a.className = 'teaser-card';
  a.href = `detail.html?id=${eintrag.nr}`;
  a.style.setProperty('--i', index);
  a.setAttribute('aria-label', `${eintrag.filmtitel} – ${eintrag.lovestoryTitel}`);

  // Poster image
  const img = document.createElement('div');
  img.className = 'teaser-img';
  img.style.backgroundImage = `url('${eintrag.teaserBild}')`;
  // Fallback gradient if image fails to load
  img.style.backgroundImage =
    `url('${eintrag.teaserBild}'), ` +
    `linear-gradient(145deg, #1a0814 0%, #2a0a1e 40%, #0a0a18 100%)`;
  a.appendChild(img);

  // Top overlay: nr + title + year
  const top = document.createElement('div');
  top.className = 'teaser-overlay-top';
  top.innerHTML = `
    <span class="teaser-nr">#${eintrag.nr}</span>
    <div class="teaser-meta">
      <span class="teaser-title">${eintrag.filmtitel}</span>
      <span class="teaser-year">${eintrag.jahre}</span>
    </div>
  `;
  a.appendChild(top);

  // Bottom lovestory label
  const bar = document.createElement('div');
  bar.className = 'teaser-label-bar';
  const label = document.createElement('span');
  label.className = 'teaser-lovestory';
  label.textContent = truncate(eintrag.lovestoryTitel, 52);
  bar.appendChild(label);
  a.appendChild(bar);

  return a;
}

/* ── Intersection Observer for entrance ─ */
function setupEntranceObserver(cards) {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  cards.forEach(c => obs.observe(c));
}

/* ── Main ────────────────────────────── */
async function init() {
  await loadData();

  // Header deco bulbs
  const headerDeco = document.getElementById('headerDeco');
  if (headerDeco) buildHeaderDeco(headerDeco, 36);

  // Build card grid
  const grid = document.getElementById('cardGrid');
  if (!grid) return;

  const eintraege = getAllEintraege();
  const cards = eintraege.map((e, i) => {
    const card = buildCard(e, i);
    grid.appendChild(card);
    return card;
  });

  // Slight delay so DOM is painted before observer fires
  requestAnimationFrame(() => setupEntranceObserver(cards));
}

document.addEventListener('DOMContentLoaded', init);
