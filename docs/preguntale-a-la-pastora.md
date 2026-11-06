# Pregúntale a la Pastora · Guía de configuración y uso

Espacio de consejería del sitio de Herederas del Reino: las mujeres comparten una inquietud, con su nombre o de forma anónima; la pastora responde a las preguntas que elija mediante videos en sus propias redes; quien dejó su correo puede recibir el enlace.

> **Estado actual:** la página y el formulario están construidos, pero **la recepción de consultas está apagada**. No se recibe ni se guarda ningún dato hasta completar los pasos 1 a 6 de esta guía.

---

## Qué quedó implementado y qué falta configurar

| Pieza | Estado |
|---|---|
| Tarjeta «Pregúntale a la Pastora» en el inicio | ✅ Implementada |
| Página `/consejeria/` (encabezado, «Así funciona», formulario, confirmación) | ✅ Implementada |
| Validaciones, campo trampa contra bots, protección contra doble envío | ✅ Implementadas y probadas |
| Aviso de privacidad `/consejeria/privacidad/` | ⚠️ **Borrador**: faltan los datos del responsable, el correo de contacto y el plazo de conservación |
| Backend (Google Apps Script + Google Sheets) | ⚠️ Código listo en `docs/apps-script/Codigo.gs`; **falta crearlo en la cuenta de Google del ministerio** |
| Avisos por correo a la pastora y a la encargada de redes | ⚠️ Faltan los dos correos (no se inventaron) |
| Envío del enlace del video a quien lo pidió | ✅ Implementado en el menú de la hoja; se activa con el backend |
| Galería «La Pastora responde» | ✅ Implementada; permanece oculta hasta agregar videos reales |

---

## 1. Crear la hoja privada de consultas

1. Con la cuenta de Google del ministerio, crea una hoja nueva llamada **«Consultas — Pregúntale a la Pastora»**.
2. **No la publiques en la web** ni compartas el enlace públicamente. Es distinta de la hoja del Muro de oración.
3. Compártela solo con la pastora y la encargada de redes (botón **Compartir** → agrega sus correos como *Editoras*). Desactiva «Los editores pueden cambiar permisos y compartir».

## 2. Crear el backend

1. En la hoja: **Extensiones → Apps Script**.
2. Borra el contenido del archivo `Código.gs` y pega todo el contenido de `docs/apps-script/Codigo.gs`. Guarda.
3. Recarga la hoja. Aparece el menú **Pregúntale a la Pastora**.
4. Menú → **Configurar la hoja (solo la primera vez)**. Google pedirá permisos; acéptalos con la cuenta del ministerio. Se crea la pestaña **Consultas** con sus columnas, listas de estados y casillas.

## 3. Configurar los dos correos y las propiedades privadas

En Apps Script: **Configuración del proyecto (⚙) → Propiedades del script → Agregar propiedad**:

| Propiedad | Valor |
|---|---|
| `CORREOS_ADMIN` | correo de la pastora y correo de la encargada de redes, separados por coma |
| `RECEPCION_ACTIVA` | `no` por ahora (cámbialo a `si` en el paso 6) |
| `MAX_POR_HORA` | opcional, por defecto 40 |
| `DIAS_CONSERVACION` | días que se conservan las consultas **Cerradas** (según el plazo del aviso de privacidad) |

Estos datos nunca se escriben en el código ni en GitHub.

## 4. Publicar el backend como aplicación web

1. Apps Script → **Implementar → Nueva implementación → Tipo: Aplicación web**.
2. *Ejecutar como:* **Yo** (la cuenta del ministerio). *Quién tiene acceso:* **Cualquier usuario**. (El formulario es público; el servicio solo **recibe** consultas y nunca muestra datos.)
3. Copia la URL que termina en `/exec`.

## 5. Completar y aprobar el aviso de privacidad

En `assets/js/config.js`, sección `consejeria`, completa:

```js
responsable: "Nombre legal del ministerio o de la persona responsable",
correoPrivacidad: "correo para ejercer derechos",
conservacion: "12 meses después de cerrar la consulta",   // el plazo que decida el ministerio
avisoAprobado: true                                        // solo después de revisarlo
```

Revisa el texto completo de `consejeria/privacidad/index.html` con quien asesore legalmente al ministerio. El aviso contempla la Ley 1581 de 2012 y la existencia de datos sensibles (creencias religiosas, salud), pero no reemplaza una revisión jurídica.

## 6. Conectar el formulario y activar la recepción

1. En `assets/js/config.js` → `consejeria.endpoint`, pega la URL `/exec` del paso 4.
2. En Apps Script cambia `RECEPCION_ACTIVA` a `si`.
3. Haz un envío de prueba desde el sitio y comprueba que aparece una fila nueva y que llegan los dos avisos.

Para apagar la recepción en cualquier momento: `RECEPCION_ACTIVA = no` (no requiere cambiar el sitio).

---

## Uso diario

