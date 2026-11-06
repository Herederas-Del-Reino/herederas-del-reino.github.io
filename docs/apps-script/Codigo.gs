/**
 * =====================================================================
 * HEREDERAS DEL REINO — «Pregúntale a la Pastora»
 * Backend en Google Apps Script, vinculado a la hoja privada de consultas.
 *
 * Este archivo NO contiene credenciales ni correos. Todo lo privado se
 * configura en: Configuración del proyecto → Propiedades del script.
 *
 *   CORREOS_ADMIN      (obligatoria) correos de la pastora y de la encargada
 *                      de redes, separados por coma.
 *   MAX_POR_HORA       (opcional, 40) consultas máximas aceptadas por hora.
 *   DIAS_CONSERVACION  (opcional) días que se conservan las consultas
 *                      «Cerrada» antes de eliminarlas con el menú.
 *   RECEPCION_ACTIVA   (obligatoria) "si" para aceptar consultas. Mientras no
 *                      diga "si", el servicio rechaza todo envío.
 *
 * Guía completa: docs/preguntale-a-la-pastora.md
 * =====================================================================
 */

var HOJA = 'Consultas';
var ENCABEZADOS = [
  'ID', 'Fecha', 'Nombre', 'Anónimo', 'Tema', 'Consulta', 'Correo',
  'Solicita respuesta', 'Autoriza publicación', 'Consentimiento', 'Estado',
  'Revisión de privacidad', 'Enlace del video', 'Plataforma', 'Fecha de publicación',
  'Fecha de notificación', 'Estado de envío', 'Observaciones internas', 'Clave de envío'
];
var COL = {};
ENCABEZADOS.forEach(function (n, i) { COL[n] = i + 1; });

var TEMAS = [
  'Mi relación con Dios', 'Familia y matrimonio', 'Perdón y restauración',
  'Mis emociones y preocupaciones', 'Mi propósito y llamado',
  'Oración y vida espiritual', 'Otra inquietud'
];
var ESTADOS = ['Recibida', 'En revisión', 'Seleccionada para video', 'Pendiente de publicación', 'Respondida', 'Cerrada'];
var PLATAFORMAS = ['Instagram', 'Facebook', 'YouTube', 'TikTok', 'Otra'];
var LIMITES = { nombre: 80, consulta: 3000, correo: 120, minimoConsulta: 10, tiempoMinimoMs: 3000 };
var RE_CORREO = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

/* ---------------------------------------------------------------------
   Servicio web
   --------------------------------------------------------------------- */

/** No existe lectura pública: GET solo confirma que el servicio responde. */
function doGet() {
  return respuesta_({ ok: true, servicio: 'Pregúntale a la Pastora' });
}

