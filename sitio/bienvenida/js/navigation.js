// Navegación del recorrido: barra con progreso, índice, puntos laterales y momento actual
import { $, $$, crear, irA } from './utils.js';

export function iniciarNavegacion() {
  const momentos = $$('main > .momento');
  const barra = $('#barra'), actual = $('#barra-actual'), progreso = $('#progreso');
  const indice = $('#indice'), listaIndice = $('#indice-lista'), puntos = $('#puntos');

  // Construye el índice y los puntos a partir de las secciones
  momentos.forEach((m, i) => {
    const nombre = m.dataset.nombre;
    listaIndice.append(crear('li', {}, crear('a', { href: `#${m.id}`, 'data-momento': m.id, texto: nombre })));
    puntos.append(crear('li', {}, crear('a', { href: `#${m.id}`, 'data-momento': m.id, 'aria-label': `${String(i + 1).padStart(2, '0')}. ${nombre}` },
      crear('span', { 'aria-hidden': 'true', texto: nombre }))));
  });

  // Enlaces internos con desplazamiento suave y foco accesible
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id || !document.getElementById(id)) return;
    e.preventDefault();
    if (indice.open) indice.close();
    irA(id);
    history.replaceState(null, '', `#${id}`);
  });

  $('#abrir-indice').addEventListener('click', () => indice.showModal());
  $('[data-cerrar-indice]').addEventListener('click', () => indice.close());
  indice.addEventListener('click', (e) => { if (e.target === indice) indice.close(); });

  // Momento actual
  const marcar = (id) => {
    $$('[data-momento]').forEach((a) => a.toggleAttribute('aria-current', a.dataset.momento === id));
    $$('[data-momento]').forEach((a) => { if (a.dataset.momento === id) a.setAttribute('aria-current', 'true'); });
    const m = document.getElementById(id);
    if (m) actual.textContent = m.dataset.nombre;
  };
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => { if (en.isIntersecting) marcar(en.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  momentos.forEach((m) => observador.observe(m));

  // Barra visible al salir de la portada + progreso de lectura
  let pendiente = false;
  const actualizar = () => {
    pendiente = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    progreso.firstElementChild.style.transform = `scaleX(${p})`;
    progreso.setAttribute('aria-valuenow', Math.round(p * 100));
    barra.classList.toggle('solida', scrollY > 24);
  };
  addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } }, { passive: true });
  addEventListener('resize', actualizar, { passive: true });
  actualizar();
}
