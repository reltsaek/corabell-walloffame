/* ══════════════════════════════════════════
   DETAIL PAGE
   ══════════════════════════════════════════ */

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

function buildMarqueeSign(textContent, bulbCount = 18) {
  const sign = document.createElement('div');
  sign.className = 'marquee-sign';
  sign.appendChild(buildBulbRow(bulbCount));
  const board = document.createElement('div');
  board.className = 'marquee-board';
  const txt = document.createElement('div');
  txt.className = 'marquee-text';
  txt.setAttribute('aria-label', textContent);
  board.appendChild(txt);
  sign.appendChild(board);
  sign.appendChild(buildBulbRow(bulbCount));
  return { sign, textEl: txt };
}

/* ── Typewriter effect ───────────────── */
function typewrite(el, text, onDone) {
  const msPerChar = Math.max(18, Math.min(38, 2200 / text.length));
  let i = 0;
  el.textContent = '';

  function tick() {
    if (i >= text.length) { onDone?.(); return; }
    el.textContent += text[i++];
    setTimeout(tick, msPerChar);
  }
  setTimeout(tick, 650); // wait for card entrance
}

/* ── Sparkles around the star ────────── */
function addSparkles(container) {
  // Star circle is ~at (50%, 36%) of the card
  const cx = 50, cy = 36;
  const count = 14;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI + Math.random() * 0.4;
    const r  = 9 + Math.random() * 7;
    const rx = r;
    const ry = r * 1.6; // star zone is taller than wide
    const x  = cx + Math.cos(angle) * rx;
    const y  = cy + Math.sin(angle) * ry;

    const s = document.createElement('span');
    s.className = 'sparkle';
    s.style.left   = `${x}%`;
    s.style.top    = `${y}%`;
    s.style.width  = `${2 + Math.random() * 3}px`;
    s.style.height = s.style.width;
    s.style.animationDelay    = `${Math.random() * 2.5}s`;
    s.style.animationDuration = `${1.4 + Math.random() * 1.2}s`;
    container.appendChild(s);
  }
}

/* ── Navigation ──────────────────────── */
function setupNav(currentNr) {
  const prev = getPrev(currentNr);
  const next = getNext(currentNr);
  const all  = getAllEintraege();
  const idx  = all.findIndex(e => e.nr === currentNr);

  // Top nav
  ['btnBack', 'btnPrev', 'btnNext'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === 'btnBack') {
      el.addEventListener('click', () => { window.location.href = 'index.html'; });
    } else if (id === 'btnPrev') {
      if (prev) el.addEventListener('click', () => navigateTo(prev.nr));
      else el.disabled = true;
    } else {
      if (next) el.addEventListener('click', () => navigateTo(next.nr));
      else el.disabled = true;
    }
  });

  // Counter
  const counter = document.getElementById('navCounter');
  if (counter) counter.textContent = `${idx + 1} / ${all.length}`;

  // Bottom prev/next
  const bottomPrev = document.getElementById('btnPrev2');
  const bottomNext = document.getElementById('btnNext2');
  if (bottomPrev) {
    if (prev) bottomPrev.addEventListener('click', () => navigateTo(prev.nr));
    else bottomPrev.disabled = true;
  }
  if (bottomNext) {
    if (next) bottomNext.addEventListener('click', () => navigateTo(next.nr));
    else bottomNext.disabled = true;
  }
}

function navigateTo(nr) {
  // Use View Transitions API if available
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      window.location.href = `detail.html?id=${nr}`;
    });
  } else {
    window.location.href = `detail.html?id=${nr}`;
  }
}

/* ── Accordion ───────────────────────── */
function setupAccordion() {
  document.querySelectorAll('.accordion-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const body = btn.nextElementSibling;
      if (body) body.classList.toggle('is-open', !expanded);
    });
  });
}

/* ── Render ──────────────────────────── */
function render(eintrag) {
  // Page title
  document.title = `${eintrag.filmtitel} · Wall of Fame`;

  // ── Number on star
  const nrEl = document.getElementById('wofNr');
  if (nrEl) nrEl.textContent = `#${eintrag.nr}`;

  // ── Marquee: Zitat
  const marqueeZone = document.getElementById('wofMarqueeZone');
  if (marqueeZone) {
    const { sign, textEl } = buildMarqueeSign(eintrag.zitat, 16);
    marqueeZone.appendChild(sign);
    // Typewriter after card animation
    typewrite(textEl, eintrag.zitat);
  }

  // ── Info panel
  const titleEl = document.getElementById('wofFilmtitel');
  const metaEl  = document.getElementById('wofMeta');
  if (titleEl) titleEl.textContent = eintrag.filmtitel;
  if (metaEl)  metaEl.innerHTML =
    `<span class="star-icon">★</span>${eintrag.typ} · ${eintrag.jahre}<span class="star-icon">★</span>`;

  // ── Sparkles
  const sparklesEl = document.getElementById('wofSparkles');
  if (sparklesEl) addSparkles(sparklesEl);

  // ── lovestoryTitel banner
  const bannerBoard = document.getElementById('bannerBoard');
  if (bannerBoard) {
    const { sign, textEl: bannerText } = buildMarqueeSign(eintrag.lovestoryTitel, 18);
    bannerText.classList.add('banner-text-style');
    bannerBoard.appendChild(sign);
    bannerText.textContent = eintrag.lovestoryTitel;
  }

  // ── Teaser image
  const teaserImg = document.getElementById('teaserImg');
  if (teaserImg && eintrag.teaserBild) {
    teaserImg.src = eintrag.teaserBild;
    teaserImg.alt = `Filmplakat: ${eintrag.filmtitel}`;
  } else {
    document.getElementById('accordionTeaser')?.remove();
  }

  // ── Accordion content
  const szeneEl = document.getElementById('szeneText');
  const werEl   = document.getElementById('werText');
  if (szeneEl && eintrag.szeneBeschreibung) szeneEl.textContent = eintrag.szeneBeschreibung;
  if (werEl   && eintrag.werSagt)           werEl.innerHTML =
    `<span class="accordion-quote">${eintrag.zitat}</span>${eintrag.werSagt}`;

  // Hide accordion items if no data
  if (!eintrag.szeneBeschreibung) {
    document.getElementById('accordionSzene')?.remove();
  }
  if (!eintrag.werSagt) {
    document.getElementById('accordionWer')?.remove();
  }

  // ── Animate in (trigger after paint)
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.getElementById('wofCard')?.classList.add('is-visible');
      document.getElementById('wofBannerWrap')?.classList.add('is-visible');
      document.getElementById('wofAccordion')?.classList.add('is-visible');
    }, 80);
  });
}

/* ── Main ────────────────────────────── */
async function init() {
  const params = new URLSearchParams(window.location.search);
  const nr = parseInt(params.get('id') ?? '1', 10);

  await loadData();

  const eintrag = getEintrag(nr);
  if (!eintrag) {
    document.body.innerHTML = '<p style="color:#fff;padding:40px;text-align:center">Eintrag nicht gefunden.</p>';
    return;
  }

  render(eintrag);
  setupNav(nr);
  setupAccordion();
}

document.addEventListener('DOMContentLoaded', init);
