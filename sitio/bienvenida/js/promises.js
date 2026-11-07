// Sección 05 · Cinco sobres con promesas de la Palabra; cada uno abre referencia, texto, contexto y reflexión
import { $, crear } from './utils.js';
import { PROMESAS, VERSICULOS } from '../data/verses.js';
import { generarTarjeta, descargar, compartir } from './share-card.js';

export function iniciarPromesas() {
  const cofre = $('#cofre'), modal = $('#modal-promesa'), estado = $('#promesa-estado');
  let actual = null, origen = null;

  PROMESAS.forEach((p, i) => {
    const b = crear('button', { clase: 'promesa-sobre aparecer', type: 'button', 'data-retraso': String(i % 4), 'aria-haspopup': 'dialog' },
      crear('span', { texto: p.referencia }), crear('strong', { texto: p.categoria }));
    b.addEventListener('click', () => abrir(p, b));
    cofre.append(b);
  });

  function abrir(p, boton) {
    actual = p; origen = boton;
    const v = VERSICULOS[p.referencia];
    $('#promesa-categoria').textContent = p.categoria;
    $('#promesa-titulo').textContent = p.referencia;
    $('#promesa-texto').replaceChildren(v.texto, crear('cite', {}, crear('a', { href: v.enlace, target: '_blank', rel: 'noopener', texto: 'Leer el pasaje completo · RVR1960 ↗' })));
    $('#promesa-contexto').textContent = p.contexto;
    $('#promesa-reflexion').textContent = p.reflexion;
    estado.textContent = '';
    modal.showModal();
  }

  modal.addEventListener('close', () => origen?.focus());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
  $('[data-cerrar-modal]', modal).addEventListener('click', () => modal.close());

  $('#promesa-copiar').addEventListener('click', async () => {
    const v = VERSICULOS[actual.referencia];
    const texto = `«${v.texto}» — ${actual.referencia} (RVR1960)`;
    try { await navigator.clipboard.writeText(texto); estado.textContent = 'Versículo copiado.'; }
    catch { estado.textContent = texto; }
  });

  $('#promesa-compartir').addEventListener('click', async (e) => {
    const b = e.currentTarget; b.disabled = true; estado.textContent = 'Preparando tu tarjeta…';
    try {
      const v = VERSICULOS[actual.referencia];
      const blob = await generarTarjeta({ titulo: actual.categoria, texto: v.texto, referencia: `${actual.referencia} · RVR1960`, cierre: ['Herederas del Reino'] });
      const nombre = `promesa-${actual.referencia.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.png`;
      const ok = await compartir(blob, nombre, `${actual.referencia} — Herederas del Reino`);
      if (!ok) { descargar(blob, nombre); estado.textContent = 'Tu tarjeta se descargó. Puedes compartirla desde tus fotos.'; }
      else estado.textContent = '';
    } catch { estado.textContent = 'No pudimos crear la tarjeta en este momento.'; }
    b.disabled = false;
  });
}
