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
      dias: "Viernes", diasSemana: [5],
      hora: "20:00",
      icono: "corona"
    }
  ],
  zonaHorariaBase: "America/Bogota",

  /* ---------- Nuestros libros ----------
     Para agregar un libro: copia un bloque, cambia los datos y pon la portada
     en assets/img/libros/ (ideal: 600 px de ancho o más, formato .webp o .jpg).
     Usa solo información confirmada del libro. */
  libros: [
    {
      tipo: "Libro",
      titulo: "Transformada por su Voz",
      subtitulo: "Del Quebranto al Propósito",
      autora: "Jennyfer Vásquez de Amarales",
      descripcion: "De la pastora Jennyfer Vásquez de Amarales: un camino del quebranto al propósito.",
      portada: "assets/img/libros/transformada-por-su-voz.webp",
      ancho: 440, alto: 654,
      enlace: "https://amzn.eu/d/0ehcYWz3",
      boton: "Conócelo en Amazon"
    },
    {
      tipo: "Cuaderno de notas",
      titulo: "Perlas de Sabiduría",
      subtitulo: "Mi Cuaderno de Notas",
      autora: "",
      descripcion: "“Porque Jehová da la sabiduría, y de su boca viene el conocimiento y la inteligencia.” — Proverbios 2:6",
      portada: "assets/img/libros/perlas-de-sabiduria.webp",
      ancho: 455, alto: 647,
      enlace: "https://amzn.eu/d/01rzXo8T",
      boton: "Conócelo en Amazon"
    }
  ],

  /* ---------- Testimonios ----------
     Publica SOLO testimonios con autorización expresa de la persona.
     Ejemplo: { nombre: "Ana M.", pais: "Colombia", texto: "…" }  */
  testimonios: [],

  /* ---------- Pregúntale a la Pastora ----------
     El formulario es un Google Form incrustado en consejeria/index.html.
     Estos datos completan el aviso de privacidad (consejeria/privacidad/).
     Mientras estén vacíos, el aviso se muestra como borrador. */
  consejeria: {
    /* El formulario de la página es propio, pero cada respuesta llega al
       Google Form del ministerio (y a su hoja). Estos códigos son los de cada
       pregunta del Google Form: si se borra o se cambia una pregunta allí,
       hay que actualizarlos aquí (guía: docs/preguntale-a-la-pastora.md). */
    googleForm: {
      envio: "https://docs.google.com/forms/d/e/1FAIpQLSd5wpfnfChXNsFDs8vdb8wkiEpupyosBLXOxADdqyDX2Hc7Sg/formResponse",
      editar: "https://docs.google.com/forms/d/1D1aD-RWy8OBPXG3_QddlYtJX8g8kBIqO20ASgTsi0pw/edit",
      campos: {
        identidad: "entry.247459331",   // ¿Cómo deseas compartir tu inquietud?
        nombre: "entry.1723979380",     // ¿Cómo te llamas?
        tema: "entry.182868789",        // ¿Sobre qué tema necesitas orientación?
        consulta: "entry.153933767",    // Hija del Rey, ¿qué hay en tu corazón?
        correo: "entry.954892756"       // Déjanos tu correo electrónico
      },
      // Deben coincidir EXACTAMENTE con las opciones del Google Form (incluidos los emojis)
      opcionesIdentidad: {
        anonima: "Prefiero permanecer en el anonimato 🤍",
        nombre: "Deseo compartir mi nombre 🌷"
      }
    },
    maxCaracteres: 3000,

    responsable: "Herederas del Reino, ministerio liderado por la pastora Jennyfer Vásquez de Amarales",
    correoPrivacidad: "",            // correo para ejercer derechos; mientras esté vacío se usa el Instagram oficial
    conservacion: "Conservamos tu consulta hasta 12 meses después de que sea respondida o cerrada",
    actualizado: "6 de noviembre de 2026",
    avisoAprobado: true              // false vuelve a mostrar el aviso como borrador
  },

  /* ---------- La Pastora responde ----------
     Solo videos YA publicados en las redes oficiales de la pastora.
     La galería permanece oculta mientras esta lista esté vacía.
     Ejemplo:
     { titulo: "¿Cómo perdonar cuando duele?", categoria: "Perdón y restauración",
       red: "Instagram", url: "https://www.instagram.com/reel/…",
       miniatura: "assets/img/ensenanzas/perdon.webp" }   ← vertical 9:16, opcional */
  ensenanzas: []
};
