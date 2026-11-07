// Sección 06 · Oración guiada línea por línea; narración solo si existe una grabación autorizada
import { $, $$, crear, icono, movimientoReducido } from './utils.js';
import { CONFIG } from '../data/config.js';

export function iniciarOracion() {
  const seccion = $('#oracion'), boton = $('#orar-conmigo'), lineas = $$('#oracion-lineas p');
  let temporizador = null, indice = -1;

  const etiqueta = (texto, id) => boton.replaceChildren(icono(id), ' ', crear('span', { texto }));

  function detener(final = false) {
    clearTimeout(temporizador); temporizador = null; indice = -1;
    seccion.classList.remove('guiando');
    lineas.forEach((p) => p.classList.remove('actual', 'leida'));
    boton.setAttribute('aria-pressed', 'false');
    etiqueta(final ? 'Orar de nuevo' : 'Orar conmigo, paso a paso', 'i-play');
  }

  function avanzar() {
    if (indice >= 0) { lineas[indice].classList.remove('actual'); lineas[indice].classList.add('leida'); }
    indice++;
    if (indice >= lineas.length) { detener(true); return; }
    lineas[indice].classList.add('actual');
    // Tiempo de lectura pausado y reverente: ~ 0,45 s por palabra, mínimo 3 s
    const palabras = lineas[indice].textContent.split(/\s+/).length;
    temporizador = setTimeout(avanzar, Math.max(3000, palabras * 450));
  }

  boton.addEventListener('click', () => {
    if (temporizador) { detener(); return; }
    seccion.classList.add('guiando');
    boton.setAttribute('aria-pressed', 'true');
    etiqueta('Detener', 'i-pausa');
    indice = -1; avanzar();
    if (!movimientoReducido()) lineas[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Narración autorizada (opcional)
  if (CONFIG.narracionOracion) {
    const cont = $('#oracion-audio');
    cont.append(crear('p', { clase: 'bloque-titulo', texto: 'Escuchar la oración' }),
      crear('audio', { controls: true, preload: 'none', src: CONFIG.narracionOracion }));
    cont.hidden = false;
  }
}
