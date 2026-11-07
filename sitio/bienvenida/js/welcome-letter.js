// Sección 02 · El sobre se abre y la carta se despliega; permanece abierta hasta que la visitante decida cerrarla
import { $ } from './utils.js';

export function iniciarCarta() {
  const seccion = $('#carta'), sobre = $('#sobre'), carta = $('#carta-papel'), cerrar = $('#cerrar-carta');

  const abrir = () => {
    seccion.classList.add('abierta');
    sobre.setAttribute('aria-expanded', 'true');
    carta.hidden = false;
    carta.classList.remove('desplegando'); void carta.offsetWidth; carta.classList.add('desplegando');
    carta.focus({ preventScroll: true });
    carta.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  };
  const guardar = () => {
    seccion.classList.remove('abierta');
    sobre.setAttribute('aria-expanded', 'false');
    carta.hidden = true;
    sobre.focus();
  };

  sobre.addEventListener('click', abrir);           // botón nativo: funciona con clic, Enter y Espacio
  cerrar.addEventListener('click', guardar);
  carta.addEventListener('keydown', (e) => { if (e.key === 'Escape') guardar(); });
}