function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    if (String(props.getProperty('RECEPCION_ACTIVA') || '').toLowerCase() !== 'si') {
      return respuesta_({ ok: false, error: 'servidor' });
    }
    var datos;
    try { datos = JSON.parse((e && e.postData && e.postData.contents) || ''); } catch (err) { return respuesta_({ ok: false, error: 'validacion' }); }
    if (!datos || typeof datos !== 'object') return respuesta_({ ok: false, error: 'validacion' });

    // Trampas contra bots: campo oculto lleno o envío instantáneo → se responde "ok" sin guardar
    if (datos.sitio_web) return respuesta_({ ok: true, id: '' });
    if (!(Number(datos.tiempo) >= LIMITES.tiempoMinimoMs)) return respuesta_({ ok: false, error: 'muy_rapido' });

    var v = validar_(datos);
    if (!v.ok) return respuesta_({ ok: false, error: 'validacion' });
    var c = v.datos;

    var cache = CacheService.getScriptCache();
    // Duplicados: el mismo envío reintentado devuelve el mismo ID
    var previo = cache.get('clave:' + c.clave);
    if (previo) return respuesta_({ ok: true, id: previo });

    // Límite global por hora contra envíos masivos
    var max = Number(props.getProperty('MAX_POR_HORA')) || 40;
    var franja = 'cuenta:' + Utilities.formatDate(new Date(), 'America/Bogota', 'yyyyMMddHH');

    var bloqueo = LockService.getScriptLock();
    if (!bloqueo.tryLock(15000)) return respuesta_({ ok: false, error: 'servidor' });
    var id;
    try {
      previo = cache.get('clave:' + c.clave) || buscarClave_(c.clave);
      if (previo) { cache.put('clave:' + c.clave, previo, 21600); return respuesta_({ ok: true, id: previo }); }
      var cuenta = Number(cache.get(franja)) || 0;
      if (cuenta >= max) return respuesta_({ ok: false, error: 'limite' });

      id = nuevoId_();
      var hoja = hoja_();
      var fila = [];
      fila[COL['ID'] - 1] = id;
      fila[COL['Fecha'] - 1] = new Date();
      fila[COL['Nombre'] - 1] = c.anonimo ? '' : seguro_(c.nombre);
      fila[COL['Anónimo'] - 1] = c.anonimo ? 'Sí' : 'No';
      fila[COL['Tema'] - 1] = c.tema;
      fila[COL['Consulta'] - 1] = seguro_(c.consulta);
      fila[COL['Correo'] - 1] = c.solicitaRespuesta ? seguro_(c.correo) : '';
      fila[COL['Solicita respuesta'] - 1] = c.solicitaRespuesta ? 'Sí' : 'No';
      fila[COL['Autoriza publicación'] - 1] = c.autorizaPublicacion ? 'Sí' : 'No';
      fila[COL['Consentimiento'] - 1] = 'Sí';
      fila[COL['Estado'] - 1] = 'Recibida';
      fila[COL['Revisión de privacidad'] - 1] = false;
      for (var i = 0; i < ENCABEZADOS.length; i++) if (fila[i] === undefined) fila[i] = '';
      fila[COL['Clave de envío'] - 1] = c.clave;
      hoja.appendRow(fila);
      SpreadsheetApp.flush();
      cache.put('clave:' + c.clave, id, 21600);
      cache.put(franja, String(cuenta + 1), 3700);
    } finally {
      bloqueo.releaseLock();
    }

    // El aviso se envía después de guardar; si falla, la consulta ya quedó registrada
    try { avisarAdministradoras_(id, c.tema); }
    catch (err) { anotar_(id, 'Aviso a administradoras no enviado: ' + String(err && err.message || err).slice(0, 120)); }

    return respuesta_({ ok: true, id: id });
  } catch (err) {
    // Nunca se registra el contenido de la consulta en los registros
    console.error('doPost: ' + (err && err.name));
    return respuesta_({ ok: false, error: 'servidor' });
  }
}

/* ---------------------------------------------------------------------
   Validación del lado del servidor (no confía en el navegador)
   --------------------------------------------------------------------- */
function validar_(d) {
  var texto = function (x) { return typeof x === 'string' ? x.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim() : ''; };
  var c = {
    clave: texto(d.clave),
    anonimo: d.anonimo === true,
    nombre: texto(d.nombre),
    tema: texto(d.tema),
    consulta: texto(d.consulta),
    solicitaRespuesta: d.solicitaRespuesta === true,
    correo: texto(d.correo).toLowerCase(),
    autorizaPublicacion: d.autorizaPublicacion === true,
    consentimiento: d.consentimiento === true
  };
  if (!/^[\w-]{8,64}$/.test(c.clave)) return { ok: false, campo: 'clave' };
  if (typeof d.anonimo !== 'boolean' || typeof d.solicitaRespuesta !== 'boolean' || typeof d.autorizaPublicacion !== 'boolean') return { ok: false, campo: 'opciones' };
  if (!c.consentimiento) return { ok: false, campo: 'consentimiento' };
  if (TEMAS.indexOf(c.tema) === -1) return { ok: false, campo: 'tema' };
  if (c.consulta.length < LIMITES.minimoConsulta || c.consulta.length > LIMITES.consulta) return { ok: false, campo: 'consulta' };
  if (c.nombre.length > LIMITES.nombre) return { ok: false, campo: 'nombre' };
  if (c.anonimo) c.nombre = '';
  if (c.solicitaRespuesta) {
    if (c.correo.length > LIMITES.correo || !RE_CORREO.test(c.correo)) return { ok: false, campo: 'correo' };
  } else {
    c.correo = '';
  }
  return { ok: true, datos: c };
}

/** Evita que un texto se interprete como fórmula en la hoja (=, +, -, @). */
function seguro_(t) {
  t = String(t || '');
  return /^[=+\-@\t\r]/.test(t) ? "'" + t : t;
}

/* ---------------------------------------------------------------------
   Avisos a las administradoras (sin el texto de la consulta)
   --------------------------------------------------------------------- */