### Revisar las consultas
Abre la hoja → pestaña **Consultas**. Los avisos por correo solo traen el ID, el tema y la fecha, nunca el texto, para proteger a la persona.

### Cambiar estados
Columna **Estado**: Recibida → En revisión → Seleccionada para video → Pendiente de publicación → Respondida → Cerrada.

### Identificar preguntas que se pueden publicar
Filtra **Autoriza publicación = Sí**. Solo esas preguntas pueden mencionarse en un video, y **siempre en versión anónima**: sin nombre, correo, ciudad ni detalles que permitan reconocer a la persona. Las consultas con «No» nunca se convierten en contenido público.

### Registrar el enlace del video
Cuando la pastora publique la enseñanza en sus redes:
1. Pega el enlace en **Enlace del video** (debe empezar por `https://`).
2. Elige la **Plataforma** y escribe la **Fecha de publicación**.
3. Marca la casilla **Revisión de privacidad** cuando hayas confirmado que el video no expone a la persona.

### Enviar las respuestas por correo
Menú **Pregúntale a la Pastora → Enviar enlaces de video pendientes**. Se envía solo a las filas que cumplen todo:
- *Solicita respuesta = Sí* y correo válido,
- enlace del video `https://`,
- casilla *Revisión de privacidad* marcada,
- sin envío anterior.

El sistema llena **Fecha de notificación** y **Estado de envío** (Enviado o el error), y cambia el estado a *Respondida*. Si lo ejecutas de nuevo, no reenvía.

### Agregar videos a la galería «La Pastora responde»
En `assets/js/config.js` → `ensenanzas`, agrega un bloque por video **ya publicado**:

```js
{ titulo: "¿Cómo perdonar cuando duele?", categoria: "Perdón y restauración",
  red: "Instagram", url: "https://www.instagram.com/reel/…",
  miniatura: "assets/img/ensenanzas/perdon.webp" }   // opcional, vertical 9:16
```

La galería aparece sola cuando hay al menos un video. Nunca incluyas la pregunta original ni datos de la persona.

### Administrar permisos
- Solo la pastora y la encargada de redes deben tener acceso a la hoja y al proyecto de Apps Script.
- Si alguien deja de colaborar: quítale el acceso a la hoja y actualiza `CORREOS_ADMIN`.

### Eliminar datos
- **Una consulta concreta** (por ejemplo, si la persona lo pide): menú → *Eliminar una consulta por ID*.
- **Limpieza periódica**: menú → *Eliminar consultas cerradas antiguas* (usa `DIAS_CONSERVACION`).
- Revisa también la papelera de Google Drive y el historial de versiones de la hoja si se requiere una eliminación total.

---

## Seguridad aplicada

- Validación completa en el servidor (temas permitidos, longitudes, formato de correo, tipos de datos, consentimiento obligatorio).
- Campo trampa invisible y rechazo de envíos instantáneos (bots).
- Límite de consultas por hora.
- Clave única por envío: un reintento o un doble clic nunca crea dos filas.
- Los textos que empiezan con `=`, `+`, `-` o `@` se guardan como texto (sin fórmulas).
- Sin lectura pública: el servicio solo responde «ok» o un código de error.
- Los registros de Apps Script nunca incluyen el contenido de las consultas.
- El navegador no guarda nada (ni cookies ni almacenamiento local) y no se ponen datos en la URL.
- La página aclara que es orientación espiritual y no sustituye atención profesional ni de emergencias (línea 123).

**Límite a tener en cuenta:** los datos quedan en Google Sheets, dentro de la cuenta del ministerio. Su seguridad depende de esa cuenta: activa la verificación en dos pasos y no compartas la hoja más allá de las dos administradoras.

---

## Solución de problemas

| Síntoma | Causa probable |
|---|---|
| El formulario dice «La recepción de consultas se habilitará muy pronto» | `consejeria.endpoint` vacío o mal copiado en `config.js` (debe terminar en `/exec`) |
| «No pudimos guardar tu consulta» | `RECEPCION_ACTIVA` no es `si`, falta la pestaña *Consultas* o la implementación no es la última versión |
| La fila se guarda pero no llegan avisos | `CORREOS_ADMIN` vacío o con error; mira *Observaciones internas* de la fila |
| «En este momento recibimos muchas consultas» | Se alcanzó `MAX_POR_HORA` |
| Cambié el código y no se refleja | Apps Script → *Implementar → Administrar implementaciones → Editar → Versión: nueva* |

---

## Pruebas

```bash
node docs/apps-script/pruebas/backend.test.cjs
node docs/apps-script/pruebas/formulario.e2e.cjs <ruta a node_modules/playwright>
```

La primera prueba el backend con servicios de Google simulados; la segunda llena el formulario real en un navegador y lo conecta a ese backend simulado (necesita el sitio en `http://localhost:5500`). Ninguna de las dos usa la cuenta real de Google: la prueba con Google se hace en el paso 6.
