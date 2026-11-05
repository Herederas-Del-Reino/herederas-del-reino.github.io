/* =====================================================================
   HEREDERAS DEL REINO — Interacciones del sitio
   Sin dependencias. Respeta prefers-reduced-motion.
   ===================================================================== */
(function () {
  'use strict';
  const C = window.HR_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const punteroFino = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const icono = (id) => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
  const esc = (t) => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Enlaces configurables ---------- */
  const enlaces = {
    instagram: C.instagram.url,
    youtube: C.youtube.url,
    zoom: C.zoom.url,
    formulario: C.formularioOracion
  };
  $$('[data-enlace]').forEach(a => { a.href = enlaces[a.dataset.enlace] || '#'; });
  $$('[data-texto="zoom-id"]').forEach(el => { el.textContent = C.zoom.id; });
  $('#anio').textContent = new Date().getFullYear();

  /* ---------- Navegación ---------- */
  const nav = $('#nav'), botonMenu = $('#nav-menu');
  const alHacerScroll = () => nav.classList.toggle('solida', scrollY > 40);
  alHacerScroll(); addEventListener('scroll', alHacerScroll, { passive: true });
  botonMenu.addEventListener('click', () => {
    const abierta = nav.classList.toggle('abierta');
    botonMenu.setAttribute('aria-expanded', abierta);
    botonMenu.setAttribute('aria-label', abierta ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('#nav-enlaces a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('abierta'); botonMenu.setAttribute('aria-expanded', 'false');
  }));
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('abierta')) botonMenu.click(); });

  // Sección activa en el menú
  const enlacesMenu = new Map($$('#nav-enlaces a[href^="#"]').map(a => [a.getAttribute('href').slice(1), a]));
  const observadorSeccion = new IntersectionObserver(entradas => {
    entradas.forEach(en => {
      const a = enlacesMenu.get(en.target.id);
      if (a && en.isIntersecting) { enlacesMenu.forEach(x => x.removeAttribute('aria-current')); a.setAttribute('aria-current', 'true'); }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section[id]').forEach(s => observadorSeccion.observe(s));

  /* ---------- Revelado al hacer scroll ---------- */
  const revelador = new IntersectionObserver(entradas => {
    entradas.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); revelador.unobserve(en.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  function observarRevelados(raiz = document) { $$('.revelar:not(.visible)', raiz).forEach(el => revelador.observe(el)); }

  /* ---------- Paralaje suave ---------- */
  const capasParalaje = $$('[data-paralaje]');
  if (!movimientoReducido && capasParalaje.length) {
    let pendiente = false;
    addEventListener('scroll', () => {
      if (pendiente) return; pendiente = true;
      requestAnimationFrame(() => {
        capasParalaje.forEach(el => {
          if (scrollY < innerHeight * 1.2) el.style.transform = `translate3d(0, ${scrollY * parseFloat(el.dataset.paralaje)}px, 0)`;
        });
        pendiente = false;
      });
    }, { passive: true });
  }

  /* ---------- Inclinación 3D (tarjetas) ---------- */
  function activarInclinacion(el, grados = 6) {
    if (movimientoReducido || !punteroFino) return;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateX(${(-y * grados).toFixed(2)}deg) rotateY(${(x * grados).toFixed(2)}deg) translateY(-4px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  }
  $$('.inclinar').forEach(el => activarInclinacion(el, 4));

  /* ---------- Mariposas con vuelo natural ---------- */
  const IMAGENES_MARIPOSA = ['assets/img/mariposa-1.webp', 'assets/img/mariposa-2.webp', 'assets/img/mariposa-3.webp'];
  function crearMariposas(contenedor) {
    if (movimientoReducido) return;
    const n = parseInt(contenedor.dataset.mariposas, 10) || 2;
    const bichos = [];
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div');
      el.className = 'mariposa';
      const tam = 38 + Math.random() * 40;
      el.style.setProperty('--tam', tam + 'px');
      el.style.setProperty('--aleteo', (0.28 + Math.random() * 0.22).toFixed(2) + 's');
      el.innerHTML = `<img src="${IMAGENES_MARIPOSA[i % 3]}" alt="" loading="lazy" decoding="async">`;
      contenedor.appendChild(el);
      bichos.push({ el, x: Math.random(), y: .15 + Math.random() * .6, ang: Math.random() * Math.PI * 2, vel: .00045 + Math.random() * .0004, fase: Math.random() * 100, tam });
    }
    let visible = false, anterior = 0;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) requestAnimationFrame(paso); }).observe(contenedor);
    function paso(t) {
      if (!visible || document.hidden) return;
      const dt = Math.min(48, t - (anterior || t)); anterior = t;
      const w = contenedor.clientWidth, h = contenedor.clientHeight;
      bichos.forEach(b => {
        b.fase += dt * .001;
        b.ang += Math.sin(b.fase * 1.3) * .012 + (Math.random() - .5) * .02;
        // suave atracción hacia el centro para que no se escapen
        const cx = .5 - b.x, cy = .45 - b.y;
        b.ang += (Math.atan2(cy, cx) - b.ang) * (Math.hypot(cx, cy) > .42 ? .03 : 0);
        b.x += Math.cos(b.ang) * b.vel * dt;
        b.y += Math.sin(b.ang) * b.vel * dt * .7 + Math.sin(b.fase * 4) * .0004;
        const giro = Math.cos(b.ang) < 0 ? -1 : 1;
        b.el.style.transform = `translate3d(${(b.x * w - b.tam / 2).toFixed(1)}px, ${(b.y * h).toFixed(1)}px, 0) scaleX(${giro}) rotate(${(Math.sin(b.fase * 2) * 10).toFixed(1)}deg)`;
      });
      requestAnimationFrame(paso);
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) { anterior = 0; requestAnimationFrame(paso); } });
  }
  $$('[data-mariposas]').forEach(crearMariposas);

  /* =====================================================================
     ENCUENTROS — horarios en Colombia, España, Argentina y hora local
     ===================================================================== */
  const ICONOS_ENCUENTRO = { biblia: 'i-biblia', amigas: 'i-amigas', corona: 'i-corona' };
  const OFFSET_BOGOTA = -5; // Colombia no tiene horario de verano
  const zonaUsuaria = Intl.DateTimeFormat().resolvedOptions().timeZone || C.zonaHorariaBase;

  function proximaOcurrencia(e, ahora = new Date()) {
    const [hh, mm] = e.hora.split(':').map(Number);
    const bog = new Date(ahora.getTime() + OFFSET_BOGOTA * 3600e3); // reloj de Bogotá en campos UTC
    for (let d = 0; d < 8; d++) {
      const dia = new Date(Date.UTC(bog.getUTCFullYear(), bog.getUTCMonth(), bog.getUTCDate() + d));
      if (!e.diasSemana.includes(dia.getUTCDay())) continue;
      const instante = new Date(Date.UTC(dia.getUTCFullYear(), dia.getUTCMonth(), dia.getUTCDate(), hh - OFFSET_BOGOTA, mm));
      if (instante.getTime() + 60 * 60e3 > ahora.getTime()) return instante; // en curso cuenta hasta 1 h
    }
    return null;
  }
  function horaEn(instante, zona) {
    return new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: zona }).format(instante)
      .replace(/ /g, ' ');
  }
  function fechaClave(instante, zona) {
    return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: zona }).format(instante);
  }
  function desfaseDia(instante, zona) {
    const a = new Date(fechaClave(instante, zona)), b = new Date(fechaClave(instante, C.zonaHorariaBase));
    const d = Math.round((a - b) / 864e5);
    return d > 0 ? ' (+1)' : d < 0 ? ' (−1)' : '';
  }
  function textoProximo(instante) {
    const ahora = Date.now(), dif = instante.getTime() - ahora;
    if (dif <= 0) return 'En curso ahora';
    const hoyU = fechaClave(new Date(), zonaUsuaria), diaU = fechaClave(instante, zonaUsuaria);
    const manana = fechaClave(new Date(ahora + 864e5), zonaUsuaria);
    if (dif < 3600e3) return `Comienza en ${Math.max(1, Math.round(dif / 60e3))} min`;
    if (diaU === hoyU) return `Hoy · en ${Math.round(dif / 3600e3)} h`;
    if (diaU === manana) return `Mañana a las ${horaEn(instante, zonaUsuaria)}`;
    return 'Próximo: ' + new Intl.DateTimeFormat('es-CO', { weekday: 'long', timeZone: zonaUsuaria }).format(instante);
  }
  function nombreZona(zona) {
    return (zona.split('/').pop() || zona).replace(/_/g, ' ');
  }

  function pintarEncuentros(yaVisibles = false) {
    const lista = $('#lista-encuentros');
    lista.innerHTML = C.encuentros.map((e, i) => {
      const inst = proximaOcurrencia(e);
      const base = horaEn(inst, C.zonaHorariaBase);
      const enLocal = zonaUsuaria !== C.zonaHorariaBase && !['America/Bogota', 'America/Lima', 'America/Guayaquil'].includes(zonaUsuaria);
      return `
      <article class="encuentro vidrio revelar${yaVisibles ? ' visible' : ''}" data-retraso="${Math.min(i, 3)}">
        <div class="encuentro__icono">${icono(ICONOS_ENCUENTRO[e.icono])}</div>
        <div>
          <h3>${esc(e.titulo)}</h3>
          <p class="encuentro__desc">${esc(e.descripcion)}</p>
          <span class="encuentro__proximo">${textoProximo(inst)}</span>
        </div>
        <div class="encuentro__cuando">
          <p class="encuentro__dia">${icono('i-calendario').replace('<svg', '<svg width="20" height="20"')}${esc(e.dias)}</p>
          <p class="encuentro__hora">${base}</p>
          <p class="encuentro__tuya">${enLocal ? `En tu hora (${esc(nombreZona(zonaUsuaria))}): <strong>${horaEn(inst, zonaUsuaria)}${desfaseDia(inst, zonaUsuaria)}</strong>` : 'Hora de Colombia'}</p>
        </div>
        <div class="encuentro__paises" aria-label="Horario por país">
          <span><svg class="bandera" aria-hidden="true"><use href="#b-col"/></svg>COL: ${base}</span>
          <span><svg class="bandera" aria-hidden="true"><use href="#b-esp"/></svg>ESP: ${horaEn(inst, 'Europe/Madrid')}${desfaseDia(inst, 'Europe/Madrid')}</span>
          <span><svg class="bandera" aria-hidden="true"><use href="#b-arg"/></svg>ARG: ${horaEn(inst, 'America/Argentina/Buenos_Aires')}${desfaseDia(inst, 'America/Argentina/Buenos_Aires')}</span>
        </div>
      </article>`;
    }).join('');
    $$('.encuentro', lista).forEach(el => activarInclinacion(el, 3));
    observarRevelados(lista);
  }
  pintarEncuentros();
  setInterval(() => pintarEncuentros($('#lista-encuentros .visible') !== null), 60e3); // refresca "Hoy · en 2 h"

  /* =====================================================================
     JARDÍN DE ORACIÓN — cada petición es una flor con una pequeña corona
     ===================================================================== */
  const ROSAS = [
    { p: '#F4D6DE', b: '#D99BAB', c: '#E8B4C2' }, { p: '#E8B4C2', b: '#B86A80', c: '#F4D6DE' },
    { p: '#F3C7B5', b: '#C98E7A', c: '#F4D6DE' }, { p: '#FFF6EF', b: '#D9B9AE', c: '#F3C7B5' }
  ];
  const azar = (semilla, n) => { const x = Math.sin(semilla * 9301 + n * 49297) * 233280; return x - Math.floor(x); };

  // Flor de la petición: tallo, hojas, flor y una corona pequeña posada sobre ella
  function svgPeticion(semilla) {
    const c = ROSAS[semilla % ROSAS.length], curva = (azar(semilla, 1) - .5) * 10;
    let petalos = '';
    for (let i = 0; i < 6; i++) {
      petalos += `<ellipse cx="22" cy="31" rx="6.2" ry="9.5" fill="${i % 2 ? c.p : c.c}" stroke="${c.b}" stroke-width=".7" transform="rotate(${i * 60 + azar(semilla, 2) * 20} 22 40)"/>`;
    }
    return `<svg viewBox="0 0 44 100" aria-hidden="true">
      <path d="M22 100 C ${22 + curva} 82, ${22 - curva} 62, 22 44" fill="none" stroke="#9AA57C" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M22 80 q -12 -4 -15 -14 q 11 1 15 14Z" fill="#B3BC93"/>
      <path d="M22 70 q 11 -3 14 -12 q -10 0 -14 12Z" fill="#A4AF84"/>
      <g class="flor__capullo">${petalos}<circle cx="22" cy="40" r="4.2" fill="#D4AF37"/></g>
      <g class="flor__corona"><path d="M12.5 30 14 19.5l4.5 4.5L22 16l3.5 8 4.5-4.5L31.5 30Z" fill="#F7CAD5" stroke="#B86A80" stroke-width=".9" stroke-linejoin="round"/>
      <rect x="12.5" y="30" width="19" height="3" rx="1.5" fill="#C9798D"/>
      <circle cx="14" cy="18.6" r="1.4" fill="#D4AF37"/><circle cx="22" cy="15" r="1.6" fill="#D4AF37"/><circle cx="30" cy="18.6" r="1.4" fill="#D4AF37"/></g>
    </svg>`;
  }
  // Flores decorativas (sin corona) para dar profundidad al paisaje
  function svgDeco(semilla) {
    const c = ROSAS[semilla % ROSAS.length];
    let p = '';
    for (let i = 0; i < 5; i++) p += `<ellipse cx="20" cy="22" rx="6" ry="9" fill="${c.c}" opacity=".9" transform="rotate(${i * 72} 20 30)"/>`;
    return `<svg viewBox="0 0 40 90" aria-hidden="true"><path d="M20 90 C 23 70, 17 52, 20 34" fill="none" stroke="#B3BC93" stroke-width="1.5"/>${p}<circle cx="20" cy="30" r="3.4" fill="#E7DCC6"/></svg>`;
  }

  const escena = $('#jardin-escena'), marco = $('#jardin-marco'), floresCont = $('#jardin-flores');
  const decoCont = $('#jardin-deco'), petalosCont = $('#jardin-petalos'), contadorJ = $('#jardin-contador');
  const tarjeta = $('#oracion-tarjeta'), tInicio = $('#oracion-inicio'), tDetalle = $('#oracion-detalle');
  const tNombre = $('#oracion-nombre'), tFecha = $('#oracion-fecha'), tVerso = $('#oracion-verso');
  const bUnirme = $('#oracion-unirme'), tGracias = $('#oracion-gracias');
  const flores = new Map(); let seleccion = null;

  // Oraciones de esta visitante (solo en su dispositivo; evita duplicados)
  const CLAVE_LOCAL = 'hr-oraciones-unidas';
  const leerUnidas = () => { try { return new Set(JSON.parse(localStorage.getItem(CLAVE_LOCAL) || '[]')); } catch (_) { return new Set(); } };
  const unidas = leerUnidas();
  const guardarUnidas = () => { try { localStorage.setItem(CLAVE_LOCAL, JSON.stringify([...unidas])); } catch (_) {} };
  const pintarMias = () => { $('#ind-mias').textContent = unidas.size; };
  pintarMias();

  const fmtFecha = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long' });
  function textoFecha(f) {
    if (!f) return '';
    const hoy = new Date(), ayer = new Date(Date.now() - 864e5);
    if (f.toDateString() === hoy.toDateString()) return 'Compartida hoy';
    if (f.toDateString() === ayer.toDateString()) return 'Compartida ayer';
    return 'Compartida el ' + fmtFecha.format(f);
  }

  function pintarBoton(clave) {
    const ya = unidas.has(clave);
    bUnirme.disabled = ya;
    bUnirme.classList.toggle('unida', ya);
    bUnirme.innerHTML = ya ? `${icono('i-check')}<span>Te uniste en oración</span>` : `${icono('i-corazon')}<span>Me uno en oración</span>`;
    tGracias.hidden = !ya;
  }

  function seleccionar(clave) {
    const f = flores.get(clave); if (!f) return;
    if (seleccion) flores.get(seleccion)?.el.classList.remove('activa');
    seleccion = clave; f.el.classList.add('activa');
    tInicio.hidden = true; tDetalle.hidden = false;
    tNombre.textContent = f.p.nombre;
    tFecha.textContent = textoFecha(f.p.fecha);
    tVerso.innerHTML = `${esc(f.v.texto)}<cite>${esc(f.v.cita)}</cite>`;
    pintarBoton(clave);
    tarjeta.classList.remove('cambio'); void tarjeta.offsetWidth; tarjeta.classList.add('cambio');
    // En celular la tarjeta queda debajo del jardín: la acercamos con suavidad
    if (innerWidth < 900 && !document.fullscreenElement) {
      const r = tarjeta.getBoundingClientRect();
      if (r.top > innerHeight - 120) tarjeta.scrollIntoView({ behavior: movimientoReducido ? 'auto' : 'smooth', block: 'nearest' });
    }
  }

  function lluviaDePetalos(el) {
    if (movimientoReducido) return;
    const re = escena.getBoundingClientRect(), rf = el.getBoundingClientRect();
    const x = rf.left + rf.width / 2 - re.left, y = rf.top + rf.height * .3 - re.top;
    const halo = document.createElement('span');
    halo.className = 'halo'; halo.style.left = x + 'px'; halo.style.top = y + 'px';
    petalosCont.appendChild(halo);
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('i');
      const ang = (Math.PI * 2 * i) / 18 + Math.random() * .4, dist = 50 + Math.random() * 90;
      p.style.left = x + 'px'; p.style.top = y + 'px';
      p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(ang) * dist - 40 + 'px');
      p.style.setProperty('--giro', (Math.random() * 360 - 180) + 'deg');
      p.style.setProperty('--color', ['#E8B4C2', '#F4D6DE', '#F3C7B5', '#D4AF37'][i % 4]);
      p.style.animationDelay = (Math.random() * .15) + 's';
      petalosCont.appendChild(p);
    }
    setTimeout(() => { petalosCont.innerHTML = ''; }, 2600);
  }

  bUnirme.addEventListener('click', () => {
    if (!seleccion || unidas.has(seleccion)) return;      // una sola vez por petición y dispositivo
    unidas.add(seleccion); guardarUnidas(); pintarMias();
    const f = flores.get(seleccion);
    f.el.classList.add('acompanada');
    lluviaDePetalos(f.el);
    pintarBoton(seleccion);
  });

  // Distribución equilibrada por planos (fondo → frente), adaptable a cualquier cantidad
  function distribuir(lista) {
    const ancho = escena.clientWidth || 800;
    const maxFila = Math.max(2, Math.floor(ancho / (ancho < 600 ? 92 : 112)));
    // Siempre al menos 2-3 planos para que el jardín tenga profundidad, aunque haya pocas peticiones
    const filas = Math.max(1, Math.ceil(lista.length / maxFila), Math.min(3, Math.ceil(lista.length / 3)));
    const porFila = Math.ceil(lista.length / filas);
    const posiciones = [];
    lista.forEach((p, i) => {
      const fila = Math.floor(i / porFila);                          // 0 = frente (las más recientes)
      const enFila = Math.min(porFila, lista.length - fila * porFila);
      const k = i % porFila;
      const prof = filas === 1 ? 1 : 1 - fila / (filas - 1);         // 1 frente · 0 fondo
      const desfase = fila % 2 ? .5 : 0;
      const semilla = [...p.clave].reduce((a, c) => a + c.charCodeAt(0), 0);
      // filas pares: centradas en su espacio · filas impares: intercaladas entre las de adelante
      const t = desfase ? (k + 1) / (enFila + 1) : (k + .5) / enFila;
      const x = 8 + 84 * t + (azar(semilla, 3) - .5) * Math.min(4, 50 / enFila);
      const y = filas === 1 ? 84 : 52 + prof * 38;
      posiciones.push({ x: Math.max(6, Math.min(94, x)), y, prof, semilla });
    });
    return posiciones;
  }

  function pintarDeco() {
    if (decoCont.childElementCount) return;
    const sitios = [
      [4, 66, .5, 1.2], [15, 58, .3, 1.6], [27, 62, .25, 1.4], [44, 57, .2, 1.8], [61, 60, .25, 1.5], [78, 57, .3, 1.6], [93, 64, .45, 1.2],
      [10, 82, .6, .6], [52, 79, .5, .7], [88, 84, .6, .6],
      [2, 99, 1.25, 2.4], [97, 101, 1.35, 2.6]
    ];
    decoCont.innerHTML = sitios.map(([x, y, s, b], i) =>
      `<span class="deco" style="left:${x}%;top:${y}%;--s:${s};--b:${b}px;--retraso:${-i * .9}s">${svgDeco(i * 7 + 3)}</span>`).join('');
  }

  function cargarJardin(lista, primera) {
    pintarDeco();
    const claves = new Set(lista.map(p => p.clave));
    flores.forEach((f, k) => { if (!claves.has(k)) { f.el.remove(); flores.delete(k); } });
    const pos = distribuir(lista);
    lista.forEach((p, i) => {
      let f = flores.get(p.clave);
      if (!f) {
        const el = document.createElement('button');
        el.type = 'button'; el.className = 'flor' + (primera ? '' : ' brotar');
        el.setAttribute('role', 'listitem');
        el.setAttribute('aria-label', `Sostener en oración la petición de ${p.nombre}`);
        el.innerHTML = `<span class="flor__planta">${svgPeticion(pos[i].semilla)}</span><span class="flor__nombre"></span>`;
        el.querySelector('.flor__nombre').textContent = p.nombre;
        el.style.setProperty('--mecer', (5 + azar(pos[i].semilla, 4) * 3).toFixed(2) + 's');
        el.style.setProperty('--retraso', (-azar(pos[i].semilla, 5) * 6).toFixed(2) + 's');
        el.addEventListener('click', () => seleccionar(p.clave));
        if (unidas.has(p.clave)) el.classList.add('acompanada');
        floresCont.appendChild(el);
        f = { el, p, v: HR_PETICIONES.VERSICULOS[pos[i].semilla % HR_PETICIONES.VERSICULOS.length] };
        flores.set(p.clave, f);
      }
      f.p = p;
      const q = pos[i];
      f.el.style.left = q.x + '%';
      f.el.style.top = q.y + '%';
      f.el.style.zIndex = 10 + Math.round(q.prof * 80);
      f.el.style.setProperty('--escala', (.72 + q.prof * .38).toFixed(2));
      f.el.style.setProperty('--prof', (q.prof - .5).toFixed(2));
      f.el.style.setProperty('--desenfoque', ((1 - q.prof) * .6).toFixed(2) + 'px');
      f.el.classList.toggle('lejana', q.prof < .34 && lista.length > 8);
    });
    const n = lista.length;
    const hoy = lista.filter(p => p.fecha && p.fecha.toDateString() === new Date().toDateString()).length;
    $('#ind-total').textContent = n;
    $('#ind-hoy').textContent = hoy;
    contadorJ.textContent = n ? '' : 'El jardín espera su primera petición.';
    contadorJ.hidden = !!n;
    escena.dataset.cantidad = n;
  }

  if (!movimientoReducido && punteroFino) {
    escena.addEventListener('pointermove', e => {
      const r = escena.getBoundingClientRect();
      escena.style.setProperty('--mx', (((e.clientX - r.left) / r.width - .5) * 2).toFixed(3));
    });
    escena.addEventListener('pointerleave', () => escena.style.setProperty('--mx', 0));
  }
  // Las plantas se adaptan al ancho (celular → más pequeñas) y se redistribuyen
  let ultimaLista = null;
  const ajustarEscala = () => {
    escena.style.setProperty('--k', Math.max(.7, Math.min(1.1, escena.clientWidth / 760)).toFixed(2));
    if (ultimaLista) cargarJardin(ultimaLista, false);
  };
  addEventListener('resize', () => { clearTimeout(ajustarEscala.t); ajustarEscala.t = setTimeout(ajustarEscala, 200); }, { passive: true });
  ajustarEscala();

  /* ---------- Música para orar (opcional) y pantalla completa ---------- */
  const audioMuro = $('#muro-audio'), bMusica = $('#muro-musica'), volumen = $('#muro-volumen'), bCompleta = $('#muro-completa');
  bMusica.addEventListener('click', () => {
    if (audioMuro.paused) {
      audioMuro.volume = parseFloat(volumen.value);
      audioMuro.play().then(() => {
        bMusica.setAttribute('aria-pressed', 'true'); bMusica.setAttribute('aria-label', 'Pausar la música');
        bMusica.innerHTML = icono('i-pausa'); volumen.hidden = false;
      }).catch(() => { bMusica.title = 'Música no disponible en este momento'; });
    } else {
      audioMuro.pause();
      bMusica.setAttribute('aria-pressed', 'false'); bMusica.setAttribute('aria-label', 'Activar música para orar');
      bMusica.innerHTML = icono('i-nota'); volumen.hidden = true;
    }
  });
  volumen.addEventListener('input', () => { audioMuro.volume = parseFloat(volumen.value); });
  if (!marco.requestFullscreen) bCompleta.hidden = true;
  bCompleta.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else marco.requestFullscreen().catch(() => {});
  });
  document.addEventListener('fullscreenchange', () => {
    const activo = document.fullscreenElement === marco;
    bCompleta.setAttribute('aria-label', activo ? 'Salir de pantalla completa' : 'Ver el jardín en pantalla completa');
    setTimeout(ajustarEscala, 120);
  });

  /* ---------- Franja "Estamos orando por…" del inicio y contador del menú ---------- */
  function pintarOrando(lista) {
    const n = lista.length;
    $('#orando-texto').innerHTML = n
      ? `Estamos orando por <strong>${n}</strong> ${n === 1 ? 'corazón' : 'corazones'}`
      : 'Sé la primera en dejar tu petición';
    const nombres = lista.slice(0, 12).map(p => `<span>👑 ${esc(p.nombre)}</span>`).join('');
    $('#orando-nombres').innerHTML = n ? `<span class="orando__cinta">${nombres}${nombres}</span>` : '';
    $$('[data-total-peticiones]').forEach(el => { el.textContent = n; el.hidden = !n; });
  }

  /* ---------- Carga de peticiones con reintento automático ---------- */
  let primeraCarga = true, fallos = 0;
  async function cicloPeticiones() {
    let lista = null;
    try { lista = await HR_PETICIONES.cargarPeticiones({ max: 30 }); }
    catch (err) { console.warn('Peticiones: reintentando…', err); }
    if (lista) {
      fallos = 0;
      pintarOrando(lista);
      ultimaLista = lista;
      cargarJardin(lista, primeraCarga);
      primeraCarga = false;
      setTimeout(cicloPeticiones, 120e3);                         // actualización silenciosa cada 2 min
    } else {
      fallos++;
      if (primeraCarga) contadorJ.textContent = 'Conectando con el jardín…';
      setTimeout(cicloPeticiones, Math.min(60e3, 4e3 * fallos));  // 4 s, 8 s, 12 s… hasta 1 min
    }
  }
  cicloPeticiones();

  /* =====================================================================
     PALABRA Y PROMESAS (Reina-Valera 1960)
     ===================================================================== */
  const PROMESAS = [
    { cita: 'Romanos 8:17', texto: '“Y si hijos, también herederos; herederos de Dios y coherederos con Cristo.”' },
    { cita: '2 Corintios 5:17', texto: '“De modo que si alguno está en Cristo, nueva criatura es; las cosas viejas pasaron; he aquí todas son hechas nuevas.”' },
    { cita: 'Sofonías 3:17', texto: '“Jehová está en medio de ti, poderoso, él salvará; se gozará sobre ti con alegría, callará de amor, se regocijará sobre ti con cánticos.”' },
    { cita: 'Salmos 46:5', texto: '“Dios está en medio de ella; no será conmovida. Dios la ayudará al clarear la mañana.”' },
    { cita: 'Isaías 41:10', texto: '“No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia.”' },
    { cita: 'Jeremías 29:11', texto: '“Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.”' },
    { cita: 'Filipenses 4:6-7', texto: '“Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.”' },
    { cita: '1 Pedro 5:7', texto: '“Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.”' },
    { cita: 'Proverbios 31:30', texto: '“Engañosa es la gracia, y vana la hermosura; la mujer que teme a Jehová, ésa será alabada.”' },
    ...HR_PETICIONES.VERSICULOS
  ];
  const diaDelAnio = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
  const promesaHoy = PROMESAS[diaDelAnio % PROMESAS.length];
  $('#promesa-texto').textContent = promesaHoy.texto;
  $('#promesa-cita').textContent = promesaHoy.cita;
  $('#promesa-copiar').addEventListener('click', async e => {
    const texto = `${promesaHoy.texto} — ${promesaHoy.cita}\n\nHerederas del Reino · ${location.origin}${location.pathname}`;
    try {
      if (navigator.share && !punteroFino) await navigator.share({ text: texto });
      else { await navigator.clipboard.writeText(texto); e.currentTarget.lastChild.textContent = '¡Copiada!'; }
    } catch (_) { /* la persona canceló */ }
  });
  const versos = $('#versos');
  versos.innerHTML = PROMESAS.filter(p => p !== promesaHoy).slice(0, 6).map((p, i) =>
    `<figure class="verso vidrio revelar" data-retraso="${i % 4}"><p>${esc(p.texto)}</p><cite>${esc(p.cita)}</cite></figure>`).join('');
  $$('.verso', versos).forEach(el => activarInclinacion(el, 8));

  /* =====================================================================
     NUESTROS LIBROS (desde config.js)
     ===================================================================== */
  const listaLibros = $('#libros-lista');
  listaLibros.innerHTML = (C.libros || []).map((l, i) => `
    <article class="libro revelar" data-retraso="${i % 3}">
      <a class="libro__portada" href="${esc(l.enlace)}" target="_blank" rel="noopener" aria-label="${esc(l.boton)}: ${esc(l.titulo)}">
        <span class="libro__3d">
          <img src="${esc(l.portada)}" alt="Portada de ${esc(l.titulo)}" width="${l.ancho}" height="${l.alto}" loading="lazy" decoding="async">
        </span>
        <span class="libro__sombra" aria-hidden="true"></span>
      </a>
      <div class="libro__texto">
        <span class="libro__tipo">${esc(l.tipo)}</span>
        <h3>${esc(l.titulo)}</h3>
        ${l.subtitulo ? `<p class="libro__subtitulo">${esc(l.subtitulo)}</p>` : ''}
        ${l.autora ? `<p class="libro__autora">${esc(l.autora)}</p>` : ''}
        <p class="libro__descripcion">${esc(l.descripcion)}</p>
        <a class="boton boton--muro" href="${esc(l.enlace)}" target="_blank" rel="noopener">${icono('i-biblia')}${esc(l.boton)}</a>
      </div>
    </article>`).join('');
  $$('.libro__portada', listaLibros).forEach(el => activarInclinacion(el, 10));

  /* =====================================================================
     CONÉCTATE
     ===================================================================== */
  const canales = [
    { tipo: 'Instagram', nombre: '@' + C.instagram.usuario, nota: 'Síguenos y compártelo con una amiga', url: C.instagram.url, icono: 'i-instagram' },
    { tipo: 'YouTube', nombre: C.youtube.nombre, nota: 'Suscríbete y activa la campanita 🔔', url: C.youtube.url, icono: 'i-youtube' },
    { tipo: 'Zoom', nombre: 'Nuestros encuentros', nota: 'ID ' + C.zoom.id, url: C.zoom.url, icono: 'i-zoom' },
    C.whatsapp && { tipo: 'WhatsApp', nombre: 'Escríbenos', nota: 'Te respondemos con amor', url: 'https://wa.me/' + C.whatsapp, icono: 'i-whatsapp' },
    { tipo: 'Oración', nombre: 'Peticiones de oración', nota: 'Oramos juntas, porque ninguna camina sola', url: C.formularioOracion, icono: 'i-formulario' }
  ].filter(Boolean);
  $('#canales').innerHTML = canales.map((c, i) => `
    <a class="canal revelar" data-retraso="${i % 4}" href="${esc(c.url)}" target="_blank" rel="noopener">
      <span class="canal__icono">${icono(c.icono)}</span>
      <span class="canal__tipo">${esc(c.tipo)}</span>
      <span class="canal__nombre">${esc(c.nombre)}</span>
      <span class="canal__nota">${esc(c.nota)}</span>
    </a>`).join('');


  /* =====================================================================
     TESTIMONIOS (solo los autorizados en config.js)
     ===================================================================== */
  const contT = $('#testimonios-contenido');
  if (C.testimonios && C.testimonios.length) {
    contT.innerHTML = `<div class="testimonios__grid">${C.testimonios.map((t, i) => `
      <blockquote class="testimonio vidrio revelar" data-retraso="${i % 3}">
        <p>“${esc(t.texto)}”</p><footer>— ${esc(t.nombre)}${t.pais ? ' · ' + esc(t.pais) : ''}</footer>
      </blockquote>`).join('')}</div>`;
  } else {
    contT.innerHTML = `
      <div class="testimonios__vacio vidrio revelar">
        <img src="assets/img/mariposa-3.webp" alt="" width="84" height="79" loading="lazy">
        <h3>Muy pronto, historias que transforman</h3>
        <p>Aquí compartiremos testimonios de restauración, siempre con la autorización de quien los vivió. ¿Dios hizo algo en tu vida? Nos encantaría escucharte.</p>
        <a class="boton" href="${esc(C.instagram.url)}" target="_blank" rel="noopener">Compártelo por Instagram</a>
      </div>`;
  }

  /* =====================================================================
     REPRODUCTOR DE LA CANCIÓN
     ===================================================================== */
  const rep = $('#reproductor'), audio = rep.parentElement.querySelector('audio');
  const bPlay = $('button', rep), barra = $('input', rep), tiempo = $('time', rep);
  const fmt = s => isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00';
  bPlay.addEventListener('click', () => { audio.paused ? audio.play() : audio.pause(); });
  audio.addEventListener('play', () => { bPlay.innerHTML = icono('i-pausa'); bPlay.setAttribute('aria-label', 'Pausar la canción'); });
  audio.addEventListener('pause', () => { bPlay.innerHTML = icono('i-play'); bPlay.setAttribute('aria-label', 'Reproducir la canción Herederas del Reino'); });
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) barra.value = (audio.currentTime / audio.duration) * 100;
    tiempo.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  });
  barra.addEventListener('input', () => { if (audio.duration) audio.currentTime = (barra.value / 100) * audio.duration; });

  /* =====================================================================
     VISOR DE AFICHES
     ===================================================================== */
  const visor = $('#visor'), vImg = $('#visor-img'), vDesc = $('#visor-descargar');
  $$('.afiche').forEach(b => b.addEventListener('click', () => {
    const img = $('img', b);
    vImg.src = b.dataset.grande; vImg.alt = img.alt;
    vDesc.href = b.dataset.grande;
    vDesc.setAttribute('download', 'herederas-del-reino-' + b.dataset.grande.split('/').pop());
    visor.showModal();
  }));
  $('#visor-cerrar').addEventListener('click', () => visor.close());
  visor.addEventListener('click', e => { if (e.target === visor) visor.close(); });

  observarRevelados();
})();
