// Sección 08 · Tarjeta final compartible (se genera localmente)
import { $ } from './utils.js';
import { CONFIG } from '../data/config.js';
import { generarTarjeta, descargar, compartir } from './share-card.js';

const DATOS = {
  titulo: 'Bienvenida, Heredera',
  texto: 'Y si hijos, también herederos; herederos de Dios y coherederos con Cristo...',
  referencia: 'Romanos 8:17',
  cierre: ['Que tu vida siga creciendo en la gracia y el conocimiento de nuestro Señor Jesucristo.', 'Con amor,', 'Herederas del Reino.'],
};
const NOMBRE = 'bienvenida-heredera.png';

export function iniciarFinal() {
  const img = $('#tarjeta-imagen'), estado = $('#tarjeta-estado');
  const bDescargar = $('#tarjeta-descargar'), bCompartir = $('#tarjeta-compartir');
  let tarjeta = null;

  const preparar = async () => {
    if (!tarjeta) {
      tarjeta = await generarTarjeta(DATOS);
      img.src = URL.createObjectURL(tarjeta);
    }
    return tarjeta;
  };

  // Se genera cuando la sección se acerca, para no pesar al cargar la página
  new IntersectionObserver(([en], obs) => {
    if (en.isIntersecting) { obs.disconnect(); preparar().catch(() => { estado.textContent = 'No pudimos crear la tarjeta en este momento.'; }); }
  }, { rootMargin: '600px' }).observe($('#final'));

  bDescargar.addEventListener('click', async () => {
    try { descargar(await preparar(), NOMBRE); estado.textContent = 'Tu tarjeta se descargó.'; }
    catch { estado.textContent = 'No pudimos descargar la tarjeta.'; }
  });

  // Compartir con las opciones del dispositivo (si el navegador lo permite)
  const prueba = new File([new Blob()], NOMBRE, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [prueba] })) {
    bCompartir.hidden = false;
    bCompartir.addEventListener('click', async () => {
      const ok = await compartir(await preparar(), NOMBRE, 'Bienvenida a casa, Heredera — Herederas del Reino');
      if (!ok) estado.textContent = 'Tu dispositivo no permite compartir imágenes desde aquí. Descárgala y compártela desde tus fotos.';
    });
  }

  const mensaje = `Bienvenida a casa, Heredera 🤍\n«Y si hijos, también herederos; herederos de Dios y coherederos con Cristo...» Romanos 8:17\n\nUn recorrido de bienvenida de Herederas del Reino:\n${CONFIG.urlPortal}`;
  $('#tarjeta-whatsapp').href = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
}
