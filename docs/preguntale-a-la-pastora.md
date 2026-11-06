# Pregúntale a la Pastora · Guía de uso

Espacio de consejería del sitio de Herederas del Reino. Las mujeres comparten una inquietud, con su nombre o de forma anónima, en el formulario de la página `/consejeria/`. El formulario tiene el diseño del sitio, pero **cada respuesta llega al Google Form del ministerio** y a su hoja de respuestas. La pastora responde a las preguntas que elija con videos en sus propias redes.

Formulario: https://docs.google.com/forms/d/1D1aD-RWy8OBPXG3_QddlYtJX8g8kBIqO20ASgTsi0pw/edit

---

## Qué hay en el sitio

| Pieza | Dónde |
|---|---|
| Tarjeta «Pregúntale a la Pastora» en el inicio | `index.html` (columna derecha; debajo del mensaje en tableta y celular) |
| Página de consejería con el formulario | `consejeria/index.html` (diseño) y `assets/js/consejeria.js` (envío) |
| Conexión con el Google Form | `assets/js/config.js` → `consejeria.googleForm` |
| Aviso de privacidad (borrador) | `consejeria/privacidad/index.html`, datos en `assets/js/config.js` → `consejeria` |
| Galería «La Pastora responde» | `assets/js/config.js` → `ensenanzas` (oculta mientras esté vacía) |

## Cómo se conecta con el Google Form

Cada pregunta del Google Form tiene un código (`entry.…`). El sitio envía cada respuesta con esos códigos, configurados en `assets/js/config.js` → `consejeria.googleForm`:

| Pregunta del Google Form | Código |
|---|---|
| ¿Cómo deseas compartir tu inquietud? | `entry.247459331` |
| ¿Cómo te llamas? | `entry.1723979380` |
| ¿Sobre qué tema necesitas orientación? | `entry.182868789` |
| Hija del Rey, ¿qué hay en tu corazón? | `entry.153933767` |
| Déjanos tu correo electrónico | `entry.954892756` |

**Importante al editar el Google Form:**
- Puedes cambiar el **texto** de las preguntas sin problema.
- **No borres y vuelvas a crear** una pregunta: cambia su código y esas respuestas dejarían de llegar.
- Las opciones de «¿Cómo deseas compartir tu inquietud?» deben seguir siendo exactamente «Prefiero permanecer en el anonimato 🤍» y «Deseo compartir mi nombre 🌷». Si las cambias, actualiza `opcionesIdentidad`.
- **No marques preguntas como obligatorias** si el sitio no las envía siempre (nombre y correo son opcionales). Si una pregunta obligatoria llega vacía, Google rechaza la respuesta sin avisar.
- Si agregas preguntas nuevas (por ejemplo, la autorización para compartir en redes), avisa para conectarlas al formulario del sitio.
- Para obtener el código de una pregunta: Google Form → ⋮ → «Obtener enlace prellenado», llena la pregunta, copia el enlace y busca `entry.`.

## Recomendaciones para el Google Form

1. En **Configuración → Respuestas**: mantener desactivado «Recopilar direcciones de correo electrónico» y «Limitar a 1 respuesta» (ambas exigirían iniciar sesión y el sitio no podría enviar).
2. El Google Form debe estar **aceptando respuestas** (pestaña Respuestas).
3. Las validaciones (tema, longitud, correo válido, consentimiento) ya las hace el formulario del sitio.

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

Datos en `assets/js/config.js` → `consejeria`: responsable, canal de privacidad (mientras `correoPrivacidad` esté vacío se usa el Instagram oficial), plazo de conservación (12 meses tras responder o cerrar la consulta) y fecha de actualización. Si cambian, actualiza también la fecha.

## Eliminar datos

Para borrar la consulta de una persona: elimina su respuesta en el formulario (Respuestas → Individual → 🗑) **y** la fila de la hoja vinculada. Aplica también el plazo de conservación definido en el aviso.

## Si las respuestas no llegan

- Revisa que el Google Form siga **aceptando respuestas**.
- Revisa que no se haya borrado o recreado ninguna pregunta (sección «Cómo se conecta»).
- Envía una consulta de prueba desde https://herederas-del-reino.github.io/consejeria/ y confirma que aparece en Respuestas.
