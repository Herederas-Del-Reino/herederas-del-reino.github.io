// Prueba de extremo a extremo: formulario real en el navegador → Codigo.gs (simulado).
// Requiere el sitio servido en http://localhost:5500 y Playwright instalado.
// Ejecutar: node docs/apps-script/pruebas/formulario.e2e.cjs <ruta a node_modules/playwright>
const assert = require('assert');
const { chromium } = require(process.argv[2] || 'playwright');
const { crearEntorno } = require('./entorno.cjs');

const SITIO = 'http://localhost:5500';
const ENDPOINT = 'https://script.google.com/macros/s/PRUEBA_LOCAL_123/exec';

async function abrir(navegador, { endpoint = ENDPOINT, ensenanzas = null, backend, vista = { width: 1280, height: 900 } } = {}) {
  const pagina = await navegador.newPage({ viewport: vista });
  const errores = [];
  pagina.on('pageerror', (e) => errores.push(e.message));
  const peticiones = [];
  pagina.on('request', (r) => peticiones.push(r.url()));
  await pagina.route('**/assets/js/config.js*', async (route) => {
    const original = await (await route.fetch()).text();
    const extra = `\nwindow.HR_CONFIG.consejeria.endpoint = ${JSON.stringify(endpoint)};` +
      (ensenanzas ? `\nwindow.HR_CONFIG.ensenanzas = ${JSON.stringify(ensenanzas)};` : '');
    await route.fulfill({ body: original + extra, contentType: 'application/javascript' });
  });
  await pagina.route(ENDPOINT, async (route) => {
    if (typeof backend === 'function') return backend(route);
    const r = backend.post(route.request().postData());
    await new Promise((ok) => setTimeout(ok, 400));          // latencia realista
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(r) });
  });
  await pagina.goto(SITIO + '/consejeria/', { waitUntil: 'networkidle' });
  return { pagina, errores, peticiones };
}

async function llenar(p, { nombre = null, correo = null, publicar = false, texto = 'Necesito orientación para perdonar a alguien de mi familia.' } = {}) {
  await p.check(`input[name=identidad][value=${nombre === null ? 'anonima' : 'nombre'}]`, { force: true });
  if (nombre !== null) await p.fill('#nombre', nombre);
  await p.selectOption('#tema', 'Perdón y restauración');
  await p.fill('#consulta-texto', texto);
  await p.check(`input[name=respuesta][value=${correo === null ? 'no' : 'si'}]`, { force: true });
  if (correo !== null) await p.fill('#correo', correo);
  await p.check(`input[name=publicacion][value=${publicar ? 'si' : 'no'}]`, { force: true });
  await p.check('#consentimiento');
  await p.waitForTimeout(3100);                              // el backend rechaza envíos instantáneos
}

