// Entorno simulado de Google Apps Script para probar Codigo.gs en Node.
// Imita solo los servicios que usa el backend (hoja, caché, bloqueo, correo, propiedades).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function crearEntorno(propiedades = {}) {
  const filas = [];               // filas de la hoja (sin encabezado)
  let encabezado = null;
  const cache = new Map();
  const correos = [];
  let fallarCorreo = false;

  const hoja = {
    appendRow: (f) => filas.push(f.slice()),
    getLastRow: () => filas.length + 1,
    getMaxRows: () => 1000,
    deleteRow: (n) => filas.splice(n - 2, 1),
    getRange: (fila, col, nf = 1, nc = 1) => ({
      getValues: () => Array.from({ length: nf }, (_, i) => Array.from({ length: nc }, (_, j) => {
        const r = fila + i; if (r === 1) return encabezado ? encabezado[col - 1 + j] : '';
        const v = filas[r - 2]; return v ? v[col - 1 + j] : '';
      })),
      setValue: (v) => { filas[fila - 2][col - 1] = v; },
      setValues: (v) => { if (fila === 1) encabezado = v[0]; return this; },
    }),
  };
  const fmt = (d, _tz, f) => {
    const p = (n) => String(n).padStart(2, '0');
    return f.replace('yyyy', d.getFullYear()).replace('MM', p(d.getMonth() + 1)).replace('dd', p(d.getDate()))
      .replace('HH', p(d.getHours())).replace('mm', p(d.getMinutes()));
  };
  const contexto = {
    console: { log() {}, error() {} },
    Date, Math, JSON, String, Number, RegExp, Error,
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k in propiedades ? propiedades[k] : null) }) },
    CacheService: { getScriptCache: () => ({ get: (k) => (cache.has(k) ? cache.get(k) : null), put: (k, v) => cache.set(k, v) }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    Utilities: { formatDate: fmt },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({ getSheetByName: (n) => (n === 'Consultas' ? hoja : null) }),
      openById: () => ({ getSheetByName: () => hoja }),
      flush() {},
      getUi: () => { throw new Error('sin interfaz'); },
    },
    MailApp: {
      sendEmail: (m) => { if (fallarCorreo) throw new Error('Servicio de correo no disponible'); correos.push(m); },
      getRemainingDailyQuota: () => 100,
    },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (s) => ({ contenido: s, setMimeType() { return this; } }) },
  };
  vm.createContext(contexto);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'Codigo.gs'), 'utf8'), contexto, { filename: 'Codigo.gs' });

  return {
    filas, correos, cache, contexto,
    fallarCorreos: (s) => { fallarCorreo = s; },
    post: (cuerpo) => JSON.parse(contexto.doPost({ postData: { contents: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo) } }).contenido),
    get: () => JSON.parse(contexto.doGet().contenido),
    col: (nombre) => contexto.ENCABEZADOS.indexOf(nombre),
  };
}

module.exports = { crearEntorno };
