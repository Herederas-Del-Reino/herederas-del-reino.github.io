// Sección 03 · Tarjetas que revelan referencia, explicación y pregunta de reflexión (sin volteos bruscos)
import { $, crear, icono } from './utils.js';
import { IDENTIDAD, VERSICULOS } from '../data/verses.js';

export function iniciarIdentidad() {
  const cont = $('#verdades');
  IDENTIDAD.forEach((v, i) => {
    const id = `verdad-${i + 1}`;
    const vers = VERSICULOS[v.referencia];
    const boton = crear('button', { clase: 'boton boton--claro verdad__abrir', type: 'button', 'aria-expanded': 'false', 'aria-controls': id },
      crear('span', { texto: 'Descubrir esta verdad' }), icono('i-abajo'));

    const tarjeta = crear('article', { clase: 'verdad papel aparecer', 'data-retraso': String(i) },
      crear('div', { clase: 'verdad__cabecera' },
        crear('img', { clase: 'verdad__flor', src: v.imagen, alt: '', width: '200', height: '300', loading: 'lazy', decoding: 'async' }),
        crear('div', {},
          crear('span', { clase: 'verdad__numero', texto: `Verdad ${i + 1}` }),
          crear('h3', { texto: v.titulo }),
          crear('p', { clase: 'verdad__ref', texto: v.referencia }))),
      boton,
      crear('div', { clase: 'verdad__detalle', id, role: 'region', 'aria-label': v.titulo },
        crear('div', {},
          crear('div', { clase: 'verdad__contenido' },
            crear('div', {}, crear('p', { clase: 'bloque-titulo', texto: 'Texto bíblico' }),
              crear('blockquote', { clase: 'biblia', style: 'margin:0' }, vers.texto,
                crear('cite', {}, crear('a', { href: vers.enlace, target: '_blank', rel: 'noopener', texto: `${v.referencia} · RVR1960 ↗` })))),
            crear('div', {}, crear('p', { clase: 'bloque-titulo', texto: 'Explicación' }), crear('p', { texto: v.reflexion })),
            crear('div', {}, crear('p', { clase: 'bloque-titulo', texto: 'Para reflexionar' }), crear('p', { clase: 'verdad__pregunta', texto: v.pregunta }))))));

    boton.addEventListener('click', () => {
      const abierta = tarjeta.classList.toggle('abierta');
      boton.setAttribute('aria-expanded', String(abierta));
      boton.firstElementChild.textContent = abierta ? 'Guardar' : 'Descubrir esta verdad';
    });
    cont.append(tarjeta);
  });
}
