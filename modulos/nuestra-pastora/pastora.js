/* ==========================================================================
   Módulo «Conoce a nuestra Pastora» — carrusel de seis historias.
   Sin bibliotecas. Un solo reloj: la animación CSS de la barra de progreso
   de la historia activa; al terminar (animationend) avanza a la siguiente.
   Así no hay temporizadores que se dupliquen ni que queden sueltos.
   ========================================================================== */
(function () {
  'use strict';

  var raiz = document.getElementById('historias');
  if (!raiz) return;

  var historias = Array.prototype.slice.call(raiz.querySelectorAll('.np-historia'));
  var barras = Array.prototype.slice.call(raiz.querySelectorAll('.np-progreso li'));
  var escenario = document.getElementById('np-escenario');
  var botonPausa = document.getElementById('np-pausa');
  var textoActual = document.getElementById('np-actual');
  var total = historias.length;
  var actual = 0;

  var movimientoReducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // La pausa elegida por la usuaria (botón) manda sobre todo lo demás.
  // Con movimiento reducido el carrusel empieza en pausa: ella decide cuándo avanzar.
  var pausaElegida = movimientoReducido;
  // Pausas momentáneas: cursor encima, foco de teclado, dedo presionando, pestaña oculta.
  var pausasMomentaneas = {};

  var control = new AbortController();
  var opciones = { signal: control.signal };

  /* ---------- Carga diferida de imágenes ---------- */
  function cargarImagenes(indice) {
    var h = historias[(indice + total) % total];
    if (!h) return;
    var imgs = h.querySelectorAll('img[data-src]');
    for (var i = 0; i < imgs.length; i++) {
      imgs[i].src = imgs[i].getAttribute('data-src');
      imgs[i].removeAttribute('data-src');
    }
  }

  /* ---------- Estado de reproducción ---------- */
  function enPausa() {
    if (pausaElegida) return true;
    for (var k in pausasMomentaneas) if (pausasMomentaneas[k]) return true;
    return false;
  }

  function actualizarReproduccion() {
    var pausa = enPausa();
    raiz.classList.toggle('en-pausa', pausa);
    // Mientras avanza solo, el lector de pantalla no anuncia cada cambio.
    escenario.setAttribute('aria-live', pausa ? 'polite' : 'off');
    var icono = botonPausa.querySelector('use');
    var texto = botonPausa.querySelector('.np-oculto');
    icono.setAttribute('href', pausaElegida ? '#ic-play' : '#ic-pausa');
    texto.textContent = pausaElegida ? 'Reproducir historias' : 'Pausar historias';
    botonPausa.setAttribute('aria-pressed', pausaElegida ? 'true' : 'false');
    if (!pausa && terminada) siguiente();
  }

  function pausarMomento(motivo, valor) {
    pausasMomentaneas[motivo] = valor;
    actualizarReproduccion();
  }

  /* ---------- Mostrar una historia ---------- */
  function mostrar(indice, haciaAtras) {
    indice = (indice + total) % total;
    actual = indice;
    terminada = false;
    raiz.classList.toggle('atras', !!haciaAtras);

    historias.forEach(function (h, i) {
      var activa = i === indice;
      h.classList.toggle('activa', activa);
      h.setAttribute('aria-hidden', activa ? 'false' : 'true');
      if ('inert' in h) h.inert = !activa;
    });

    barras.forEach(function (b, i) {
      b.classList.remove('activa');
      b.classList.toggle('vista', i < indice);
    });
    var barra = barras[indice];
    var duracion = Number(historias[indice].getAttribute('data-duracion')) || 10;
    barra.style.setProperty('--np-duracion', duracion + 's');
    void barra.offsetWidth; // reinicia la animación de la barra
    barra.classList.add('activa');

    textoActual.textContent = String(indice + 1);
    cargarImagenes(indice);
    cargarImagenes(indice + 1); // deja lista la siguiente
  }

  function siguiente() { mostrar(actual + 1, false); }
  function anterior() { mostrar(actual - 1, true); }

  /* ---------- Avance automático ---------- */
  var terminada = false; // la barra activa llegó al final mientras algo la pausaba
  barras.forEach(function (b) {
    b.addEventListener('animationend', function () {
      if (!b.classList.contains('activa')) return;
      if (enPausa()) terminada = true; else siguiente();
    }, opciones);
  });

  /* ---------- Botones ---------- */
  document.getElementById('np-siguiente').addEventListener('click', siguiente, opciones);
  document.getElementById('np-anterior').addEventListener('click', anterior, opciones);
  botonPausa.addEventListener('click', function () {
    pausaElegida = !pausaElegida;
    actualizarReproduccion();
  }, opciones);

  /* ---------- Teclado (cuando el foco está dentro del carrusel) ---------- */
  raiz.setAttribute('tabindex', '0');
  raiz.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); siguiente(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); anterior(); }
    else if (e.key === 'Home') { e.preventDefault(); mostrar(0, true); }
    else if (e.key === 'End') { e.preventDefault(); mostrar(total - 1, false); }
  }, opciones);

  /* ---------- Pausa al interactuar ---------- */
  raiz.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') pausarMomento('cursor', true); }, opciones);
  raiz.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') pausarMomento('cursor', false); }, opciones);
  raiz.addEventListener('focusin', function (e) {
    var teclado = false;
    try { teclado = e.target.matches(':focus-visible'); } catch (_) {}
    if (teclado) pausarMomento('foco', true);
  }, opciones);
  raiz.addEventListener('focusout', function (e) {
    if (!raiz.contains(e.relatedTarget)) pausarMomento('foco', false);
  }, opciones);

  /* ---------- Gestos táctiles: deslizar para cambiar, mantener para pausar ---------- */
  var inicio = null;
  escenario.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') return;
    inicio = { x: e.clientX, y: e.clientY };
    pausarMomento('toque', true);
  }, opciones);
  function soltar(e) {
    if (!inicio) return;
    var dx = e.clientX - inicio.x, dy = e.clientY - inicio.y;
    inicio = null;
    pausarMomento('toque', false);
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      if (dx < 0) siguiente(); else anterior();
    }
  }
  escenario.addEventListener('pointerup', soltar, opciones);
  escenario.addEventListener('pointercancel', function () { inicio = null; pausarMomento('toque', false); }, opciones);

  /* ---------- Pestaña oculta o página guardada en el historial ---------- */
  document.addEventListener('visibilitychange', function () { pausarMomento('oculta', document.hidden); }, opciones);
  window.addEventListener('pagehide', function () { pausarMomento('oculta', true); }, opciones);
  window.addEventListener('pageshow', function () { pausarMomento('oculta', document.hidden); }, opciones);

  /* ---------- Limpieza: quita todos los eventos de una vez ---------- */
  window.HRModuloPastora = {
    destruir: function () {
      control.abort();
      barras.forEach(function (b) { b.classList.remove('activa'); });
      raiz.classList.add('en-pausa');
    }
  };

  /* ---------- Inicio ---------- */
  mostrar(0, false);
  actualizarReproduccion();
})();
