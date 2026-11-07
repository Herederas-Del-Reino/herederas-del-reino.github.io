// Movimiento: aparición progresiva, mariposas reales y entrada por la puerta
import { $, $$, movimientoReducido, esperar, irA } from './utils.js';

export function iniciarApariciones(raiz = document) {
  if (movimientoReducido() || !('IntersectionObserver' in window)) {
    $$('.aparecer', raiz).forEach((el) => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  $$('.aparecer:not(.visible)', raiz).forEach((el) => obs.observe(el));
}

const IMAGENES = ['assets/images/mariposa-1.webp', 'assets/images/mariposa-2.webp', 'assets/images/mariposa-3.webp'];

/** Mariposas con vuelo orgánico; se pausan fuera de pantalla para cuidar la batería. */
export function iniciarMariposas() {
  if (movimientoReducido()) return;
  $$('[data-mariposas]').forEach((cont) => {
    const n = parseInt(cont.dataset.mariposas, 10) || 2;
    const bichos = Array.from({ length: n }, (_, i) => {
      const el = document.createElement('div');
      el.className = 'mariposa';
      const tam = 38 + Math.random() * 34;   // mismo rango que el sitio principal
      el.style.setProperty('--tam', `${tam}px`);
      el.style.setProperty('--aleteo', `${(0.32 + Math.random() * 0.2).toFixed(2)}s`);
      const img = new Image(); img.src = IMAGENES[i % IMAGENES.length]; img.alt = ''; img.decoding = 'async';
      el.append(img); cont.append(el);
      return { el, tam, x: Math.random(), y: 0.15 + Math.random() * 0.5, ang: Math.random() * 6.28, vel: 0.00035 + Math.random() * 0.0003, fase: Math.random() * 50 };
    });
    let visible = false, anterior = 0;
    const paso = (t) => {
      if (!visible || document.hidden) return;
      const dt = Math.min(48, t - (anterior || t)); anterior = t;
      const w = cont.clientWidth, h = cont.clientHeight;
      bichos.forEach((b) => {
        b.fase += dt * 0.001;
        b.ang += Math.sin(b.fase * 1.2) * 0.012 + (Math.random() - 0.5) * 0.018;
        const cx = 0.5 - b.x, cy = 0.4 - b.y;
        if (Math.hypot(cx, cy) > 0.42) b.ang += (Math.atan2(cy, cx) - b.ang) * 0.03;
        b.x += Math.cos(b.ang) * b.vel * dt;
        b.y += Math.sin(b.ang) * b.vel * dt * 0.7 + Math.sin(b.fase * 4) * 0.0003;
        const giro = Math.cos(b.ang) < 0 ? -1 : 1;
        b.el.style.transform = `translate3d(${(b.x * w - b.tam / 2).toFixed(1)}px, ${(b.y * h).toFixed(1)}px, 0) scaleX(${giro}) rotate(${(Math.sin(b.fase * 2) * 8).toFixed(1)}deg)`;
      });
      requestAnimationFrame(paso);
    };
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) { anterior = 0; requestAnimationFrame(paso); } }).observe(cont);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) { anterior = 0; requestAnimationFrame(paso); } });
  });
}

/** Entrada cinematográfica breve y apertura de la puerta al comenzar el recorrido. */
export function iniciarPuerta() {
  const puerta = $('#puerta'), velo = $('#velo'), boton = $('#comenzar');
  requestAnimationFrame(() => puerta.classList.add('cargada'));
  boton.addEventListener('click', async () => {
    if (movimientoReducido()) { irA('carta'); return; }
    boton.disabled = true;
    puerta.classList.add('entrando');
    velo.classList.add('activo');
    await esperar(1100);                 // la luz cubre la pantalla…
    irA('carta');                        // …y la visitante ya está frente a su carta
    await esperar(1400);
    velo.classList.remove('activo');
    puerta.classList.remove('entrando');
    boton.disabled = false;
  });
}
