// Sección 04 · Lector bíblico de tres lecciones con progreso (no guarda respuestas personales)
import { $, crear, icono, irA, movimientoReducido } from './utils.js';
import { ESTUDIO } from '../data/lessons.js';
import { VERSICULOS } from '../data/verses.js';

export function iniciarEstudio() {
  const pasos = $('#lector-pasos'), cuerpo = $('#lector-cuerpo'), contador = $('#lector-contador');
  const anterior = $('#lector-anterior'), siguiente = $('#lector-siguiente'), navegacion = $('#lector-navegacion');
  const total = ESTUDIO.lecciones.length;
  const leidas = new Set();
  let actual = 0, terminado = false;

  const botonesPaso = ESTUDIO.lecciones.map((l, i) => {
    const b = crear('button', { type: 'button', 'aria-label': `Lección ${i + 1}: ${l.titulo}` },
      crear('small', { texto: `Lección ${i + 1}` }), crear('span', { texto: l.titulo }));
    b.addEventListener('click', () => mostrar(i, true));
    pasos.append(crear('li', {}, b));
    return b;
  });

  const bloque = (titulo, ...contenido) => crear('section', { clase: 'leccion__bloque' }, crear('h4', { clase: 'bloque-titulo', texto: titulo }), ...contenido);
  const parrafos = (lista) => lista.map((t) => crear('p', { texto: t }));

  function mostrar(i, enfocar = false) {
    terminado = false;
    actual = i; leidas.add(i);
    const l = ESTUDIO.lecciones[i], v = VERSICULOS[l.lectura];
    cuerpo.replaceChildren(crear('article', { clase: 'leccion' },
      crear('span', { clase: 'leccion__numero', texto: `Lección ${i + 1} de ${total}` }),
      crear('h3', { texto: l.titulo }),
      bloque('Lectura bíblica', crear('blockquote', { clase: 'biblia leccion__lectura', style: 'margin:0' }, v.texto,
        crear('cite', {}, crear('a', { href: v.enlace, target: '_blank', rel: 'noopener', texto: `${l.lectura} · Leer el pasaje completo ↗` })))),
      bloque('Contexto del pasaje', ...parrafos(l.contexto)),
      bloque('Enseñanza', ...parrafos(l.ensenanza)),
      bloque('Aplicación a la vida cotidiana', ...parrafos(l.aplicacion)),
      bloque('Pregunta de reflexión', crear('p', { clase: 'leccion__pregunta' }, l.pregunta,
        crear('small', { texto: 'Medita en ella o escríbela en tu diario personal. Aquí no se guarda ninguna respuesta.' }))),
      bloque('Oración final', crear('p', { clase: 'leccion__oracion', texto: l.oracion }))));
    animar();
    botonesPaso.forEach((b, j) => {
      b.toggleAttribute('aria-current', j === i);
      if (j === i) b.setAttribute('aria-current', 'step');
      b.classList.toggle('leida', leidas.has(j) && j !== i);
    });
    contador.textContent = `${i + 1} / ${total}`;
    anterior.disabled = i === 0;
    siguiente.replaceChildren(i === total - 1 ? 'Terminar el estudio ' : 'Siguiente ', icono('i-flecha'));
    navegacion.hidden = false;
    if (enfocar) { cuerpo.focus({ preventScroll: true }); $('#lector').scrollIntoView({ behavior: movimientoReducido() ? 'auto' : 'smooth', block: 'start' }); }
  }

  function finalizar() {
    terminado = true;
    botonesPaso.forEach((b) => { b.removeAttribute('aria-current'); b.classList.add('leida'); });
    const seguir = crear('a', { clase: 'boton', href: '#promesas' }, 'Continuar hacia las promesas ', icono('i-flecha'));
    cuerpo.replaceChildren(crear('div', { clase: 'lector__final' },
      crear('img', { src: 'assets/images/hr-insignia.webp', alt: '', width: '64', height: '58' }),
      crear('h3', { texto: 'Has terminado tu primer estudio bíblico.' }),
      crear('p', { texto: 'Que la Palabra de Dios continúe iluminando tu caminar.' }),
      crear('div', { clase: 'botones' }, crear('button', { clase: 'boton boton--texto', type: 'button', id: 'repasar' }, 'Repasar las lecciones'), seguir)));
    $('#repasar').addEventListener('click', () => mostrar(0, true));
    navegacion.hidden = true;
    animar();
    cuerpo.focus({ preventScroll: true });
  }

  function animar() { cuerpo.classList.remove('entrando'); void cuerpo.offsetWidth; cuerpo.classList.add('entrando'); }

  anterior.addEventListener('click', () => { if (actual > 0) mostrar(actual - 1, true); });
  siguiente.addEventListener('click', () => { if (actual < total - 1) mostrar(actual + 1, true); else finalizar(); });
  mostrar(0);
  return { irAPromesas: () => irA('promesas'), get terminado() { return terminado; } };
}
