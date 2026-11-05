/* =====================================================================
   Peticiones de oración — lectura compartida por el sitio y el muro.
   Lee el CSV publicado de la pestaña "Muro" y devuelve solo lo que
   se puede mostrar: un nombre corto (o anónimo) y la fecha.
   ===================================================================== */
(function () {
  const C = window.HR_CONFIG;

  const VERSICULOS = [
    { cita: "Jeremías 33:3",  texto: "“Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces.”" },
    { cita: "Mateo 21:22",    texto: "“Y todo lo que pidiereis en oración, creyendo, lo recibiréis.”" },
    { cita: "Mateo 7:7-8",    texto: "“Pedid, y se os dará; buscad, y hallaréis; llamad, y se os abrirá. Porque cualquiera que pide, recibe.”" },
    { cita: "Santiago 5:16",  texto: "“La oración eficaz del justo puede mucho.”" },
    { cita: "Marcos 11:24",   texto: "“Por tanto, os digo que todo lo que pidiereis orando, creed que lo recibiréis, y os vendrá.”" }
  ];

  // CSV con comillas, comas y saltos de línea dentro de los campos
  function parsearCSV(texto) {
    const filas = []; let fila = [], campo = '', comillas = false;
    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];
      if (comillas) {
        if (c === '"') { if (texto[i + 1] === '"') { campo += '"'; i++; } else comillas = false; }
        else campo += c;
      } else if (c === '"') comillas = true;
      else if (c === ',') { fila.push(campo); campo = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && texto[i + 1] === '\n') i++;
        fila.push(campo); filas.push(fila); fila = []; campo = '';
      } else campo += c;
    }
    if (campo !== '' || fila.length) { fila.push(campo); filas.push(fila); }
    return filas;
  }

  // "5/11/2026 8:18:38" (día/mes/año, formato de la hoja) → Date
  function leerFecha(marca) {
    const x = (marca || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/);
    if (!x) return null;
    const anio = x[3].length === 2 ? 2000 + +x[3] : +x[3];
    return new Date(anio, +x[2] - 1, +x[1], +(x[4] || 0), +(x[5] || 0));
  }

  function nombreVisible(bruto) {
    const P = C.privacidad;
    const limpio = (bruto || '').replace(/["“”<>]/g, '').replace(/\s+/g, ' ').trim();
    if (!limpio) return null;
    const capital = s => s.charAt(0).toLocaleUpperCase('es') + s.slice(1).toLocaleLowerCase('es');
    const partes = limpio.split(' ').map(capital);
    if (!P.soloPrimerNombre || partes.length === 1) return partes.join(' ').slice(0, 28);
    return `${partes[0]} ${partes[1].charAt(0)}.`;
  }

  /**
   * @param {{max?: number, soloHoy?: boolean}} opciones
   * @returns {Promise<Array<{clave:string, nombre:string, anonima:boolean, fecha:Date|null}>>}
   */
  async function cargarPeticiones(opciones = {}) {
    const { max = 30, soloHoy = false } = opciones;
    const url = C.hojaPeticionesCSV;
    if (!url) return [];
    const r = await fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const col = C.columnas, P = C.privacidad;
    const hoy = new Date().toDateString();

    return parsearCSV(await r.text()).slice(1)
      .filter(f => (f[col.fecha] || '').trim() !== '')
      .map((f, i) => {
        const fecha = leerFecha(f[col.fecha]);
        const confidencial = (f[col.privacidad] || '').toLowerCase().includes(P.palabraConfidencial);
        const nombre = confidencial ? null : nombreVisible(f[col.nombre]);
        return { clave: (f[col.fecha] || '') + '|' + i, nombre: nombre || P.nombreAnonimo, anonima: !nombre, fecha };
      })
      .filter(p => !soloHoy || (p.fecha && p.fecha.toDateString() === hoy))
      .reverse()
      .slice(0, max);
  }

  window.HR_PETICIONES = { cargarPeticiones, VERSICULOS };
})();
