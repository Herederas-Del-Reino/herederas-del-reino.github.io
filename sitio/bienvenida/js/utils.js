// Utilidades compartidas
export const $ = (sel, raiz = document) => raiz.querySelector(sel);
export const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
export const movimientoReducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/** Crea un elemento con atributos y texto de forma segura (sin innerHTML con datos). */
export function crear(etiqueta, atributos = {}, ...hijos) {
  const el = document.createElement(etiqueta);
  for (const [k, v] of Object.entries(atributos)) {
    if (v === false || v == null) continue;
    if (k === 'clase') el.className = v;
    else if (k === 'texto') el.textContent = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const h of hijos.flat()) if (h != null) el.append(h instanceof Node ? h : document.createTextNode(h));
  return el;
}

/** Icono del sprite SVG del documento. */
export function icono(id) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#${id}`);
  svg.append(use);
  return svg;
}

/** Desplaza suavemente hasta una sección respetando el movimiento reducido. */
export function irA(id) {
  const destino = document.getElementById(id);
  if (!destino) return;
  destino.scrollIntoView({ behavior: movimientoReducido() ? 'auto' : 'smooth', block: 'start' });
  destino.setAttribute('tabindex', '-1');
  destino.focus({ preventScroll: true });
}
