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

/* ── Reveal solution ─────────────────── */
function revealSolution() {
  const titleEl = document.getElementById('wofFilmtitel');
  const metaEl  = document.getElementById('wofMeta');
  if (!titleEl || !titleEl.dataset.actual) return; // already revealed

  // Reveal film title
  const actual = titleEl.dataset.actual;
  delete titleEl.dataset.actual;
  titleEl.textContent = actual;
  titleEl.classList.remove('is-solution-hidden');
  titleEl.classList.add('is-solution-revealed');

  // Reveal meta
  if (metaEl && metaEl.dataset.actual) {
    metaEl.innerHTML = metaEl.dataset.actual;
    delete metaEl.dataset.actual;
    metaEl.classList.remove('is-solution-hidden');
    metaEl.classList.add('is-solution-revealed');
  }

  // Flash the card
  const card = document.getElementById('wofCard');
  if (card) {
    card.classList.add('is-revealing');
    card.addEventListener('animationend', () => card.classList.remove('is-revealing'), { once: true });
  }

  // Open the accordion and update its label
  const teaserBtn = document.querySelector('#accordionTeaser .accordion-trigger');
  const teaserBody = document.getElementById('teaserBody');
  if (teaserBtn) {
    teaserBtn.querySelector('span:first-child').textContent = 'Filmplakat';
    if (teaserBtn.getAttribute('aria-expanded') !== 'true') {
      teaserBtn.setAttribute('aria-expanded', 'true');
      teaserBody?.classList.add('is-open');
    }
  }
}

/* ── Swipe navigation (mobile) ──────── */
function setupSwipe(currentNr) {
  let startX = 0;
  let startY = 0;

  document.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) {
      const next = getNext(currentNr);
      if (next) navigateTo(next.nr);
    } else {
      const prev = getPrev(currentNr);
      if (prev) navigateTo(prev.nr);
    }
  }, { passive: true });
}

/* ── Accordion ───────────────────────── */
function setupAccordion() {
  document.querySelectorAll('.accordion-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const body = btn.nextElementSibling;
      if (body) body.classList.toggle('is-open', !expanded);

      if (!expanded && btn.closest('#accordionTeaser')) {
        revealSolution();
      }
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

  // ── Info panel (hidden until solution is revealed)
  const titleEl = document.getElementById('wofFilmtitel');
  const metaEl  = document.getElementById('wofMeta');
  if (titleEl) {
    titleEl.dataset.actual = eintrag.filmtitel;
    titleEl.innerHTML = `
      <button class="reveal-cta" id="revealBtn" aria-label="Film enthüllen">
        <span class="reveal-cta-icon">✦</span>
        <span class="reveal-cta-text">Film enthüllen</span>
      </button>`;
  }
  if (metaEl) {
    metaEl.dataset.actual =
      `<span class="star-icon">★</span>${eintrag.typ} · ${eintrag.jahre}<span class="star-icon">★</span>`;
    metaEl.classList.add('is-solution-hidden');
  }
  document.getElementById('revealBtn')?.addEventListener('click', revealSolution);

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

  // ── Animate in: Banner → Karte → Accordion
  requestAnimationFrame(() => {
    setTimeout(() => document.getElementById('wofBannerWrap')?.classList.add('is-visible'),   80);
    setTimeout(() => document.getElementById('wofCard')?.classList.add('is-visible'),        800);
    setTimeout(() => document.getElementById('wofAccordion')?.classList.add('is-visible'),  1700);
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
  setupSwipe(nr);
}

document.addEventListener('DOMContentLoaded', init);