function avisarAdministradoras_(id, tema) {
  var destinos = String(PropertiesService.getScriptProperties().getProperty('CORREOS_ADMIN') || '')
    .split(',').map(function (x) { return x.trim(); }).filter(function (x) { return RE_CORREO.test(x); });
  if (!destinos.length) throw new Error('CORREOS_ADMIN sin configurar');
  var fecha = Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm');
  MailApp.sendEmail({
    to: destinos.join(','),
    subject: 'Nueva consulta | Herederas del Reino',
    name: 'Herederas del Reino',
    body: 'Se ha recibido una nueva consulta en Pregúntale a la Pastora.\n\n' +
          'ID: ' + id + '\n' +
          'Tema: ' + tema + '\n' +
          'Fecha: ' + fecha + '\n' +
          'Estado: Recibida.\n\n' +
          'Consulta el registro privado para revisar el mensaje.'
  });
}

/* ---------------------------------------------------------------------
   Envío del enlace del video a quien lo solicitó
   Se ejecuta desde el menú de la hoja (nunca de forma pública).
   --------------------------------------------------------------------- */
function enviarEnlacesPendientes() {
  var hoja = hoja_();
  var n = hoja.getLastRow() - 1;
  if (n < 1) return informar_('No hay consultas registradas.');
  var valores = hoja.getRange(2, 1, n, ENCABEZADOS.length).getValues();
  var enviados = 0, errores = 0, pendientesSinRevisar = 0;
  for (var i = 0; i < valores.length; i++) {
    var f = valores[i], filaHoja = i + 2;
    var correo = String(f[COL['Correo'] - 1] || '').trim();
    var enlace = String(f[COL['Enlace del video'] - 1] || '').trim();
    var yaEnviado = String(f[COL['Estado de envío'] - 1] || '') === 'Enviado' || f[COL['Fecha de notificación'] - 1];
    if (f[COL['Solicita respuesta'] - 1] !== 'Sí' || !enlace || yaEnviado) continue;
    if (f[COL['Revisión de privacidad'] - 1] !== true) { pendientesSinRevisar++; continue; }
    if (!RE_CORREO.test(correo)) { hoja.getRange(filaHoja, COL['Estado de envío']).setValue('Error: correo no válido'); errores++; continue; }
    if (!/^https:\/\/\S+$/.test(enlace)) { hoja.getRange(filaHoja, COL['Estado de envío']).setValue('Error: enlace no válido'); errores++; continue; }
    if (MailApp.getRemainingDailyQuota() < 1) { hoja.getRange(filaHoja, COL['Estado de envío']).setValue('Pendiente: cuota diaria de correo agotada'); break; }
    try {
      MailApp.sendEmail({
        to: correo,
        subject: 'Una enseñanza para tu corazón | Herederas del Reino',
        name: 'Herederas del Reino',
        body: 'Hija del Rey, gracias por confiar en este espacio.\n\n' +
              'Nuestra pastora ha compartido una enseñanza que puede ayudarte a reflexionar sobre la inquietud que nos enviaste.\n\n' +
              'Puedes verla aquí:\n' + enlace + '\n\n' +
              'Que la Palabra de Dios siga siendo luz para tu camino.\n\n' +
              'Con amor,\nHerederas del Reino'
      });
      hoja.getRange(filaHoja, COL['Fecha de notificación']).setValue(new Date());
      hoja.getRange(filaHoja, COL['Estado de envío']).setValue('Enviado');
      if (f[COL['Estado'] - 1] !== 'Cerrada') hoja.getRange(filaHoja, COL['Estado']).setValue('Respondida');
      enviados++;
    } catch (err) {
      hoja.getRange(filaHoja, COL['Estado de envío']).setValue('Error: ' + String(err && err.message || err).slice(0, 100));
      errores++;
    }
  }
  informar_('Enlaces enviados: ' + enviados + '. Con error: ' + errores +
            (pendientesSinRevisar ? '. Esperando revisión de privacidad: ' + pendientesSinRevisar : '') + '.');
}

/* ---------------------------------------------------------------------
   Eliminación de datos
   --------------------------------------------------------------------- */
function eliminarConsultaPorId() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt('Eliminar una consulta', 'Escribe el ID (por ejemplo HR-20261106-AB12). Esta acción no se puede deshacer.', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  var id = r.getResponseText().trim().toUpperCase();
  var hoja = hoja_();
  var n = hoja.getLastRow() - 1;
  var ids = n > 0 ? hoja.getRange(2, COL['ID'], n, 1).getValues() : [];
  for (var i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]).toUpperCase() === id) { hoja.deleteRow(i + 2); return informar_('Consulta ' + id + ' eliminada.'); }
  }
  informar_('No se encontró la consulta ' + id + '.');
}

