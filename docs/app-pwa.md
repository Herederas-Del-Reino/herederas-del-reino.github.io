# App Herederas del Reino (PWA) · Guía

El sitio se puede instalar como una app en Android, iPhone y computador. Hay **una sola app**, con un ícono y una identidad, que reúne el sitio principal y la Bienvenida. Sigue publicada gratis en GitHub Pages, sin servidor propio.

- Dirección de la app: https://herederas-del-reino.github.io/
- Bienvenida dentro de la app: https://herederas-del-reino.github.io/sitio/bienvenida/
- El portal original sigue en https://herederas-del-reino.github.io/bienvenida/ (repositorio `bienvenida`, sin cambios)

---

## Qué se agregó

| Archivo | Para qué |
|---|---|
| `manifest.webmanifest` | Nombre, ícono, colores, modo app (`standalone`), `start_url`, `scope` y accesos directos (Bienvenida, Oración, Pastora) |
| `sw.js` | Service worker: carga rápida, páginas sin conexión y aviso de versión nueva |
| `offline.html` + `assets/app/offline.js` | Página amable cuando no hay internet y la página no estaba guardada |
| `assets/app/app.js` | Barra inferior, registro del service worker, aviso «Actualizar», invitación a instalar, aviso «Sin conexión» |
| `assets/app/app.css` | Estilos de esas piezas (marfil, rosa, dorado suave, vino) |
| `assets/app/iconos/` | Íconos hechos con el logo oficial (`assets/img/logo-oficial.webp`) sobre fondo marfil |
| `sitio/bienvenida/` | Copia del portal de bienvenida conectada a la app |
| `herramientas/sincronizar-bienvenida.mjs` | Vuelve a copiar la Bienvenida cuando cambia su repositorio |

En `index.html`, `consejeria/index.html` y `consejeria/privacidad/index.html` solo se agregaron unas líneas en `<head>`: manifiesto, ícono de iPhone, `app.css` y `app.js`. El diseño, los textos y los formularios no cambiaron.

## Cómo se ve

- **En el navegador**, en el inicio, debajo de los botones principales, aparece la tarjeta destacada **«Gratis · Instala la app Herederas»**, siempre visible para quien aún no tiene la app:
  - en Android y computador (Chrome, Edge, Samsung) abre la instalación directa;
  - en iPhone, en navegadores sin instalación directa o dentro de Instagram, Facebook o WhatsApp, muestra los pasos para ese teléfono.

  Al bajar por la página queda un botón pequeño **«Instalar app»** abajo a la izquierda. En la Bienvenida aparece ese botón y una invitación una sola vez. Nada de esto aparece dentro de la app instalada ni en la consejería.
- **En la app instalada** aparece la barra inferior **Inicio · Bienvenida · Oración · Pastora**. En celular respeta el notch y la barra del iPhone. En computador y tableta es una barra flotante centrada.

## Cómo instalarla

- **Android (Chrome):** botón «Instalar app» de la invitación, o menú ⋮ → «Instalar aplicación».
- **iPhone (Safari):** botón Compartir → «Agregar a pantalla de inicio». Apple no permite un botón directo, por eso la invitación muestra estos pasos.
- **Computador (Chrome o Edge):** ícono de instalar en la barra de direcciones, o el botón de la invitación.

## Sin conexión: qué funciona y qué no

- Las páginas ya visitadas se abren sin internet, con sus imágenes.
- Una página nunca visitada muestra la página «Estás sin conexión».
- **Los formularios no se envían sin internet.** El formulario de la Pastora avisa del error y conserva lo escrito. Nada se guarda para enviarlo después.
- El Muro de oración necesita internet para mostrar los nombres y reintenta solo.

### Qué no toca nunca el service worker

Los envíos (Google Forms), la hoja del Muro de oración, la canción, el portal original `/bienvenida/` y cualquier sitio externo. Ningún dato personal queda guardado en el celular.

## Publicar cambios en el sitio (después de la app)

