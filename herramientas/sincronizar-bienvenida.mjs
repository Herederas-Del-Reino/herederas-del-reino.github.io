#!/usr/bin/env node
/* =====================================================================
   Copia el portal «Bienvenida a casa, Heredera» (repositorio bienvenida)
   dentro de la app, en /sitio/bienvenida/, y lo conecta con la app:
   manifiesto, íconos, barra inferior y service worker.

   El repositorio bienvenida NO se modifica: solo se lee.

   Uso (desde la carpeta de este repositorio):
     node herramientas/sincronizar-bienvenida.mjs [ruta-al-repo-bienvenida]
   Por defecto busca ../bienvenida
   ===================================================================== */
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const origen = resolve(process.argv[2] || join(raiz, '..', 'bienvenida'));
const destino = join(raiz, 'sitio', 'bienvenida');

if (!existsSync(join(origen, 'index.html')) || !existsSync(join(origen, 'js', 'main.js'))) {
  console.error(`No encontré el portal de bienvenida en: ${origen}`);
  process.exit(1);
}

let version = 'sin git';
try {
  version = execFileSync('git', ['-C', origen, 'log', '-1', '--format=%h %cs'], { encoding: 'utf8' }).trim();
  const cambios = execFileSync('git', ['-C', origen, 'status', '--porcelain'], { encoding: 'utf8' }).trim();
  if (cambios) console.warn('Aviso: el repositorio bienvenida tiene cambios sin guardar; se copiarán tal como están.');
} catch { /* sin git: se copia igual */ }

// 1. Copia limpia solo de lo que el portal necesita para funcionar
rmSync(destino, { recursive: true, force: true });
mkdirSync(destino, { recursive: true });
for (const parte of ['index.html', 'css', 'js', 'data', 'assets']) {
  cpSync(join(origen, parte), join(destino, parte), {
    recursive: true,
    filter: (ruta) => !/\.gitkeep$/.test(ruta),
  });
}

// 2. Conexión con la app (solo en la copia)
const archivo = join(destino, 'index.html');
let html = readFileSync(archivo, 'utf8');
const reemplazar = (buscar, poner, nombre) => {
  if (!html.includes(buscar)) { console.error(`No encontré «${nombre}» en index.html de bienvenida. Revisa el script.`); process.exit(1); }
  html = html.replace(buscar, poner);
};

reemplazar('<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">',
  '<link rel="apple-touch-icon" href="/assets/app/iconos/apple-touch-icon.png">', 'apple-touch-icon');
reemplazar('</head>', `<!-- App Herederas del Reino (agregado por herramientas/sincronizar-bienvenida.mjs) -->
<link rel="manifest" href="/manifest.webmanifest">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Herederas">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="stylesheet" href="/assets/app/app.css?v=3">
<script src="/assets/app/app.js?v=3"></script>
</head>`, '</head>');
html = html.replace('<!DOCTYPE html>', `<!DOCTYPE html>\n<!-- Copia de Herederas-Del-Reino/bienvenida (${version}). No editar aquí: editar el repositorio bienvenida y volver a sincronizar. -->`);
writeFileSync(archivo, html);

console.log(`Bienvenida copiada en sitio/bienvenida/ desde ${origen} (${version}).`);
