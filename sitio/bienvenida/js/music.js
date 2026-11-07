// Música instrumental opcional: sin reproducción automática; oculta si no hay archivo autorizado
import { $, icono } from './utils.js';
import { CONFIG } from '../data/config.js';

export function iniciarMusica() {
  if (!CONFIG.musica) return;                       // sin audio autorizado, el reproductor no aparece
  const caja = $('#musica'), boton = $('#musica-boton'), audio = $('#musica-audio'), vol = $('#musica-volumen');
  audio.src = CONFIG.musica; audio.volume = parseFloat(vol.value);
  caja.hidden = false;
  let subida = null;
  boton.addEventListener('click', async () => {
    if (audio.paused) {
      audio.volume = 0;
      try { await audio.play(); } catch { return; }
      const meta = parseFloat(vol.value);
      clearInterval(subida);
      subida = setInterval(() => { audio.volume = Math.min(meta, audio.volume + 0.02); if (audio.volume >= meta) clearInterval(subida); }, 80);
      boton.setAttribute('aria-pressed', 'true'); boton.setAttribute('aria-label', 'Pausar la música');
      boton.replaceChildren(icono('i-pausa')); vol.hidden = false;
    } else {
      clearInterval(subida);
      const bajada = setInterval(() => { audio.volume = Math.max(0, audio.volume - 0.03); if (audio.volume <= 0) { clearInterval(bajada); audio.pause(); } }, 60);
      boton.setAttribute('aria-pressed', 'false'); boton.setAttribute('aria-label', 'Reproducir música instrumental');
      boton.replaceChildren(icono('i-nota')); vol.hidden = true;
    }
  });
  vol.addEventListener('input', () => { audio.volume = parseFloat(vol.value); });
}