1. Las páginas, estilos y código **se cargan primero de internet**, así que los cambios normales se ven solos. GitHub Pages puede tardar hasta 10 minutos.
2. Sigue usando `?v=` en los enlaces de CSS y JS como siempre.
3. Si cambias `sw.js`, `assets/app/app.js` o `assets/app/app.css`:
   - sube `VERSION` en `sw.js` (hoy `hr-app-v3`; la siguiente sería `hr-app-v4`);
   - sube el `?v=` de `app.css` y `app.js` (hoy `?v=3`), tanto en las páginas como en la lista `ESENCIALES` de `sw.js` y en `herramientas/sincronizar-bienvenida.mjs`.

   Así, quien tenga la app instalada verá «Hay una versión nueva de la app · Actualizar». En el navegador no aparece ningún aviso: la versión nueva se aplica sola en la siguiente página.

## Actualizar la Bienvenida dentro de la app

La Bienvenida se sigue editando **en su repositorio** (`bienvenida`). Después:

```bash
cd ../bienvenida && git pull
cd ../muro-oracion && node herramientas/sincronizar-bienvenida.mjs
```

El script copia el portal en `sitio/bienvenida/` y le vuelve a poner las líneas de la app. Luego se revisa y se publica este repositorio. **No edites `sitio/bienvenida/` a mano:** se reemplaza en cada sincronización.

## Cambiar el ícono

Los íconos se hicieron con el logo oficial completo. Si el ministerio entrega la insignia corona + «HR» en alta resolución (mínimo 512 × 512 px), se reemplazan los archivos de `assets/app/iconos/` con los mismos nombres y medidas:

- `icono-192.png` y `icono-512.png`;
- `icono-maskable-192.png` y `icono-maskable-512.png` (con margen: Android puede recortarlos en círculo);
- `apple-touch-icon.png` (180 × 180).

Luego se sube `VERSION` en `sw.js`.

## Desinstalar o empezar de cero (soporte)

- **Android:** mantener presionado el ícono → Desinstalar.
- **iPhone:** mantener presionado → Eliminar app.
- **Computador:** en la app, menú ⋮ → Desinstalar.

Si algo se ve viejo, basta cerrar y abrir la app. Si persiste: en el navegador, Configuración del sitio → Borrar datos.

## Seguridad

- **Política de seguridad (CSP)** en todas las páginas. Solo se permite código del propio sitio. Las únicas excepciones son las fuentes de Google, la hoja del Muro de oración (`docs.google.com` y `*.googleusercontent.com`), el envío al Google Form y la canción de incompetech. No hay scripts en línea ni `eval`. Si se agrega un servicio externo nuevo (por ejemplo, un video incrustado), hay que sumarlo a la política en el `<head>` de cada página.
- **Política de referencia** `strict-origin-when-cross-origin`: los sitios externos no ven la dirección completa de la página.
- **Protección contra páginas incrustadas** (clickjacking). Si otro sitio mete la página en un marco, el contenido no se muestra.
- **Datos de las visitantes:**
  - los nombres del muro y los textos dinámicos se muestran escapados, así que no pueden inyectar código;
  - el formulario de consejería no guarda nada en el teléfono ni en la URL;
  - el service worker nunca guarda envíos.
- **Sin secretos en el repositorio:** los enlaces del Google Form y de la hoja publicada son públicos por naturaleza. Editarlos exige la cuenta del ministerio.
- **Límite de un sitio sin servidor:** GitHub Pages no permite encabezados HTTP propios ni filtrar envíos automáticos al Google Form más allá de la trampa anti-bots del formulario. Si llegara spam, se puede activar en el Google Form la verificación con cuenta, aunque eso exigiría iniciar sesión.

## Límites conocidos

- iPhone no muestra un botón de instalación automático y no hay notificaciones push, porque necesitarían un servidor.
- Los enlaces a Instagram, YouTube, Zoom, WhatsApp, Amazon y Google Forms se abren fuera de la app. Es lo normal.
- La copia de la Bienvenida debe sincronizarse cuando cambie su repositorio.