function eliminarCerradasAntiguas() {
  var dias = Number(PropertiesService.getScriptProperties().getProperty('DIAS_CONSERVACION'));
  if (!(dias > 0)) return informar_('Primero define DIAS_CONSERVACION en las propiedades del script.');
  var limite = new Date(Date.now() - dias * 86400000);
  var hoja = hoja_();
  var n = hoja.getLastRow() - 1;
  if (n < 1) return informar_('No hay consultas registradas.');
  var valores = hoja.getRange(2, 1, n, ENCABEZADOS.length).getValues();
  var borradas = 0;
  for (var i = valores.length - 1; i >= 0; i--) {
    var fecha = valores[i][COL['Fecha'] - 1];
    if (valores[i][COL['Estado'] - 1] === 'Cerrada' && fecha instanceof Date && fecha < limite) { hoja.deleteRow(i + 2); borradas++; }
  }
  informar_('Consultas cerradas eliminadas: ' + borradas + '.');
}

/* ---------------------------------------------------------------------
   Preparación de la hoja y menú
   --------------------------------------------------------------------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Pregúntale a la Pastora')
    .addItem('Enviar enlaces de video pendientes', 'enviarEnlacesPendientes')
    .addSeparator()
    .addItem('Eliminar una consulta por ID', 'eliminarConsultaPorId')
    .addItem('Eliminar consultas cerradas antiguas', 'eliminarCerradasAntiguas')
    .addSeparator()
    .addItem('Configurar la hoja (solo la primera vez)', 'configurarHoja')
    .addToUi();
}

function configurarHoja() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.getSheetByName(HOJA) || libro.insertSheet(HOJA);
  hoja.getRange(1, 1, 1, ENCABEZADOS.length).setValues([ENCABEZADOS])
    .setFontWeight('bold').setBackground('#F4D6DE').setFontColor('#7A3346');
  hoja.setFrozenRows(1);
  var filas = Math.max(hoja.getMaxRows() - 1, 1);
  var lista = function (opciones) { return SpreadsheetApp.newDataValidation().requireValueInList(opciones, true).setAllowInvalid(false).build(); };
  hoja.getRange(2, COL['Estado'], filas, 1).setDataValidation(lista(ESTADOS));
  hoja.getRange(2, COL['Plataforma'], filas, 1).setDataValidation(lista(PLATAFORMAS));
  hoja.getRange(2, COL['Revisión de privacidad'], filas, 1).insertCheckboxes();
  hoja.getRange(2, COL['Fecha'], filas, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  hoja.getRange(2, COL['Fecha de publicación'], filas, 1).setNumberFormat('dd/MM/yyyy');
  hoja.getRange(2, COL['Fecha de notificación'], filas, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  hoja.getRange(2, COL['Consulta'], filas, 1).setWrap(true);
  hoja.setColumnWidth(COL['Consulta'], 420);
  hoja.hideColumns(COL['Clave de envío']);
  informar_('Hoja «' + HOJA + '» lista. Recuerda compartirla solo con la pastora y la encargada de redes.');
}

/* ---------------------------------------------------------------------
   Utilidades
   --------------------------------------------------------------------- */
function hoja_() {
  var id = PropertiesService.getScriptProperties().getProperty('HOJA_ID');
  var libro = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.getSheetByName(HOJA);
  if (!hoja) throw new Error('Falta la hoja ' + HOJA + '. Ejecuta «Configurar la hoja».');
  return hoja;
}

function buscarClave_(clave) {
  var hoja = hoja_();
  var n = Math.min(hoja.getLastRow() - 1, 300);
  if (n < 1) return '';
  var desde = hoja.getLastRow() - n + 1;
  var claves = hoja.getRange(desde, COL['Clave de envío'], n, 1).getValues();
  var ids = hoja.getRange(desde, COL['ID'], n, 1).getValues();
  for (var i = 0; i < claves.length; i++) if (claves[i][0] === clave) return ids[i][0];
  return '';
}

function anotar_(id, nota) {
  var hoja = hoja_();
  var n = hoja.getLastRow() - 1;
  var ids = hoja.getRange(2, COL['ID'], n, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) {
    if (ids[i][0] === id) { hoja.getRange(i + 2, COL['Observaciones internas']).setValue(nota); return; }
  }
}

function nuevoId_() {
  var letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
  for (var i = 0; i < 4; i++) s += letras.charAt(Math.floor(Math.random() * letras.length));
  return 'HR-' + Utilities.formatDate(new Date(), 'America/Bogota', 'yyyyMMdd') + '-' + s;
}

function respuesta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function informar_(texto) {
  try { SpreadsheetApp.getUi().alert(texto); } catch (e) { console.log(texto); }
}
