# Módulos del sitio Herederas del Reino

Desde el módulo «Conoce a nuestra Pastora», cada sección nueva e importante se
construye como un **módulo independiente** dentro de `modulos/`. Las secciones
que ya existían (inicio, muro, consejería, bienvenida) **no se migran**.

## Reglas para todo módulo

| Regla | Cómo se cumple |
|---|---|
| Archivos propios | `modulos/<nombre>/index.html`, `<nombre>.css`, `<nombre>.js` y `assets/` |
| No tocar lo global | Clases con prefijo propio (p. ej. `np-`), todo bajo una clase en `<body>`; `sitio.css` solo se **lee** para la paleta, tipografías, marca y botones |
| Sin dependencias | HTML, CSS y JavaScript puros; sin frameworks ni bibliotecas |
| Dentro de la app | La ruta `/modulos/...` ya está dentro del alcance de la PWA (`scope: "/"`); no hay que tocar el manifiesto ni el service worker |
| Misma app | Cargar `/assets/app/app.css?v=3` y `/assets/app/app.js?v=3` (ya guardados en caché) para tener la barra inferior en la app instalada |
| Seguridad | Copiar el `Content-Security-Policy` y el `referrer` del sitio; nada de `<script>` en línea; enlaces externos con `rel="noopener noreferrer"` |
| Regreso | Enlace visible a `/` (en el iPhone instalado no hay botón Atrás del navegador) |
| Acceso | Un solo enlace desde el sitio principal, con navegación normal (sin iframe) |
| Imágenes | WebP optimizadas, con `width`/`height`; las que no se ven al inicio se cargan después |

## Estructura

```
modulos/
└── nuestra-pastora/
    ├── index.html          página del módulo
    ├── pastora.css         estilos propios (prefijo np-)
    ├── pastora.js          carrusel de seis historias
    └── assets/
        ├── imagenes/       retrato, foto del llamado, avatar y galería
        └── publicaciones/  portadas de los libros
```

## Módulo «Conoce a nuestra Pastora»

- **Dirección:** `https://herederas-del-reino.github.io/modulos/nuestra-pastora/`
- **Acceso:** botón «Conoce a nuestra Pastora» en la tarjeta de la Pastora, sección
  «Quiénes somos» del inicio (no se cambió el menú).
- **Fuente del material:** `Portafolio.pdf`, autorizado por la Pastora Jennyfer Amarales.
  Las imágenes se extrajeron de los originales del PDF y se recortaron solo para quitar
  contadores e íconos de redes sociales de las capturas.

### Historias y duración

| # | Historia | Segundos | Imagen |
|---|---|---|---|
| 1 | Un corazón al servicio de Dios | 9 | Fotografía principal, página 2 |
| 2 | Una vida guiada por la fe | 12 | Ruta Ibarra → Valencia (dibujo SVG) |
| 3 | Restaurar, levantar y edificar | 14 | Fotografía de la página 5 |
| 4 | Palabras que transforman | 12 | Portadas, páginas 3 y 4 |
| 5 | Un mensaje que trasciende fronteras | 12 | Galería, páginas 7 a 10 |
| 6 | Sigamos creciendo juntas | 10 | Rostro de la fotografía principal |

La duración se cambia en el atributo `data-duracion` de cada `<article>`.

### Funcionamiento del carrusel

- **Un solo reloj:** avanza cuando termina la animación CSS de la barra de progreso
  activa (`animationend`); no hay `setInterval` ni `setTimeout`.
- **Controles:** anterior, pausar/reproducir y siguiente; flechas ← →, Inicio y Fin
  con el teclado; deslizar con el dedo.
- **Pausa automática:** con el cursor encima, con el foco de teclado dentro, mientras se
  mantiene el dedo presionado y cuando la pestaña no está visible.
- **Movimiento reducido:** si el teléfono lo pide, empieza en pausa y sin animaciones.
- **Lector de pantalla:** anuncia los cambios solo cuando está en pausa; las historias
  ocultas quedan `inert`.
- **Carga diferida:** al abrir solo se descarga el retrato; cada historia descarga la
  siguiente justo antes de mostrarse.
- **Limpieza:** todos los eventos se registran con un `AbortController`;
  `window.HRModuloPastora.destruir()` los quita de una vez.

### Redes verificadas (7 de noviembre de 2026)

- Instagram: `@jennyferamarales`, que es la cuenta de Jennyfer Amarales.
- TikTok: `@jennyferdeamarales` («P. Jennyfer de Amarales»). La dirección
  `@P.jennyferdeamarales` del portafolio **no existe** en TikTok, así que se enlazó la cuenta real.

### Sin conexión

El módulo **no se guarda por adelantado** para usarse sin internet. Con la estrategia
actual del service worker, que no se modificó, la página y las fotos quedan
disponibles sin conexión solo después de haberlas visitado con internet. Si la página
nunca se abrió, se ve la página «Sin conexión».

## Archivos creados y modificados

| Archivo | Cambio |
|---|---|
| `modulos/nuestra-pastora/index.html` | **Nuevo** |
| `modulos/nuestra-pastora/pastora.css` | **Nuevo** |
| `modulos/nuestra-pastora/pastora.js` | **Nuevo** |
| `modulos/nuestra-pastora/assets/imagenes/*.webp` | **Nuevos** (8 imágenes, ≈ 290 KB) |
| `modulos/nuestra-pastora/assets/publicaciones/*.webp` | **Nuevos** (2 portadas, 74 KB) |
| `docs/modulos.md` | **Nuevo** (este documento) |
| `index.html` | **Una línea**: botón «Conoce a nuestra Pastora» en la tarjeta de la Pastora |

**Sin cambios:** manifiesto, service worker, `start_url`, menú, estilos globales,
formularios, servicios externos y los demás repositorios.

## Crear un módulo nuevo

1. Copiar `modulos/nuestra-pastora/index.html` como base de la cabecera: CSP, fuentes,
   `sitio.css`, bloque de la app y enlace de regreso.
2. Usar otro prefijo de clases y otro nombre de archivos CSS/JS.
3. Agregar **un** acceso desde el sitio principal.
4. Probar en móvil y escritorio, y como app instalada, sin errores de consola ni
   violaciones de CSP.
