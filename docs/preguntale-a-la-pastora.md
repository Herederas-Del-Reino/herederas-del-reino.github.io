# Pregúntale a la Pastora · Guía de uso

Espacio de consejería del sitio de Herederas del Reino. Las mujeres comparten una inquietud, con su nombre o de forma anónima, mediante el **formulario de Google del ministerio**, incrustado en la página `/consejeria/`. La pastora responde a las preguntas que elija con videos en sus propias redes.

Formulario: https://docs.google.com/forms/d/1D1aD-RWy8OBPXG3_QddlYtJX8g8kBIqO20ASgTsi0pw/edit

---

## Qué hay en el sitio

| Pieza | Dónde |
|---|---|
| Tarjeta «Pregúntale a la Pastora» en el inicio | `index.html` (columna derecha; debajo del mensaje en tableta y celular) |
| Página de consejería con el formulario incrustado | `consejeria/index.html` |
| Aviso de privacidad (borrador) | `consejeria/privacidad/index.html`, datos en `assets/js/config.js` → `consejeria` |
| Galería «La Pastora responde» | `assets/js/config.js` → `ensenanzas` (oculta mientras esté vacía) |

## Recomendaciones para el formulario de Google

Estas mejoras se hacen dentro del formulario, en Google Forms (el sitio no puede cambiarlas):

1. **Marcar como obligatorias** «¿Cómo deseas compartir tu inquietud?», «¿Sobre qué tema necesitas orientación?» y «Hija del Rey, ¿qué hay en tu corazón?». Hoy ninguna lo es, así que pueden llegar respuestas vacías.
2. Cambiar «¿Sobre qué tema necesitas orientación?» de respuesta corta a **opción múltiple** con: Mi relación con Dios · Familia y matrimonio · Perdón y restauración · Mis emociones y preocupaciones · Mi propósito y llamado · Oración y vida espiritual · Otra inquietud.
3. En el correo: activar la **validación de respuesta → Texto → Dirección de correo electrónico**.
4. Agregar la pregunta **«¿Nos autorizas a compartir una versión anónima de tu pregunta en las redes sociales de la pastora?»** (Sí / No, sin respuesta predeterminada). Sin esta autorización, ninguna pregunta debe usarse en un video.
5. Agregar una **casilla obligatoria** de consentimiento: «He leído el aviso de privacidad y autorizo el tratamiento de mis datos para gestionar mi consulta», con el enlace al aviso: https://herederas-del-reino.github.io/consejeria/privacidad/
6. En **Configuración → Respuestas**: mantener desactivado «Recopilar direcciones de correo electrónico» (si se activa, las anónimas dejarían de serlo) y desactivado «Limitar a 1 respuesta» (exige iniciar sesión).
7. **Colores de la marca** (🎨 Personalizar tema): color del tema `#7A3346` (vino), fondo rosa claro, estilo de fuente «Elegante» o «Formal». Así el botón «Enviar» y la barra superior dejan el rojo de Google y combinan con el sitio.
8. Personalizar el **mensaje de confirmación** (Configuración → Presentación) con: «¡Gracias por abrir tu corazón! Hija del Rey, hemos recibido tu mensaje con mucho cariño…».

## Avisos a la pastora y a la encargada de redes

1. Agregar a ambas como **colaboradoras** del formulario (⋮ → Agregar colaboradores).
2. Cada una, en la pestaña **Respuestas → ⋮ → Recibir notificaciones por correo electrónico de nuevas respuestas**. El aviso de Google no incluye el texto de la consulta: solo un enlace al formulario.

## Revisar las consultas

**Respuestas → Ver en Hojas de cálculo** crea la hoja vinculada. Comparte esa hoja solo con las dos administradoras y no la publiques en la web. Es distinta de la hoja del Muro de oración, que sí está publicada.

Para el seguimiento, agrega a la derecha de las columnas del formulario: *Estado* (Recibida, En revisión, Seleccionada para video, Pendiente de publicación, Respondida, Cerrada), *Enlace del video*, *Plataforma*, *Fecha de publicación*, *Fecha de notificación* y *Observaciones internas*.

## Responder

- Solo se mencionan en un video las preguntas con autorización de publicación, **siempre anonimizadas**: sin nombre, correo, ciudad ni detalles que permitan reconocer a la persona.
- Si la persona dejó su correo, se le puede escribir con el enlace del video:
  > **Asunto:** Una enseñanza para tu corazón | Herederas del Reino
  > Hija del Rey, gracias por confiar en este espacio. Nuestra pastora ha compartido una enseñanza que puede ayudarte a reflexionar sobre la inquietud que nos enviaste. Puedes verla aquí: [enlace]. Que la Palabra de Dios siga siendo luz para tu camino. Con amor, Herederas del Reino.

## Agregar videos a la galería «La Pastora responde»

En `assets/js/config.js` → `ensenanzas`, agrega un bloque por video **ya publicado**:

```js
{ titulo: "¿Cómo perdonar cuando duele?", categoria: "Perdón y restauración",
  red: "Instagram", url: "https://www.instagram.com/reel/…",
  miniatura: "assets/img/ensenanzas/perdon.webp" }   // opcional, vertical 9:16
```

## Aviso de privacidad

Completa en `assets/js/config.js` → `consejeria` el responsable, el correo de privacidad y el plazo de conservación, y cambia `avisoAprobado` a `true` después de que lo revise quien asesore legalmente al ministerio.

## Eliminar datos

Para borrar la consulta de una persona: elimina su respuesta en el formulario (Respuestas → Individual → 🗑) **y** la fila de la hoja vinculada. Aplica también el plazo de conservación definido en el aviso.

## Si el formulario no aparece en la página

- Debe estar **aceptando respuestas** (pestaña Respuestas).
- No debe exigir iniciar sesión (Configuración → Respuestas).
- Debajo del formulario hay un enlace para abrirlo en una pestaña nueva.
- Si el formulario cambia de largo (preguntas nuevas), ajusta las alturas del marco en `assets/css/consejeria.css` (bloque «Formulario de Google incrustado»).
