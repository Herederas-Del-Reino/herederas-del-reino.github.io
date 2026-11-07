/**
 * Textos bíblicos — Reina-Valera 1960.
 * Reina-Valera 1960 © Sociedades Bíblicas en América Latina, 1960.
 * Renovado © Sociedades Bíblicas Unidas, 1988. Utilizado con permiso.
 *
 * Cada versículo incluye un enlace al pasaje completo en BibleGateway (RVR1960).
 * Para cambiar o agregar un pasaje, edita este archivo: el resto del sitio se actualiza solo.
 */
const enlace = (ref) => `https://www.biblegateway.com/passage/?search=${encodeURIComponent(ref)}&version=RVR1960`;

export const VERSICULOS = {
  "Romanos 15:7": {
    texto: "Por tanto, recibíos los unos a los otros, como también Cristo nos recibió, para gloria de Dios.",
  },
  "Juan 1:12": {
    texto: "Mas a todos los que le recibieron, a los que creen en su nombre, les dio potestad de ser hechos hijos de Dios.",
  },
  "Efesios 2:10": {
    texto: "Porque somos hechura suya, creados en Cristo Jesús para buenas obras, las cuales Dios preparó de antemano para que anduviésemos en ellas.",
  },
  "Efesios 2:8-10": {
    texto: "Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios; no por obras, para que nadie se gloríe. Porque somos hechura suya, creados en Cristo Jesús para buenas obras, las cuales Dios preparó de antemano para que anduviésemos en ellas.",
  },
  "Romanos 8:17": {
    texto: "Y si hijos, también herederos; herederos de Dios y coherederos con Cristo, si es que padecemos juntamente con él, para que juntamente con él seamos glorificados.",
  },
  "Romanos 8:16-17": {
    texto: "El Espíritu mismo da testimonio a nuestro espíritu, de que somos hijos de Dios. Y si hijos, también herederos; herederos de Dios y coherederos con Cristo, si es que padecemos juntamente con él, para que juntamente con él seamos glorificados.",
  },
  "Isaías 41:10": {
    texto: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia.",
  },
  "Salmos 56:3": {
    texto: "En el día que temo, yo en ti confío.",
  },
  "Mateo 11:28": {
    texto: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.",
  },
  "Proverbios 3:5-6": {
    texto: "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.",
  },
  "Romanos 8:38-39": {
    texto: "Por lo cual estoy seguro de que ni la muerte, ni la vida, ni ángeles, ni principados, ni potestades, ni lo presente, ni lo por venir, ni lo alto, ni lo profundo, ni ninguna otra cosa creada nos podrá separar del amor de Dios, que es en Cristo Jesús Señor nuestro.",
  },
  "1 Pedro 1:3-4": {
    texto: "Bendito el Dios y Padre de nuestro Señor Jesucristo, que según su grande misericordia nos hizo renacer para una esperanza viva, por la resurrección de Jesucristo de los muertos, para una herencia incorruptible, incontaminada e inmarcesible, reservada en los cielos para vosotros.",
  },
};
for (const ref of Object.keys(VERSICULOS)) VERSICULOS[ref].enlace = enlace(ref);

export const AVISO_RVR = "Reina-Valera 1960 © Sociedades Bíblicas en América Latina, 1960. Renovado © Sociedades Bíblicas Unidas, 1988. Utilizado con permiso.";

/* ---------- Sección 03 · ¿Quién soy en Cristo? ---------- */
export const IDENTIDAD = [
  {
    titulo: "Soy hija de Dios",
    referencia: "Juan 1:12",
    reflexion: "Por medio de la fe en Jesucristo recibimos el derecho de ser hechos hijos de Dios. Nuestra identidad espiritual descansa en su gracia.",
    pregunta: "¿Qué cambia en mi día cuando recuerdo que pertenezco a Dios por la fe en Jesús?",
    imagen: "assets/images/peonia-2.webp",
  },
  {
    titulo: "Fui creada con propósito",
    referencia: "Efesios 2:10",
    reflexion: "Somos hechura de Dios, creadas en Cristo Jesús para buenas obras. Nuestra vida puede reflejar su amor mediante la obediencia y el servicio.",
    pregunta: "¿Dónde puedo servir hoy con amor, no para ganar el favor de Dios, sino porque ya lo he recibido?",
    imagen: "assets/images/anemona.webp",
  },
  {
    titulo: "Soy heredera con Cristo",
    referencia: "Romanos 8:17",
    reflexion: "Nuestra herencia en Cristo nos habla de esperanza eterna, pertenencia a Dios y participación en su gloria.",
    pregunta: "¿Cómo cambia mi manera de mirar las dificultades saber que mi esperanza final está en Cristo?",
    imagen: "assets/images/peonia-1.webp",
  },
];

/* ---------- Sección 05 · El tesoro de las promesas ---------- */
export const PROMESAS = [
  {
    categoria: "Necesito fortaleza",
    referencia: "Isaías 41:10",
    contexto: "Dios habla por medio del profeta Isaías a su pueblo Israel, que vivía con temor ante las naciones que lo rodeaban. Les recuerda que no están solos: Él es su Dios y permanece con ellos.",
    reflexion: "Este pasaje no promete que no habrá dificultades; nos recuerda quién está con nosotras en medio de ellas. Su presencia y su fidelidad son el fundamento de nuestra fortaleza.",
  },
  {
    categoria: "Siento temor",
    referencia: "Salmos 56:3",
    contexto: "Según el título del salmo, David lo escribió cuando los filisteos lo apresaron en Gat (ver 1 Samuel 21). Era un momento real de peligro, y aun así eligió confiar.",
    reflexion: "El salmista no niega que tiene miedo: dice «en el día que temo». La fe no siempre elimina el temor, pero nos enseña a llevarlo a Dios y a descansar en Él.",
  },
  {
    categoria: "Necesito descanso",
    referencia: "Mateo 11:28",
    contexto: "Jesús pronuncia esta invitación ante personas cansadas por cargas religiosas y por la vida misma. En los versículos 29 y 30 añade: «aprended de mí, que soy manso y humilde de corazón».",
    reflexion: "El descanso que Jesús ofrece es para el alma: acercarnos a Él, aprender de Él y dejar en sus manos lo que no podemos cargar solas.",
  },
  {
    categoria: "Busco dirección",
    referencia: "Proverbios 3:5-6",
    contexto: "En Proverbios, un padre instruye a su hijo en la sabiduría. Estos versículos invitan a confiar en Dios por encima de nuestro propio entendimiento.",
    reflexion: "Reconocer a Dios en todos nuestros caminos es buscar su voluntad en las decisiones grandes y pequeñas: orar, leer su Palabra y obedecer con humildad.",
  },
  {
    categoria: "Quiero recordar el amor de Dios",
    referencia: "Romanos 8:38-39",
    contexto: "Es la conclusión de Romanos 8. En los versículos anteriores Pablo menciona la tribulación, la angustia y el peligro, y afirma que «en todas estas cosas somos más que vencedores por medio de aquel que nos amó» (v. 37).",
    reflexion: "Nada de lo que vivimos —ni lo presente ni lo por venir— puede separarnos del amor de Dios que es en Cristo Jesús. Su amor no depende de nuestras circunstancias.",
  },
];
