// Pruebas del backend (Codigo.gs) con servicios de Google simulados.
// Ejecutar: node docs/apps-script/pruebas/backend.test.cjs
const assert = require('assert');
const { crearEntorno } = require('./entorno.cjs');

const ACTIVA = { RECEPCION_ACTIVA: 'si', CORREOS_ADMIN: 'pastora@ejemplo.test, redes@ejemplo.test' };
let n = 0;
const base = (extra = {}) => ({
  clave: 'clave-prueba-' + (++n) + '-abcdef', anonimo: true, nombre: '', tema: 'Mi relación con Dios',
  consulta: 'Quisiera saber cómo acercarme más a Dios en medio de la prueba.', solicitaRespuesta: false, correo: '',
  autorizaPublicacion: false, consentimiento: true, sitio_web: '', tiempo: 45000, ...extra,
});

const pruebas = {
  'GET no expone datos'() {
    const e = crearEntorno(ACTIVA);
    e.post(base());
    const r = e.get();
    assert.deepStrictEqual(Object.keys(r).sort(), ['ok', 'servicio']);
  },
  'Recepción apagada rechaza todo envío'() {
    const e = crearEntorno({ CORREOS_ADMIN: 'a@b.co' });
    assert.strictEqual(e.post(base()).ok, false);
    assert.strictEqual(e.filas.length, 0);
  },
  'Consulta anónima se guarda como Recibida y avisa a las dos administradoras sin el texto'() {
    const e = crearEntorno(ACTIVA);
    const r = e.post(base({ nombre: 'No debería guardarse' }));
    assert.ok(r.ok); assert.match(r.id, /^HR-\d{8}-[A-Z2-9]{4}$/);
    const f = e.filas[0];
    assert.strictEqual(f[e.col('Nombre')], '');
    assert.strictEqual(f[e.col('Anónimo')], 'Sí');
    assert.strictEqual(f[e.col('Estado')], 'Recibida');
    assert.strictEqual(f[e.col('Consentimiento')], 'Sí');
    assert.strictEqual(e.correos.length, 1);
    assert.strictEqual(e.correos[0].to, 'pastora@ejemplo.test,redes@ejemplo.test');
    assert.strictEqual(e.correos[0].subject, 'Nueva consulta | Herederas del Reino');
    assert.ok(e.correos[0].body.includes(r.id) && e.correos[0].body.includes('Mi relación con Dios'));
    assert.ok(!e.correos[0].body.includes('acercarme'), 'el aviso no debe incluir la consulta');
  },
  'Consulta con nombre y correo'() {
    const e = crearEntorno(ACTIVA);
    const r = e.post(base({ anonimo: false, nombre: 'María', solicitaRespuesta: true, correo: 'Maria@Correo.com', autorizaPublicacion: true }));
    assert.ok(r.ok);
    const f = e.filas[0];
    assert.strictEqual(f[e.col('Nombre')], 'María');
    assert.strictEqual(f[e.col('Correo')], 'maria@correo.com');
    assert.strictEqual(f[e.col('Solicita respuesta')], 'Sí');
    assert.strictEqual(f[e.col('Autoriza publicación')], 'Sí');
  },
  'Si no pide respuesta, el correo no se guarda'() {
    const e = crearEntorno(ACTIVA);
    e.post(base({ solicitaRespuesta: false, correo: 'alguien@correo.com' }));
    assert.strictEqual(e.filas[0][e.col('Correo')], '');
  },
  'Validaciones: correo, consentimiento, tema, longitud, tipos'() {
    const e = crearEntorno(ACTIVA);
    const casos = [
      base({ solicitaRespuesta: true, correo: 'no-es-correo' }),
      base({ consentimiento: false }),
      base({ tema: 'Tema inventado' }),
      base({ consulta: 'corto' }),
      base({ consulta: 'x'.repeat(3001) }),
      base({ anonimo: 'si' }),
      base({ clave: '<script>' }),
      'esto no es JSON',
    ];
    casos.forEach((c) => assert.deepStrictEqual(e.post(c), { ok: false, error: 'validacion' }));
    assert.strictEqual(e.filas.length, 0);
  },
  'Envío instantáneo se rechaza'() {
    const e = crearEntorno(ACTIVA);
    assert.deepStrictEqual(e.post(base({ tiempo: 500 })), { ok: false, error: 'muy_rapido' });
  },
  'Campo trampa lleno: responde ok pero no guarda ni avisa'() {
    const e = crearEntorno(ACTIVA);
    assert.strictEqual(e.post(base({ sitio_web: 'http://spam' })).ok, true);
    assert.strictEqual(e.filas.length, 0); assert.strictEqual(e.correos.length, 0);
  },
  'Reintento con la misma clave no duplica'() {
    const e = crearEntorno(ACTIVA);
    const d = base();
    const a = e.post(d), b = e.post(d);
    assert.strictEqual(a.id, b.id); assert.strictEqual(e.filas.length, 1); assert.strictEqual(e.correos.length, 1);
    e.cache.clear();                                    // aun sin caché, la clave se encuentra en la hoja
    assert.strictEqual(e.post(d).id, a.id); assert.strictEqual(e.filas.length, 1);
  },
  'Texto que parece fórmula se guarda como texto'() {
    const e = crearEntorno(ACTIVA);
    e.post(base({ consulta: '=IMPORTXML("http://x","//a") quiero ayuda', anonimo: false, nombre: '+Ana' }));
    assert.ok(e.filas[0][e.col('Consulta')].startsWith("'="));
    assert.ok(e.filas[0][e.col('Nombre')].startsWith("'+"));
  },
  'Límite por hora'() {
    const e = crearEntorno({ ...ACTIVA, MAX_POR_HORA: '2' });
    assert.ok(e.post(base()).ok); assert.ok(e.post(base()).ok);
    assert.deepStrictEqual(e.post(base()), { ok: false, error: 'limite' });
    assert.strictEqual(e.filas.length, 2);
  },
  'Si falla el aviso, la consulta queda guardada y anotada'() {
    const e = crearEntorno(ACTIVA);
    e.fallarCorreos(true);
    const r = e.post(base());
    assert.ok(r.ok); assert.strictEqual(e.filas.length, 1);
    assert.match(e.filas[0][e.col('Observaciones internas')], /Aviso a administradoras no enviado/);
  },
  'Sin CORREOS_ADMIN la consulta se guarda y queda anotada'() {
    const e = crearEntorno({ RECEPCION_ACTIVA: 'si' });
    assert.ok(e.post(base()).ok);
    assert.match(e.filas[0][e.col('Observaciones internas')], /CORREOS_ADMIN/);
  },
  'Envío de enlaces: solo a quien lo pidió, con video y revisión de privacidad; sin duplicados'() {
    const e = crearEntorno(ACTIVA);
    e.post(base({ solicitaRespuesta: true, correo: 'lista@correo.com' }));         // 0: cumple todo
    e.post(base({ solicitaRespuesta: true, correo: 'sinrevisar@correo.com' }));    // 1: sin revisión de privacidad
    e.post(base({ solicitaRespuesta: false }));                                     // 2: no pidió respuesta
    e.post(base({ solicitaRespuesta: true, correo: 'sinvideo@correo.com' }));      // 3: sin enlace
    e.post(base({ solicitaRespuesta: true, correo: 'malenlace@correo.com' }));     // 4: enlace inseguro
    const c = (x) => e.col(x);
    e.filas[0][c('Enlace del video')] = 'https://www.instagram.com/reel/ABC'; e.filas[0][c('Revisión de privacidad')] = true;
    e.filas[1][c('Enlace del video')] = 'https://youtu.be/xyz';
    e.filas[2][c('Enlace del video')] = 'https://youtu.be/xyz'; e.filas[2][c('Revisión de privacidad')] = true;
    e.filas[4][c('Enlace del video')] = 'javascript:alert(1)'; e.filas[4][c('Revisión de privacidad')] = true;
    e.correos.length = 0;
    e.contexto.enviarEnlacesPendientes();
    assert.strictEqual(e.correos.length, 1);
    assert.strictEqual(e.correos[0].to, 'lista@correo.com');
    assert.strictEqual(e.correos[0].subject, 'Una enseñanza para tu corazón | Herederas del Reino');
    assert.ok(e.correos[0].body.includes('https://www.instagram.com/reel/ABC'));
    assert.strictEqual(e.filas[0][c('Estado de envío')], 'Enviado');
    assert.ok(e.filas[0][c('Fecha de notificación')] instanceof Date);
    assert.strictEqual(e.filas[0][c('Estado')], 'Respondida');
    assert.strictEqual(e.filas[1][c('Estado de envío')], '');
    assert.strictEqual(e.filas[4][c('Estado de envío')], 'Error: enlace no válido');
    e.contexto.enviarEnlacesPendientes();
    assert.strictEqual(e.correos.length, 1, 'no debe reenviar');
  },
  'Eliminación de consultas cerradas antiguas'() {
    const e = crearEntorno({ ...ACTIVA, DIAS_CONSERVACION: '30' });
    e.post(base()); e.post(base()); e.post(base());
    const c = (x) => e.col(x);
    e.filas[0][c('Estado')] = 'Cerrada'; e.filas[0][c('Fecha')] = new Date(Date.now() - 40 * 864e5);
    e.filas[1][c('Estado')] = 'Cerrada';                                   // reciente: se conserva
    e.filas[2][c('Fecha')] = new Date(Date.now() - 40 * 864e5);            // antigua pero abierta: se conserva
    const ids = e.filas.map((f) => f[0]);
    e.contexto.eliminarCerradasAntiguas();
    assert.deepStrictEqual(e.filas.map((f) => f[0]), ids.slice(1));
  },
};

let fallos = 0;
for (const [nombre, fn] of Object.entries(pruebas)) {
  try { fn(); console.log('✔ ' + nombre); }
  catch (err) { fallos++; console.log('✘ ' + nombre + '\n   ' + err.message); }
}
console.log(`\n${Object.keys(pruebas).length - fallos}/${Object.keys(pruebas).length} pruebas superadas`);
process.exit(fallos ? 1 : 0);