const pruebas = {
  async 'Sin endpoint: aviso visible y nada se envía'(nav) {
    const be = crearEntorno({ RECEPCION_ACTIVA: 'si', CORREOS_ADMIN: 'a@b.co' });
    const { pagina: p, errores, peticiones } = await abrir(nav, { endpoint: '', backend: be });
    assert.ok(await p.isVisible('#form-estado-recepcion'));
    await llenar(p);
    await p.click('#enviar');
    assert.match(await p.textContent('#form-estado'), /no se envió ni se guardó/);
    assert.strictEqual(be.filas.length, 0);
    assert.ok(!peticiones.some((u) => u.includes('script.google.com')));
    assert.deepStrictEqual(errores, []); await p.close();
  },
  async 'Validaciones visibles y accesibles'(nav) {
    const be = crearEntorno({ RECEPCION_ACTIVA: 'si' });
    const { pagina: p } = await abrir(nav, { backend: be });
    await p.click('#enviar');
    for (const id of ['identidad', 'tema', 'consulta', 'respuesta', 'publicacion', 'consentimiento']) assert.ok(await p.isVisible('#error-' + id), id);
    assert.strictEqual(await p.getAttribute('#tema', 'aria-invalid'), 'true');
    assert.strictEqual(await p.evaluate(() => document.activeElement.name), 'identidad');
    // correo inválido
    await llenar(p, { correo: 'maria@' });
    await p.click('#enviar');
    assert.ok(await p.isVisible('#error-correo'));
    assert.strictEqual(be.filas.length, 0); await p.close();
  },
  async 'Campos condicionales y contador'(nav) {
    const { pagina: p } = await abrir(nav, { backend: crearEntorno({}) });
    assert.ok(await p.isHidden('#bloque-nombre')); assert.ok(await p.isHidden('#bloque-correo'));
    await p.check('input[name=identidad][value=nombre]', { force: true }); assert.ok(await p.isVisible('#nombre'));
    await p.fill('#nombre', 'Ana');
    await p.check('input[name=identidad][value=anonima]', { force: true });
    assert.ok(await p.isHidden('#bloque-nombre')); assert.strictEqual(await p.inputValue('#nombre'), '');
    await p.check('input[name=respuesta][value=si]', { force: true }); assert.ok(await p.isVisible('#correo'));
    await p.fill('#consulta-texto', 'Hola mundo');
    assert.strictEqual(await p.textContent('#contador-consulta'), '10 / 3000');
    assert.strictEqual(await p.getAttribute('#consulta-texto', 'maxlength'), '3000');
    assert.strictEqual(await p.isChecked('input[name=publicacion][value=si]'), false, 'la autorización no viene marcada');
    assert.strictEqual(await p.isChecked('#consentimiento'), false, 'el consentimiento no viene marcado');
    await p.close();
  },
  async 'Envío anónimo guardado y confirmado'(nav) {
    const be = crearEntorno({ RECEPCION_ACTIVA: 'si', CORREOS_ADMIN: 'pastora@ejemplo.test,redes@ejemplo.test' });
    const { pagina: p, errores } = await abrir(nav, { backend: be });
    await llenar(p);
    await p.click('#enviar');
    assert.ok(await p.isDisabled('#enviar'), 'botón bloqueado mientras envía');
    await p.waitForSelector('#exito:not([hidden])');
    assert.match(await p.textContent('#exito'), /¡Gracias por abrir tu corazón!/);
    assert.match(await p.textContent('#exito-id'), /HR-\d{8}-/);
    assert.strictEqual(be.filas.length, 1);
    assert.strictEqual(be.filas[0][be.col('Anónimo')], 'Sí');
    assert.strictEqual(be.correos.length, 1);
    assert.ok(!p.url().includes('perdonar'), 'sin datos en la URL');
    assert.deepStrictEqual(await p.evaluate(() => [document.cookie, localStorage.length, sessionStorage.length]), ['', 0, 0]);
    assert.deepStrictEqual(errores, []); await p.close();
  },
  async 'Envío con nombre, correo y autorización'(nav) {
    const be = crearEntorno({ RECEPCION_ACTIVA: 'si', CORREOS_ADMIN: 'a@b.co' });
    const { pagina: p } = await abrir(nav, { backend: be });
    await llenar(p, { nombre: 'María', correo: 'maria@correo.com', publicar: true });
    await p.click('#enviar');
    await p.waitForSelector('#exito:not([hidden])');
    const f = be.filas[0];
    assert.deepStrictEqual([f[be.col('Nombre')], f[be.col('Correo')], f[be.col('Solicita respuesta')], f[be.col('Autoriza publicación')]], ['María', 'maria@correo.com', 'Sí', 'Sí']);
    await p.close();
  },
  async 'Doble clic no duplica'(nav) {
    const be = crearEntorno({ RECEPCION_ACTIVA: 'si', CORREOS_ADMIN: 'a@b.co' });
    const { pagina: p } = await abrir(nav, { backend: be });
    await llenar(p);
    await p.evaluate(() => { const b = document.getElementById('enviar'); b.click(); b.click(); document.getElementById('form-consulta').requestSubmit(); });
    await p.waitForSelector('#exito:not([hidden])');
    assert.strictEqual(be.filas.length, 1); await p.close();
  },
  async 'Error del servidor: no confirma y permite reintentar sin duplicar'(nav) {
    const be = crearEntorno({ RECEPCION_ACTIVA: 'si', CORREOS_ADMIN: 'a@b.co' });
    let fallar = true;
    const { pagina: p } = await abrir(nav, {
      backend: async (route) => {
        if (fallar) return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":false,"error":"servidor"}' });
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(be.post(route.request().postData())) });
      },
    });
    await llenar(p);
    await p.click('#enviar');
    await p.waitForFunction(() => /No pudimos guardar/.test(document.getElementById('form-estado').textContent));
    assert.ok(await p.isHidden('#exito')); assert.strictEqual(await p.inputValue('#consulta-texto') !== '', true, 'el texto no se pierde');
    fallar = false;
    await p.click('#enviar');
    await p.waitForSelector('#exito:not([hidden])');
    assert.strictEqual(be.filas.length, 1); await p.close();
  },
  async 'Sin conexión: mensaje claro'(nav) {
    const { pagina: p } = await abrir(nav, { backend: (route) => route.abort('internetdisconnected') });
    await llenar(p);
    await p.click('#enviar');
    await p.waitForFunction(() => /Revisa tu conexión/.test(document.getElementById('form-estado').textContent));
    assert.ok(await p.isHidden('#exito')); await p.close();
  },
  async 'Galería oculta sin videos y visible con videos'(nav) {
    const be = crearEntorno({});
    let { pagina: p } = await abrir(nav, { backend: be });
    assert.ok(await p.isHidden('#respuestas')); await p.close();
    ({ pagina: p } = await abrir(nav, { backend: be, ensenanzas: [
      { titulo: 'Cómo perdonar cuando duele', categoria: 'Perdón y restauración', red: 'Instagram', url: 'https://www.instagram.com/reel/PRUEBA/' },
      { titulo: '<img src=x onerror=alert(1)>', red: 'YouTube', url: 'https://youtube.com/shorts/x' },
      { titulo: 'Enlace inseguro', url: 'javascript:alert(1)' },
    ] }));
    assert.ok(await p.isVisible('#respuestas'));
    assert.strictEqual(await p.locator('.cj-video').count(), 2, 'descarta enlaces no https');
    assert.strictEqual(await p.locator('.cj-video img').count(), 0, 'el título se escapa como texto');
    await p.close();
  },
};

(async () => {
  const nav = await chromium.launch();
  let fallos = 0;
  for (const [nombre, fn] of Object.entries(pruebas)) {
    try { await fn(nav); console.log('✔ ' + nombre); }
    catch (err) { fallos++; console.log('✘ ' + nombre + '\n   ' + err.message.split('\n')[0]); }
  }
  await nav.close();
  console.log(`\n${Object.keys(pruebas).length - fallos}/${Object.keys(pruebas).length} pruebas superadas`);
  process.exit(fallos ? 1 : 0);
})();
