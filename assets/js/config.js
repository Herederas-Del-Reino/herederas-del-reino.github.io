/* =====================================================================
   HEREDERAS DEL REINO — Configuración central del sitio
   Cambia aquí los enlaces y datos; el sitio y el muro de oración
   los leen desde este único archivo.
   ===================================================================== */
window.HR_CONFIG = {

  /* ---------- Canales oficiales ---------- */
  instagram: {
    usuario: "herederasdelreino.oficial",
    url: "https://www.instagram.com/herederasdelreino.oficial/"
  },
  youtube: {
    nombre: "Pastora Jennyfer de Amarales",
    url: "https://youtube.com/@pastorajennyferdeamarales"
  },
  zoom: {
    id: "817 0376 4228",
    // Enlace directo de la reunión (incluye la contraseña, así entran con un solo clic).
    url: "https://us06web.zoom.us/j/81703764228?pwd=gxlIYXBBEyshMWWFtRuOfMq1eVA2za.1"
  },
  // Número de WhatsApp con indicativo y sin espacios ni "+", p. ej. "573001234567".
  // Mientras esté vacío, el botón de WhatsApp no se muestra.
  whatsapp: "",

  /* ---------- Formulario y hoja de oración ---------- */
  formularioOracion: "https://docs.google.com/forms/d/1RDzBU8FyOKMrvH_dZsYgSBcgDusPadXHiQlIaFUqkN4/viewform",

  // CSV publicado SOLO de la pestaña "Muro" (fecha y nombre; nunca la hoja completa).
  hojaPeticionesCSV: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTTJYyIXGyDc7Qcjbj4Q9naSF3Yp-y1C02NDhqHwZnZYFYTs8ygxMsJksseB3vFQnLJyzAMVguyMyPi/pub?gid=915962882&single=true&output=csv",

  // Columnas de la pestaña "Muro" (0 = primera).
  columnas: {
    fecha: 0,
    nombre: 1,
    // Columna opcional con la respuesta "¿Cómo quieres que oremos por ti?".
    // Si existe y dice "confidencial", el nombre NO se publica.
    privacidad: 2
  },

  /* ---------- Privacidad ---------- */
  privacidad: {
    soloPrimerNombre: true,          // "María Fernanda López" → "María F."
    nombreAnonimo: "Una hija del Rey",
    palabraConfidencial: "confidencial"
  },

  /* ---------- Encuentros (hora de Colombia, UTC-5) ---------- */
  encuentros: [
    {
      id: "devocional",
      titulo: "Devocional de Madrugada",
      descripcion: "Comenzamos el día en la Presencia de Dios.",
      dias: "Martes", diasSemana: [2],
      hora: "05:00",
      icono: "biblia"
    },
    {
      id: "entre-amigas",
      titulo: "Entre Amigas",
      descripcion: "Un espacio para compartir, crecer y apoyarnos.",
      dias: "Miércoles", diasSemana: [3],
      hora: "18:00",
      icono: "amigas"
    },
    {
      id: "salmos",
      titulo: "Salmos",
      descripcion: "Juntas en adoración a través de la Palabra.",
      dias: "Lunes a Viernes", diasSemana: [1, 2, 3, 4, 5],
      hora: "20:00",
      icono: "corona"
    }
  ],
  zonaHorariaBase: "America/Bogota",

  /* ---------- Testimonios ----------
     Publica SOLO testimonios con autorización expresa de la persona.
     Ejemplo: { nombre: "Ana M.", pais: "Colombia", texto: "…" }  */
  testimonios: []
};
