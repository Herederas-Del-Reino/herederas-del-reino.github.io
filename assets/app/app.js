/* =====================================================================
   Capa de app de Herederas del Reino (se carga en todas las páginas)
   - Marca <html class="es-app"> cuando se abre desde el ícono instalado
   - Barra inferior: Inicio · Bienvenida · Oración · Pastora (solo en la app)
   - Registro del service worker y aviso «Hay una versión nueva»
   - Invitación a instalar: tarjeta en el inicio, botón flotante y pasos por teléfono
   - Aviso discreto cuando no hay conexión
   No guarda datos personales: solo recuerda si se cerró la invitación.
   ===================================================================== */
(function () {
  'use strict';
  var raiz = document.documentElement;
  var enApp = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  if (enApp) {
    raiz.classList.add('es-app');
    // Solo en la app: ocupar toda la pantalla y respetar el notch y la barra del iPhone
    var vista = document.querySelector('meta[name="viewport"]');
    if (vista && !/viewport-fit/.test(vista.content)) vista.content += ', viewport-fit=cover';
  }

  var CLAVE_OCULTO = 'hr-app-invitacion-cerrada';
  var DIAS_OCULTO = 30;
  var ruta = location.pathname.replace(/index\.html$/, '');

  var ICONOS = {
    inicio: '<path d="M4 11.2 12 4.8l8 6.4V19.4a1.6 1.6 0 0 1-1.6 1.6H15v-5.6H9V21H5.6A1.6 1.6 0 0 1 4 19.4Z"/>',
    bienvenida: '<path d="M6.5 21V10.8a5.5 5.5 0 0 1 11 0V21M4 21h16"/><path d="M14.4 15.6h.01" stroke-width="2.4"/>',
    oracion: '<path d="M12 3.2c1.9 2.3 2.8 3.9 2.8 5.3a2.8 2.8 0 0 1-5.6 0c0-1.4.9-3 2.8-5.3Z"/><path d="M9 13.5h6V21H9z"/><path d="M7 21h10"/>',
    pastora: '<path d="M20 11.6a8 8 0 0 1-11.5 7.2L4 20l1.2-4.2A8 8 0 1 1 20 11.6Z"/><path d="M12 14.6s-3-1.8-3-3.6a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 1.8-3 3.6-3 3.6Z"/>',
    compartir: '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-1"/>',
    cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
    nube: '<path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 8.5Z"/><path d="M4 4l16 16"/>'
  };
  var svg = function (n) { return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + ICONOS[n] + '</svg>'; };

  function crear(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function alListo(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  /* ---------- Barra inferior (solo en la app instalada) ---------- */
  function seccionActual() {
    if (ruta.indexOf('/sitio/bienvenida/') === 0) return 'bienvenida';
    if (ruta.indexOf('/consejeria/') === 0) return 'pastora';
    if (ruta === '/' && location.hash === '#muro') return 'oracion';
    if (ruta === '/') return 'inicio';
    return '';
  }
  function pintarActivo(barra) {
    var actual = seccionActual();
    Array.prototype.forEach.call(barra.querySelectorAll('a'), function (a) {
      if (a.dataset.seccion === actual) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  function crearBarra() {
    var items = [
      ['inicio', '/', 'Inicio'],
      ['bienvenida', '/sitio/bienvenida/', 'Bienvenida'],
      ['oracion', '/#muro', 'Oración'],
      ['pastora', '/consejeria/', 'Pastora']
    ];
    var barra = crear('<nav class="hr-barra-app" aria-label="Navegación de la app">' + items.map(function (i) {
      return '<a href="' + i[1] + '" data-seccion="' + i[0] + '">' + svg(i[0]) + '<span>' + i[2] + '</span></a>';
    }).join('') + '</nav>');
    document.body.appendChild(barra);
    pintarActivo(barra);
    addEventListener('hashchange', function () { pintarActivo(barra); });
    barra.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a) return;
      // Ya estamos en esa sección: volver arriba en lugar de recargar
      if (a.getAttribute('aria-current') === 'page' && a.dataset.seccion !== 'oracion') {
        e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (a.dataset.seccion === 'oracion' && ruta === '/') {
        e.preventDefault();
        var muro = document.getElementById('muro');
        if (muro) { history.replaceState(null, '', '#muro'); muro.scrollIntoView({ behavior: 'smooth' }); pintarActivo(barra); }
      }
      if (a.dataset.seccion === 'inicio' && ruta === '/' && location.hash) {
        e.preventDefault(); history.replaceState(null, '', '/'); window.scrollTo({ top: 0, behavior: 'smooth' }); pintarActivo(barra);
      }
    });
  }

  /* ---------- Avisos pequeños (versión nueva, sin conexión) ---------- */
  var aviso = null;
  function mostrarAviso(html, clase) {
    ocultarAviso();
    aviso = crear('<div class="hr-aviso-app ' + (clase || '') + '" role="status">' + html + '</div>');
    document.body.appendChild(aviso);
    requestAnimationFrame(function () { aviso && aviso.classList.add('visible'); });
    return aviso;
  }
  function ocultarAviso(clase) {
    if (!aviso || (clase && !aviso.classList.contains(clase))) return;
    var a = aviso; aviso = null; a.classList.remove('visible'); setTimeout(function () { a.remove(); }, 400);
  }

  /* ---------- Service worker y actualizaciones ---------- */
  var actualizando = false;
  function avisarVersionNueva(trabajador) {
    // En el navegador no se pregunta nada: la versión nueva se activa sola
    // y se verá en la próxima página. El aviso solo existe en la app instalada.
    if (!enApp) { trabajador.postMessage('ACTUALIZAR'); return; }
    var a = mostrarAviso('<span>Hay una versión nueva de la app.</span><button type="button">Actualizar</button>', 'hr-aviso-version');
    a.querySelector('button').addEventListener('click', function () {
      actualizando = true; this.disabled = true; this.textContent = 'Actualizando…';
      trabajador.postMessage('ACTUALIZAR');
    });
  }
  function registrar() {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(function (reg) {
      if (reg.waiting && navigator.serviceWorker.controller) avisarVersionNueva(reg.waiting);
      reg.addEventListener('updatefound', function () {
        var nuevo = reg.installing; if (!nuevo) return;
        nuevo.addEventListener('statechange', function () {
          if (nuevo.state === 'installed' && navigator.serviceWorker.controller) avisarVersionNueva(nuevo);
        });
      });
      var revisar = function () { reg.update().catch(function () {}); };
      document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') revisar(); });
      setInterval(revisar, 30 * 60 * 1000);
    }).catch(function (err) { console.warn('App: no se pudo activar el modo sin conexión', err); });
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (actualizando) location.reload();
    });
  }

  /* ---------- Invitación a instalar ----------
     - En el inicio: tarjeta destacada debajo de los botones principales,
       visible para toda visitante que aún no tenga la app.
     - Botón pequeño «Instalar app» flotante cuando esa tarjeta ya no se ve
       (y siempre en la Bienvenida).
     - Si el navegador permite instalar directo (Chrome, Edge, Samsung), abre
       la instalación; si no, muestra los pasos para su teléfono. */
  var ua = navigator.userAgent;
  var esIOS = /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var esAndroid = /android/i.test(ua);
  var enRedSocial = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Line\/|WhatsApp|TikTok|musical_ly|Snapchat|Pinterest/i.test(ua);
  var paginaDeInvitacion = ruta === '/' || ruta.indexOf('/sitio/bienvenida/') === 0;
  var puedeOfrecer = !enApp && paginaDeInvitacion;
  var eventoInstalar = null, invitacion = null, botonMini = null, tarjetaHero = null, heroVisible = false, yaInstalada = false;

  function leerOculto() { try { return Number(localStorage.getItem(CLAVE_OCULTO)) || 0; } catch (_) { return 0; } }
  function guardarOculto() { try { localStorage.setItem(CLAVE_OCULTO, String(Date.now())); } catch (_) {} }
  var tarjetaPermitida = function () { return Date.now() - leerOculto() > DIAS_OCULTO * 864e5; };

  function pasos() {
    var compartir = '<span class="hr-icono-texto">' + svg('compartir') + '</span>';
    if (enRedSocial && esIOS) return 'Toca <b>⋯</b> y elige <b>«Abrir en Safari»</b>. Luego toca ' + compartir + ' <b>Compartir</b> → <b>«Agregar a pantalla de inicio»</b>.';
    if (enRedSocial) return 'Toca <b>⋮</b> y elige <b>«Abrir en Chrome»</b> (o en el navegador). Luego toca <b>«Instalar app»</b> de nuevo.';
    if (esIOS) return 'Toca ' + compartir + ' <b>Compartir</b> y luego <b>«Agregar a pantalla de inicio»</b>.';
    if (esAndroid) return 'Abre el menú <b>⋮</b> del navegador y elige <b>«Instalar aplicación»</b> o <b>«Agregar a pantalla de inicio»</b>.';
    return 'Ábrela en <b>Chrome</b> o <b>Edge</b> y toca el ícono de instalar en la barra de direcciones (o menú ⋮ → <b>«Instalar Herederas»</b>).';
  }

  function instalar() {
    if (eventoInstalar) {
      var ev = eventoInstalar; eventoInstalar = null;
      ev.prompt();
      ev.userChoice.then(function (r) { if (r.outcome === 'accepted') marcarInstalada(); }).catch(function () {});
    } else {
      mostrarInvitacion(true);
    }
  }

  function mostrarInvitacion(aPedido) {
    if (invitacion || !puedeOfrecer || yaInstalada) return;
    if (!aPedido && !tarjetaPermitida()) return;
    var directo = !!eventoInstalar;
    invitacion = crear(
      '<aside class="hr-invitacion" role="dialog" aria-label="Instalar la app Herederas del Reino">' +
        '<img src="/assets/app/iconos/icono-192.png" alt="" width="52" height="52">' +
        '<div class="hr-invitacion__texto"><strong>Lleva Herederas del Reino contigo</strong><p>' +
          (directo ? 'Tenla en tu celular con un solo toque, como cualquier app.' : pasos()) + '</p></div>' +
        (directo ? '<button type="button" class="hr-invitacion__instalar">Instalar app</button>' : '') +
        '<button type="button" class="hr-invitacion__cerrar" aria-label="Cerrar">' + svg('cerrar') + '</button>' +
      '</aside>');
    document.body.appendChild(invitacion);
    actualizarMini();
    requestAnimationFrame(function () { invitacion && invitacion.classList.add('visible'); });
    invitacion.querySelector('.hr-invitacion__cerrar').addEventListener('click', function () {
      if (!aPedido) guardarOculto();
      cerrarInvitacion();
    });
    var boton = invitacion.querySelector('.hr-invitacion__instalar');
    if (boton) boton.addEventListener('click', function () { cerrarInvitacion(); instalar(); });
    if (aPedido) invitacion.querySelector('.hr-invitacion__cerrar').focus({ preventScroll: true });
  }
  function cerrarInvitacion() {
    if (!invitacion) return;
    var i = invitacion; invitacion = null; i.classList.remove('visible'); setTimeout(function () { i.remove(); }, 400);
    actualizarMini();
  }

  // Botón pequeño flotante: solo cuando la tarjeta del inicio no está a la vista
  function actualizarMini() {
    var ver = puedeOfrecer && !yaInstalada && !invitacion && !heroVisible;
    if (ver && !botonMini) {
      botonMini = crear('<button type="button" class="hr-instalar-mini" aria-label="Instalar la app Herederas del Reino">' +
        '<img src="/assets/app/iconos/icono-192.png" alt="" width="26" height="26"><span>Instalar app</span></button>');
      botonMini.addEventListener('click', instalar);
      document.body.appendChild(botonMini);
    }
    if (!botonMini) return;
    botonMini.hidden = !ver;
    if (ver) requestAnimationFrame(function () { botonMini && botonMini.classList.add('visible'); });
    else botonMini.classList.remove('visible');
  }

  function prepararTarjetaHero() {
    tarjetaHero = document.querySelector('.hr-instalar-hero');
    if (!tarjetaHero || !puedeOfrecer) return;
    tarjetaHero.hidden = false;
    tarjetaHero.addEventListener('click', instalar);
    heroVisible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; actualizarMini(); }).observe(tarjetaHero);
    }
  }

  function marcarInstalada() {
    yaInstalada = true; cerrarInvitacion();
    if (tarjetaHero) tarjetaHero.hidden = true;
    if (botonMini) { botonMini.remove(); botonMini = null; }
  }

  addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); eventoInstalar = e;
  });
  addEventListener('appinstalled', function () { guardarOculto(); marcarInstalada(); });

  /* ---------- Protección: la página no se deja incrustar en otros sitios ---------- */
  // Evita el «clickjacking»: dentro de un marco ajeno no se muestra nada.
  if (window.top !== window.self) {
    raiz.style.display = 'none';
    try { window.top.location.replace(window.location.href); } catch (_) { /* el navegador puede impedirlo */ }
  }

  /* ---------- Inicio ---------- */
  alListo(function () {
    if (enApp) crearBarra();
    registrar();
    if (puedeOfrecer) {
      prepararTarjetaHero();
      actualizarMini();
      // En la Bienvenida (sin tarjeta en el inicio) la invitación grande aparece una vez
      if (!tarjetaHero) setTimeout(function () { mostrarInvitacion(false); }, 6000);
      // Si la app ya está instalada en este teléfono, no se ofrece de nuevo
      if (navigator.getInstalledRelatedApps) {
        navigator.getInstalledRelatedApps().then(function (apps) { if (apps && apps.length) marcarInstalada(); }).catch(function () {});
      }
    }
    addEventListener('offline', function () {
      mostrarAviso(svg('nube') + '<span>Sin conexión. Verás lo último que se guardó; los formularios no se pueden enviar.</span>', 'hr-aviso-conexion');
    });
    addEventListener('online', function () { ocultarAviso('hr-aviso-conexion'); });
    if (navigator.onLine === false) window.dispatchEvent(new Event('offline'));
  });
})();
