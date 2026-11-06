/* =====================================================================
   PREGÚNTALE A LA PASTORA — interacciones de la página de consejería
   El formulario es un Google Form incrustado (consejeria/index.html).
   Este archivo solo maneja menú, apariciones, mariposas y la galería.
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

  /* ---------- Formulario ----------
     Diseño propio; cada respuesta se envía al Google Form del ministerio.
     No guarda nada en el navegador ni pone datos en la URL. */
  const form = $('#form-consulta');
  const GF = (CJ.googleForm) || {};
  const MAX = Number(CJ.maxCaracteres) || 3000;
  const RE_CORREO = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
  const texto = $('#consulta-texto'), contador = $('#contador-consulta');
  const estado = $('#form-estado'), boton = $('#enviar'), exito = $('#exito');
  let enviando = false, enviado = false;

  texto.maxLength = MAX;
  const actualizarContador = () => {
    contador.textContent = `${texto.value.length} / ${MAX}`;
    contador.classList.toggle('cerca', texto.value.length > MAX * .9);
  };
  texto.addEventListener('input', actualizarContador); actualizarContador();

  const valor = (nombre) => (form.elements[nombre] && form.elements[nombre].value) || '';
  function sincronizar() {
    const conNombre = valor('identidad') === 'nombre';
    $('#bloque-nombre').hidden = !conNombre;
    if (!conNombre) $('#nombre').value = '';
    const conCorreo = valor('respuesta') === 'si';
    $('#bloque-correo').hidden = !conCorreo;
    if (!conCorreo) { $('#correo').value = ''; limpiarError('correo'); }
  }
  function mostrarError(id, mensaje, control) {
    const p = $('#error-' + id); p.textContent = mensaje; p.hidden = false;
    if (control) control.setAttribute('aria-invalid', 'true');
  }
  function limpiarError(id) {
    const p = $('#error-' + id); if (p) { p.hidden = true; p.textContent = ''; }
    const control = { tema: '#tema', consulta: '#consulta-texto', correo: '#correo', consentimiento: '#consentimiento' }[id];
    if (control) $(control).removeAttribute('aria-invalid');
  }
  form.addEventListener('change', (e) => { sincronizar(); if (e.target.name) limpiarError(e.target.name); });
  texto.addEventListener('input', () => limpiarError('consulta'));
  $('#correo').addEventListener('input', () => limpiarError('correo'));

  function validar() {
    ['identidad', 'tema', 'consulta', 'respuesta', 'correo', 'consentimiento'].forEach(limpiarError);
    const errores = [];
    if (!valor('identidad')) { mostrarError('identidad', 'Elige cómo deseas compartir tu inquietud.'); errores.push(form.elements.identidad[0]); }
    if (!$('#tema').value) { mostrarError('tema', 'Elige el tema sobre el que necesitas orientación.', $('#tema')); errores.push($('#tema')); }
    const largo = texto.value.trim().length;
    if (largo < 10) { mostrarError('consulta', 'Cuéntanos un poco más (al menos 10 caracteres).', texto); errores.push(texto); }
    if (!valor('respuesta')) { mostrarError('respuesta', 'Indícanos si deseas recibir la respuesta en tu correo.'); errores.push(form.elements.respuesta[0]); }
    else if (valor('respuesta') === 'si' && !RE_CORREO.test($('#correo').value.trim())) {
      mostrarError('correo', 'Escribe un correo válido, por ejemplo nombre@correo.com.', $('#correo')); errores.push($('#correo'));
    }
    if (!$('#consentimiento').checked) { mostrarError('consentimiento', 'Para enviar tu consulta necesitamos tu autorización de tratamiento de datos.', $('#consentimiento')); errores.push($('#consentimiento')); }
    return errores;
  }

  function cuerpo() {
    const c = GF.campos || {}, op = GF.opcionesIdentidad || {};
    const datos = new URLSearchParams();
    const conNombre = valor('identidad') === 'nombre';
    datos.append(c.identidad, conNombre ? op.nombre : op.anonima);
    if (conNombre && $('#nombre').value.trim()) datos.append(c.nombre, $('#nombre').value.trim());
    datos.append(c.tema, $('#tema').value);
    datos.append(c.consulta, texto.value.trim());
    if (valor('respuesta') === 'si') datos.append(c.correo, $('#correo').value.trim());
    return datos;
  }

  function mostrarExito() {
    enviado = true;
    form.reset(); sincronizar(); actualizarContador();
    form.hidden = true; exito.hidden = false;
    exito.focus({ preventScroll: true });
    $('.cj-formulario').scrollIntoView({ behavior: movimientoReducido ? 'auto' : 'smooth', block: 'center' });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (enviando || enviado) return;
    estado.textContent = ''; estado.classList.remove('error');
    const errores = validar();
    if (errores.length) { errores[0].focus(); estado.textContent = 'Revisa los campos marcados.'; estado.classList.add('error'); return; }
    if ($('#sitio-web').value) { mostrarExito(); return; }          // bot: no se envía nada
    if (!GF.envio || !GF.campos) { estado.textContent = 'El formulario no está configurado. Inténtalo más tarde.'; estado.classList.add('error'); return; }
    enviando = true; boton.disabled = true; boton.classList.add('enviando');
    $('.cj-enviar__texto', boton).textContent = 'Enviando tu consulta…';
    const control = new AbortController();
    const espera = setTimeout(() => control.abort(), 20000);
    try {
      // Google Forms no permite leer su respuesta desde otro sitio: si la conexión
      // se completa, la respuesta quedó registrada; si falla, se avisa y no se pierde el texto.
      await fetch(GF.envio, { method: 'POST', mode: 'no-cors', body: cuerpo(), signal: control.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
      mostrarExito();
    } catch (err) {
      estado.textContent = err.name === 'AbortError'
        ? 'La conexión tardó demasiado y no pudimos confirmar el envío. Inténtalo de nuevo.'
        : 'No pudimos enviar tu consulta. Revisa tu conexión a internet e inténtalo de nuevo.';
      estado.classList.add('error');
    } finally {
      clearTimeout(espera); enviando = false; boton.disabled = false; boton.classList.remove('enviando');
      $('.cj-enviar__texto', boton).textContent = 'Enviar mi consulta';
    }
  });

  $('#otra-consulta').addEventListener('click', () => {
    enviado = false; exito.hidden = true; form.hidden = false;
    form.elements.identidad[0].focus({ preventScroll: true });
    $('.cj-formulario').scrollIntoView({ behavior: movimientoReducido ? 'auto' : 'smooth', block: 'start' });
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
