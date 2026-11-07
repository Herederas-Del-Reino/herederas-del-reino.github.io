// Punto de entrada del portal «Bienvenida a casa, Heredera»
import { $, $$, crear } from './utils.js';
import { CONFIG } from '../data/config.js';
import { VERSICULOS, AVISO_RVR } from '../data/verses.js';
import { iniciarNavegacion } from './navigation.js';
import { iniciarApariciones, iniciarMariposas, iniciarPuerta } from './animations.js';
import { iniciarCarta } from './welcome-letter.js';
import { iniciarIdentidad } from './identity.js';
import { iniciarEstudio } from './bible-study.js';
import { iniciarPromesas } from './promises.js';
import { iniciarOracion } from './prayer.js';
import { iniciarFamilia } from './family.js';
import { iniciarFinal } from './final.js';
import { iniciarMusica } from './music.js';

// Versículos declarados en el HTML con data-versiculo
$$('[data-versiculo]').forEach((el) => {
  const ref = el.dataset.versiculo, v = VERSICULOS[ref];
  if (!v) return;
  el.classList.add('biblia');
  el.replaceChildren(`«${v.texto}»`, crear('cite', {}, crear('a', { href: v.enlace, target: '_blank', rel: 'noopener', texto: `${ref} · RVR1960 ↗` })));
});
$('#aviso-biblia').textContent = `Textos bíblicos: ${AVISO_RVR}`;

// Enlaces configurables
const enlaces = {
  sitio: CONFIG.sitioPrincipal,
  sitioMuro: `${CONFIG.sitioPrincipal}#muro`,
  sitioLibros: `${CONFIG.sitioPrincipal}#libros`,
  instagram: CONFIG.instagram,
  youtube: CONFIG.youtube,
};
$$('[data-enlace]').forEach((a) => { a.href = enlaces[a.dataset.enlace] || CONFIG.sitioPrincipal; });

iniciarCarta();
iniciarIdentidad();
iniciarEstudio();
iniciarPromesas();
iniciarOracion();
iniciarFamilia();
iniciarFinal();
iniciarNavegacion();
iniciarPuerta();
iniciarMariposas();
iniciarMusica();
iniciarApariciones();
