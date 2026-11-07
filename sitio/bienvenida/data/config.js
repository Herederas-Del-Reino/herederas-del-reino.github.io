/**
 * Configuración del portal de bienvenida.
 * Cambia aquí enlaces, encuentros y recursos de audio; no hace falta tocar el código.
 */
export const CONFIG = {
  sitioPrincipal: "https://herederas-del-reino.github.io/",
  urlPortal: "https://herederas-del-reino.github.io/bienvenida/",
  instagram: "https://www.instagram.com/herederasdelreino.oficial/",
  youtube: "https://youtube.com/@pastorajennyferdeamarales",

  // Enlace oficial de Zoom para los encuentros (vacío = el botón no se muestra)
  zoom: "https://us06web.zoom.us/j/81703764228?pwd=gxlIYXBBEyshMWWFtRuOfMq1eVA2za.1",

  // Encuentros confirmados (hora de Colombia). Cambia o agrega aquí.
  encuentros: [
    { nombre: "Devocional de Madrugada", detalle: "Comenzamos el día en la presencia de Dios.", cuando: "Martes · 5:00 a. m." },
    { nombre: "Entre Amigas", detalle: "Un espacio para compartir, crecer y apoyarnos.", cuando: "Miércoles · 6:00 p. m." },
    { nombre: "Salmos", detalle: "Juntas en adoración a través de la Palabra.", cuando: "Viernes · 8:00 p. m." },
  ],
  zonaHoraria: "Hora de Colombia",

  // Pastora: deja "mensaje" vacío hasta tener un mensaje de bienvenida aprobado por ella.
  pastora: {
    nombre: "Jennyfer Amarales",
    foto: "assets/images/pastora-foto.webp",
    logo: "assets/images/pastora-ja.webp",
    mensaje: "",
  },

  // Audio opcional. Deja vacío hasta contar con un archivo autorizado: el reproductor se oculta solo.
  // Ejemplo: musica: "assets/audio/instrumental.mp3"
  musica: "",
  musicaCredito: "",
  // Narración autorizada de la oración (sección 06). Vacío = no se muestra.
  narracionOracion: "",
};
