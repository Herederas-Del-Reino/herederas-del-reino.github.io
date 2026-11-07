// Tarjetas visuales generadas 100 % en el navegador (canvas → PNG). No se envía nada a ningún servidor.
const ANCHO = 1080, ALTO = 1350;
const COLORES = { marfil: '#FFF6EF', papel: '#FFFBF7', rosa: '#F4D6DE', dorado: '#D4AF37', vino: '#7A3346', vinoSuave: '#9C5466', marron: '#6B4B3E', tinta: '#4A332B' };

const cacheImg = new Map();
function cargarImagen(src) {
  if (!cacheImg.has(src)) {
    cacheImg.set(src, new Promise((ok, mal) => { const im = new Image(); im.onload = () => ok(im); im.onerror = mal; im.src = src; }));
  }
  return cacheImg.get(src);
}

async function fuentesListas() {
  if (!document.fonts) return;
  await Promise.all([
    document.fonts.load('italic 500 90px "Playfair Display"'),
    document.fonts.load('italic 500 50px "Cormorant Garamond"'),
    document.fonts.load('500 40px "Cormorant Garamond"'),
    document.fonts.load('500 28px "DM Sans"'),
  ]).catch(() => {});
}

function lineas(ctx, texto, ancho) {
  const palabras = texto.split(/\s+/); const out = []; let linea = '';
  for (const p of palabras) {
    const prueba = linea ? `${linea} ${p}` : p;
    if (ctx.measureText(prueba).width > ancho && linea) { out.push(linea); linea = p; } else linea = prueba;
  }
  if (linea) out.push(linea);
  return out;
}

function textoCentrado(ctx, texto, y, { fuente, color, alto, ancho = 820, espaciado = '0px' }) {
  ctx.font = fuente; ctx.fillStyle = color; ctx.textAlign = 'center';
  if ('letterSpacing' in ctx) ctx.letterSpacing = espaciado;
  const ls = lineas(ctx, texto, ancho);
  ls.forEach((l, i) => ctx.fillText(l, ANCHO / 2, y + i * alto));
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  return y + ls.length * alto;
}

function filete(ctx, y, ancho = 220) {
  ctx.strokeStyle = COLORES.dorado; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(ANCHO / 2 - ancho / 2, y); ctx.lineTo(ANCHO / 2 - 14, y); ctx.moveTo(ANCHO / 2 + 14, y); ctx.lineTo(ANCHO / 2 + ancho / 2, y); ctx.stroke();
  ctx.fillStyle = COLORES.dorado; ctx.save(); ctx.translate(ANCHO / 2, y); ctx.rotate(Math.PI / 4); ctx.fillRect(-6, -6, 12, 12); ctx.restore();
}

/**
 * @param {{titulo:string, texto:string, referencia:string, cierre?:string[]}} datos
 * @returns {Promise<Blob>}
 */
export async function generarTarjeta({ titulo, texto, referencia, cierre = [] }) {
  await fuentesListas();
  const [logo, mariposa, flor1, flor2] = await Promise.all([
    cargarImagen('assets/images/logo-oficial.webp'), cargarImagen('assets/images/mariposa-1.webp'),
    cargarImagen('assets/images/peonia-1.webp'), cargarImagen('assets/images/anemona.webp'),
  ]);
  const c = document.createElement('canvas'); c.width = ANCHO; c.height = ALTO;
  const ctx = c.getContext('2d');

  // Fondo marfil con luz cálida
  const g = ctx.createRadialGradient(ANCHO * 0.5, ALTO * 0.15, 80, ANCHO * 0.5, ALTO * 0.5, ALTO * 0.85);
  g.addColorStop(0, '#FFFDF9'); g.addColorStop(0.55, '#FCEFEA'); g.addColorStop(1, COLORES.rosa);
  ctx.fillStyle = g; ctx.fillRect(0, 0, ANCHO, ALTO);

  // Doble marco dorado fino
  ctx.strokeStyle = 'rgba(212,175,55,.75)'; ctx.lineWidth = 2; ctx.strokeRect(46, 46, ANCHO - 92, ALTO - 92);
  ctx.strokeStyle = 'rgba(212,175,55,.35)'; ctx.lineWidth = 1; ctx.strokeRect(60, 60, ANCHO - 120, ALTO - 120);

  // Flores reales en las esquinas inferiores y una mariposa
  ctx.globalAlpha = 0.95;
  ctx.drawImage(flor1, 70, ALTO - 70 - 250, 250 * flor1.width / flor1.height, 250);
  ctx.drawImage(flor2, ANCHO - 70 - 190, ALTO - 70 - 190, 190, 190 * flor2.height / flor2.width);
  ctx.globalAlpha = 1;
  ctx.drawImage(mariposa, ANCHO - 230, 110, 120, 120 * mariposa.height / mariposa.width);

  // Logotipo oficial
  const lw = 360, lh = lw * logo.height / logo.width;
  ctx.drawImage(logo, (ANCHO - lw) / 2, 120, lw, lh);
  let y = 120 + lh + 56;
  filete(ctx, y); y += 92;

  y = textoCentrado(ctx, titulo, y, { fuente: 'italic 500 84px "Playfair Display", Georgia, serif', color: COLORES.vino, alto: 96 }) + 30;
  y = textoCentrado(ctx, `«${texto}»`, y, { fuente: 'italic 500 48px "Cormorant Garamond", Georgia, serif', color: COLORES.tinta, alto: 62, ancho: 800 }) + 16;
  y = textoCentrado(ctx, referencia.toUpperCase(), y, { fuente: '500 26px "DM Sans", Arial, sans-serif', color: COLORES.vinoSuave, alto: 34, espaciado: '6px' }) + 40;
  if (cierre.length) {
    filete(ctx, y - 6, 140); y += 56;
    cierre.forEach((t, i) => {
      y = textoCentrado(ctx, t, y, { fuente: `${i === cierre.length - 1 ? '600' : '500'} 38px "Cormorant Garamond", Georgia, serif`, color: i === cierre.length - 1 ? COLORES.vino : COLORES.marron, alto: 48, ancho: 760 }) + 6;
    });
  }
  return new Promise((ok) => c.toBlob(ok, 'image/png'));
}

export function descargar(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: nombre });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Comparte con las opciones del dispositivo; si no es posible, devuelve false. */
export async function compartir(blob, nombre, texto) {
  const archivo = new File([blob], nombre, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
    try { await navigator.share({ files: [archivo], title: 'Herederas del Reino', text: texto }); return true; }
    catch (e) { return e.name === 'AbortError'; }
  }
  return false;
}
