/* =====================================================================
   PREGÚNTALE A LA PASTORA — interacciones de la página de consejería
   Sin dependencias. No guarda nada en el navegador (ni cookies ni
   localStorage) y nunca pone datos personales en la URL.
   ===================================================================== */
(function () {
  'use strict';
  const C = window.HR_CONFIG || {};
  const CJ = C.consejeria || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (t) => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  $('#anio').textContent = new Date().getFullYear();

  /* ---------- Navegación ---------- */
  const nav = $('#nav'), botonMenu = $('#nav-menu');
  botonMenu.addEventListener('click', () => {
    const abierta = nav.classList.toggle('abierta');
    botonMenu.setAttribute('aria-expanded', abierta);
    botonMenu.setAttribute('aria-label', abierta ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('#nav-enlaces a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('abierta'); botonMenu.setAttribute('aria-expanded', 'false'); }));
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('abierta')) botonMenu.click(); });

  /* ---------- Revelado suave ---------- */
  if (movimientoReducido || !('IntersectionObserver' in window)) {
    $$('.revelar').forEach(el => el.classList.add('visible'));
  } else {
    const revelador = new IntersectionObserver(entradas => {
      entradas.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); revelador.unobserve(en.target); } });
    }, { threshold: .1, rootMargin: '0px 0px -30px 0px' });
    $$('.revelar').forEach(el => revelador.observe(el));
  }

  /* ---------- Mariposas (mismas imágenes y vuelo del sitio principal) ---------- */
  if (!movimientoReducido) {
    const IMG = ['../assets/img/mariposa-1.webp', '../assets/img/mariposa-2.webp', '../assets/img/mariposa-3.webp'];
    $$('[data-mariposas]').forEach(cont => {
      const n = parseInt(cont.dataset.mariposas, 10) || 2;
      const bichos = Array.from({ length: n }, (_, i) => {
        const el = document.createElement('div'); el.className = 'mariposa';
        const tam = 38 + Math.random() * 34; el.style.setProperty('--tam', tam + 'px');
        el.style.setProperty('--aleteo', (0.34 + Math.random() * 0.18).toFixed(2) + 's');
        const img = new Image(); img.src = IMG[i % IMG.length]; img.alt = ''; el.append(img); cont.append(el);
        return { el, tam, x: Math.random(), y: .15 + Math.random() * .55, ang: Math.random() * 6.28, vel: .00038 + Math.random() * .0003, fase: Math.random() * 50 };
      });
      let visible = false, anterior = 0;
      const paso = (t) => {
        if (!visible || document.hidden) return;
        const dt = Math.min(48, t - (anterior || t)); anterior = t;
        const w = cont.clientWidth, h = cont.clientHeight;
        bichos.forEach(b => {
          b.fase += dt * .001;
          b.ang += Math.sin(b.fase * 1.2) * .012 + (Math.random() - .5) * .018;
          const cx = .5 - b.x, cy = .4 - b.y;
          if (Math.hypot(cx, cy) > .42) b.ang += (Math.atan2(cy, cx) - b.ang) * .03;
          b.x += Math.cos(b.ang) * b.vel * dt; b.y += Math.sin(b.ang) * b.vel * dt * .7;
          const giro = Math.cos(b.ang) < 0 ? -1 : 1;
          b.el.style.transform = `translate3d(${(b.x * w - b.tam / 2).toFixed(1)}px, ${(b.y * h).toFixed(1)}px, 0) scaleX(${giro}) rotate(${(Math.sin(b.fase * 2) * 8).toFixed(1)}deg)`;
        });
        requestAnimationFrame(paso);
      };
      new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) { anterior = 0; requestAnimationFrame(paso); } }).observe(cont);
    });
  }

  /* ---------- Formulario ---------- */
  const form = $('#form-consulta');
  const MAX = Number(CJ.maxCaracteres) || 3000;
  const ENDPOINT = typeof CJ.endpoint === 'string' && /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(CJ.endpoint.trim()) ? CJ.endpoint.trim() : '';
  const RE_CORREO = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
  const texto = $('#consulta-texto'), contador = $('#contador-consulta');
  const estado = $('#form-estado'), boton = $('#enviar');
  const inicio = Date.now();
  const nuevaClave = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  let clave = nuevaClave();    // se conserva en los reintentos para que el servidor descarte duplicados
  let enviando = false;

  texto.maxLength = MAX;
  const actualizarContador = () => {
    contador.textContent = `${texto.value.length} / ${MAX}`;
    contador.classList.toggle('cerca', texto.value.length > MAX * .9);
  };
  texto.addEventListener('input', actualizarContador); actualizarContador();

  if (!ENDPOINT) {
    const aviso = $('#form-estado-recepcion');
    aviso.textContent = 'La recepción de consultas se habilitará muy pronto. Puedes conocer el formulario, pero por ahora no se enviará ni guardará ninguna información.';
    aviso.hidden = false;
  }

  // Campos que aparecen según la elección
  const valor = (nombre) => (form.elements[nombre] && form.elements[nombre].value) || '';
  const sincronizar = () => {
    const conNombre = valor('identidad') === 'nombre';
    $('#bloque-nombre').hidden = !conNombre;
    if (!conNombre) $('#nombre').value = '';
    const conCorreo = valor('respuesta') === 'si';
    $('#bloque-correo').hidden = !conCorreo;
    if (!conCorreo) { $('#correo').value = ''; limpiarError('correo'); }
  };
  form.addEventListener('change', (e) => {
    sincronizar();
    const campo = e.target.name === 'consentimiento' ? 'consentimiento' : e.target.name;
    if (campo) limpiarError(campo === 'consulta' ? 'consulta' : campo);
  });

  function mostrarError(id, mensaje, control) {
    const p = $('#error-' + id); p.textContent = mensaje; p.hidden = false;
    if (control) control.setAttribute('aria-invalid', 'true');
  }
  function limpiarError(id) {
    const p = $('#error-' + id); if (p) { p.hidden = true; p.textContent = ''; }
    const control = { tema: '#tema', consulta: '#consulta-texto', correo: '#correo', consentimiento: '#consentimiento' }[id];
    if (control) $(control).removeAttribute('aria-invalid');
  }
  texto.addEventListener('input', () => limpiarError('consulta'));
  $('#correo').addEventListener('input', () => limpiarError('correo'));

  function validar() {
    ['identidad', 'tema', 'consulta', 'respuesta', 'correo', 'publicacion', 'consentimiento'].forEach(limpiarError);
    const errores = [];
    if (!valor('identidad')) { mostrarError('identidad', 'Elige cómo deseas compartir tu inquietud.'); errores.push(form.elements.identidad[0]); }
    if (!$('#tema').value) { mostrarError('tema', 'Elige el tema sobre el que necesitas orientación.', $('#tema')); errores.push($('#tema')); }
    const largo = texto.value.trim().length;
    if (largo < 10) { mostrarError('consulta', 'Cuéntanos un poco más (al menos 10 caracteres).', texto); errores.push(texto); }
    else if (largo > MAX) { mostrarError('consulta', `Tu mensaje supera los ${MAX} caracteres.`, texto); errores.push(texto); }
    if (!valor('respuesta')) { mostrarError('respuesta', 'Indícanos si deseas recibir la respuesta en tu correo.'); errores.push(form.elements.respuesta[0]); }
    else if (valor('respuesta') === 'si' && !RE_CORREO.test($('#correo').value.trim())) {
      mostrarError('correo', 'Escribe un correo válido, por ejemplo nombre@correo.com.', $('#correo')); errores.push($('#correo'));
    }
    if (!valor('publicacion')) { mostrarError('publicacion', 'Elige si autorizas o no compartir una versión anónima.'); errores.push(form.elements.publicacion[0]); }
    if (!$('#consentimiento').checked) { mostrarError('consentimiento', 'Para enviar tu consulta necesitamos tu autorización de tratamiento de datos.', $('#consentimiento')); errores.push($('#consentimiento')); }
    return errores;
  }

  function datos() {
    const conNombre = valor('identidad') === 'nombre';
    const conCorreo = valor('respuesta') === 'si';
    return {
      clave,
      anonimo: !conNombre,
      nombre: conNombre ? $('#nombre').value.trim() : '',
      tema: $('#tema').value,
      consulta: texto.value.trim(),
      solicitaRespuesta: conCorreo,
      correo: conCorreo ? $('#correo').value.trim() : '',
      autorizaPublicacion: valor('publicacion') === 'si',
      consentimiento: $('#consentimiento').checked,
      sitio_web: $('#sitio-web').value,
      tiempo: Date.now() - inicio
    };
  }

  const MENSAJES = {
    validacion: 'Revisa los datos del formulario e inténtalo de nuevo.',
    muy_rapido: 'Tómate un momento para revisar tu mensaje e inténtalo de nuevo.',
    limite: 'En este momento recibimos muchas consultas. Inténtalo de nuevo en unos minutos.',
    servidor: 'No pudimos guardar tu consulta. Inténtalo de nuevo en unos minutos.'
  };

  function exito(id) {
    form.reset(); sincronizar(); actualizarContador();
    form.hidden = true;
    const panel = $('#exito');
    $('#exito-id').textContent = id ? `Número de consulta: ${id}` : '';
    panel.hidden = false; panel.focus({ preventScroll: true });
    panel.scrollIntoView({ behavior: movimientoReducido ? 'auto' : 'smooth', block: 'center' });
    clave = nuevaClave();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (enviando) return;
    estado.textContent = ''; estado.classList.remove('error');
    const errores = validar();
    if (errores.length) { errores[0].focus(); estado.textContent = 'Revisa los campos marcados.'; estado.classList.add('error'); return; }
    const d = datos();
    if (d.sitio_web) { exito(''); return; }                      // bot: no se envía nada
    if (!ENDPOINT) {
      estado.textContent = 'La recepción de consultas aún no está activa: tu mensaje no se envió ni se guardó.';
      estado.classList.add('error'); return;
    }
    enviando = true; boton.disabled = true; boton.classList.add('enviando');
    $('.cj-enviar__texto', boton).textContent = 'Enviando tu consulta…';
    estado.textContent = 'Enviando tu consulta…';
    const control = new AbortController();
    const espera = setTimeout(() => control.abort(), 20000);
    try {
      // text/plain evita la consulta previa CORS que Apps Script no admite
      const r = await fetch(ENDPOINT, { method: 'POST', body: JSON.stringify(d), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow', signal: control.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
      const res = await r.json().catch(() => ({}));
      if (r.ok && res.ok) { estado.textContent = ''; exito(res.id); }
      else { estado.textContent = MENSAJES[res.error] || MENSAJES.servidor; estado.classList.add('error'); }
    } catch (err) {
      estado.textContent = err.name === 'AbortError'
        ? 'La conexión tardó demasiado. Tu consulta no se confirmó; inténtalo de nuevo.'
        : 'No pudimos conectar. Revisa tu conexión a internet e inténtalo de nuevo.';
      estado.classList.add('error');
    } finally {
      clearTimeout(espera); enviando = false; boton.disabled = false; boton.classList.remove('enviando');
      $('.cj-enviar__texto', boton).textContent = 'Enviar mi consulta';
    }
  });

  /* ---------- La Pastora responde ---------- */
  const ensenanzas = (Array.isArray(C.ensenanzas) ? C.ensenanzas : []).filter(v => v && v.titulo && /^https:\/\//.test(v.url || ''));
  if (ensenanzas.length) {
    $('#lista-ensenanzas').innerHTML = ensenanzas.map(v => `
      <li class="cj-video vidrio revelar visible">
        <div class="cj-video__miniatura">
          ${v.miniatura ? `<img src="../${esc(v.miniatura)}" alt="" loading="lazy" width="360" height="640">` : ''}
          <svg aria-hidden="true"><use href="#i-video"/></svg>
          ${v.red ? `<span class="cj-video__red">${esc(v.red)}</span>` : ''}
        </div>
        <div class="cj-video__cuerpo">
          ${v.categoria ? `<span class="cj-video__categoria">${esc(v.categoria)}</span>` : ''}
          <h3>${esc(v.titulo)}</h3>
          <a class="boton boton--claro" href="${esc(v.url)}" target="_blank" rel="noopener">Ver enseñanza<span class="sr"> (se abre en ${esc(v.red || 'una nueva pestaña')})</span></a>
        </div>
      </li>`).join('');
    $('#respuestas').hidden = false;
  }
})();
