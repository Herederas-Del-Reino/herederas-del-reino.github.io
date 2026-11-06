/* =====================================================================
   PREGÚNTALE A LA PASTORA — interacciones de la página de consejería
   El formulario es un Google Form incrustado (consejeria/index.html).
   Este archivo solo maneja menú, apariciones, mariposas y la galería.
   ===================================================================== */
(function () {
  'use strict';
  const C = window.HR_CONFIG || {};
  const CJ = C.consejeria || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (t) => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  $('#anio').textContent = new Date().getFullYear();

  /* ---------- Navegación ---------- */
  const nav = $('#nav'), botonMenu = $('#nav-menu');
  botonMenu.addEventListener('click', () => {
    const abierta = nav.classList.toggle('abierta');
    botonMenu.setAttribute('aria-expanded', abierta);
    botonMenu.setAttribute('aria-label', abierta ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('#nav-enlaces a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('abierta'); botonMenu.setAttribute('aria-expanded', 'false'); }));
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('abierta')) botonMenu.click(); });

  /* ---------- Revelado suave ---------- */
  if (movimientoReducido || !('IntersectionObserver' in window)) {
    $$('.revelar').forEach(el => el.classList.add('visible'));
  } else {
    const revelador = new IntersectionObserver(entradas => {
      entradas.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); revelador.unobserve(en.target); } });
    }, { threshold: .1, rootMargin: '0px 0px -30px 0px' });
    $$('.revelar').forEach(el => revelador.observe(el));
  }

  /* ---------- Mariposas (mismas imágenes y vuelo del sitio principal) ---------- */
  if (!movimientoReducido) {
    const IMG = ['../assets/img/mariposa-1.webp', '../assets/img/mariposa-2.webp', '../assets/img/mariposa-3.webp'];
    $$('[data-mariposas]').forEach(cont => {
      const n = parseInt(cont.dataset.mariposas, 10) || 2;
      const bichos = Array.from({ length: n }, (_, i) => {
        const el = document.createElement('div'); el.className = 'mariposa';
        const tam = 38 + Math.random() * 34; el.style.setProperty('--tam', tam + 'px');
        el.style.setProperty('--aleteo', (0.34 + Math.random() * 0.18).toFixed(2) + 's');
        const img = new Image(); img.src = IMG[i % IMG.length]; img.alt = ''; el.append(img); cont.append(el);
        return { el, tam, x: Math.random(), y: .15 + Math.random() * .55, ang: Math.random() * 6.28, vel: .00038 + Math.random() * .0003, fase: Math.random() * 50 };
      });
      let visible = false, anterior = 0;
      const paso = (t) => {
        if (!visible || document.hidden) return;
        const dt = Math.min(48, t - (anterior || t)); anterior = t;
        const w = cont.clientWidth, h = cont.clientHeight;
        bichos.forEach(b => {
          b.fase += dt * .001;
          b.ang += Math.sin(b.fase * 1.2) * .012 + (Math.random() - .5) * .018;
          const cx = .5 - b.x, cy = .4 - b.y;
          if (Math.hypot(cx, cy) > .42) b.ang += (Math.atan2(cy, cx) - b.ang) * .03;
          b.x += Math.cos(b.ang) * b.vel * dt; b.y += Math.sin(b.ang) * b.vel * dt * .7;
          const giro = Math.cos(b.ang) < 0 ? -1 : 1;
          b.el.style.transform = `translate3d(${(b.x * w - b.tam / 2).toFixed(1)}px, ${(b.y * h).toFixed(1)}px, 0) scaleX(${giro}) rotate(${(Math.sin(b.fase * 2) * 8).toFixed(1)}deg)`;
        });
        requestAnimationFrame(paso);
      };
      new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) { anterior = 0; requestAnimationFrame(paso); } }).observe(cont);
    });
  }

  /* ---------- La Pastora responde ---------- */
  const ensenanzas = (Array.isArray(C.ensenanzas) ? C.ensenanzas : []).filter(v => v && v.titulo && /^https:\/\//.test(v.url || ''));
  if (ensenanzas.length) {
    $('#lista-ensenanzas').innerHTML = ensenanzas.map(v => `
      <li class="cj-video vidrio revelar visible">
        <div class="cj-video__miniatura">
          ${v.miniatura ? `<img src="../${esc(v.miniatura)}" alt="" loading="lazy" width="360" height="640">` : ''}
          <svg aria-hidden="true"><use href="#i-video"/></svg>
          ${v.red ? `<span class="cj-video__red">${esc(v.red)}</span>` : ''}
        </div>
        <div class="cj-video__cuerpo">
          ${v.categoria ? `<span class="cj-video__categoria">${esc(v.categoria)}</span>` : ''}
          <h3>${esc(v.titulo)}</h3>
          <a class="boton boton--claro" href="${esc(v.url)}" target="_blank" rel="noopener">Ver enseñanza<span class="sr"> (se abre en ${esc(v.red || 'una nueva pestaña')})</span></a>
        </div>
      </li>`).join('');
    $('#respuestas').hidden = false;
  }
})();
