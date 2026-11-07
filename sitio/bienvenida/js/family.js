// Sección 07 · Ministerio, pastora, encuentros y recursos (datos desde data/config.js)
import { $, crear } from './utils.js';
import { CONFIG } from '../data/config.js';

export function iniciarFamilia() {
  const lista = $('#encuentros-lista');
  CONFIG.encuentros.forEach((e) => lista.append(crear('li', {}, crear('strong', { texto: e.nombre }), crear('span', { texto: `${e.cuando} · ${e.detalle}` }))));
  $('#encuentros-zona').textContent = CONFIG.zonaHoraria;
  if (CONFIG.zoom) { const b = $('#participar'); b.href = CONFIG.zoom; b.hidden = false; }

  // La pastora: solo información confirmada. El mensaje aparece cuando ella lo apruebe.
  $('#pastora-nombre').textContent = CONFIG.pastora.nombre;
  const msg = $('#pastora-mensaje');
  if (CONFIG.pastora.mensaje) msg.textContent = CONFIG.pastora.mensaje;
  else { msg.textContent = 'Muy pronto compartiremos aquí su mensaje de bienvenida.'; msg.classList.add('pastora__pendiente'); }
}
