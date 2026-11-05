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
     JARDÍN DE ORACIÓN
     ===================================================================== */
  const COLORES_FLOR = [
    { p: '#E8B4C2', b: '#C98E9C' }, { p: '#F4D6DE', b: '#E0A9B7' }, { p: '#F3C7B5', b: '#D99C86' },
    { p: '#FFF6EF', b: '#E3C9BC' }, { p: '#D99AAA', b: '#B4707F' }
  ];
  function svgFlor(semilla) {
    const r = (n) => { const x = Math.sin(semilla * 9301 + n * 49297) * 233280; return x - Math.floor(x); };
    const col = COLORES_FLOR[Math.floor(r(1) * COLORES_FLOR.length)];
    const petalos = 5 + Math.floor(r(2) * 4), largo = 13 + r(3) * 5, ancho = 7 + r(4) * 3;
    const curva = (r(5) - .5) * 14;
    let p = '';
    for (let i = 0; i < petalos; i++) {
      const a = (360 / petalos) * i + r(6) * 30;
      p += `<ellipse cx="35" cy="${32 - largo * .62}" rx="${ancho.toFixed(1)}" ry="${largo.toFixed(1)}" fill="${col.p}" stroke="${col.b}" stroke-width=".8" transform="rotate(${a.toFixed(1)} 35 32)"/>`;
    }
    return `<svg viewBox="0 0 70 120" aria-hidden="true">
      <path d="M35 120 C ${35 + curva} 90, ${35 - curva} 60, 35 34" fill="none" stroke="#8C9A6E" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M35 ${86 + r(7) * 10} q -16 -6 -20 -18 q 14 2 20 18Z" fill="#A4AF84"/>
      <path d="M35 ${74 + r(8) * 10} q 15 -5 19 -16 q -13 1 -19 16Z" fill="#B3BC93"/>
      <g class="flor__petalos">${p}<circle cx="35" cy="32" r="${(4.5 + r(9) * 2).toFixed(1)}" fill="#D4AF37"/><circle cx="35" cy="32" r="2.2" fill="#B8862B"/></g>
    </svg>`;
  }

  const escena = $('#jardin-escena'), floresCont = $('#jardin-flores');
  const subJ = $('#jardin-subtitulo'), versoJ = $('#jardin-verso'), contadorJ = $('#jardin-contador');
  const subInicialJ = subJ.textContent, versoInicialJ = versoJ.innerHTML;
  const flores = new Map(); let activa = null, regreso = null;

  function sostener(el, nombre, v) {
    clearTimeout(regreso);
    if (activa) activa.classList.remove('activa');
    activa = el; el.classList.add('activa');
    subJ.textContent = `Sosteniendo la petición de ${nombre}`;
    versoJ.innerHTML = `${esc(v.texto)}<cite>${esc(v.cita)}</cite>`;
    regreso = setTimeout(() => {
      if (activa) activa.classList.remove('activa'); activa = null;
      subJ.textContent = subInicialJ; versoJ.innerHTML = versoInicialJ;
    }, 9000);
  }

  function ubicarFlor(ocupadas) {
    // x en %, profundidad 0 (fondo) → 1 (frente); la base va del 64% al 97% de la altura
    let sep = .26;
    for (let ronda = 0; ronda < 6; ronda++, sep *= .82) {
      for (let k = 0; k < 120; k++) {
        const margen = escena.clientWidth < 600 ? 16 : 8;
        const x = margen + Math.random() * (100 - 2 * margen), prof = Math.random();
        if (!ocupadas.some(o => Math.hypot((o.x - x) / 100, (o.prof - prof) * .55) < sep)) return { x, prof };
      }
    }
    return { x: 7 + Math.random() * 86, prof: Math.random() };
  }

  async function cargarJardin(primera) {
    let lista;
    try { lista = await HR_PETICIONES.cargarPeticiones({ max: 30 }); }
    catch (err) {
      console.error('Jardín de oración:', err);
      if (primera) contadorJ.textContent = 'No pudimos cargar el jardín en este momento. Seguimos orando.';
      return;
    }
    const claves = new Set(lista.map(p => p.clave));
    flores.forEach((f, k) => { if (!claves.has(k)) { f.el.remove(); flores.delete(k); } });
    const ocupadas = [...flores.values()].map(f => f.pos);
    lista.forEach((p, i) => {
      if (flores.has(p.clave)) return;
      const pos = ubicarFlor(ocupadas); ocupadas.push(pos);
      const v = HR_PETICIONES.VERSICULOS[(flores.size + i) % HR_PETICIONES.VERSICULOS.length];
      const el = document.createElement('button');
      el.type = 'button'; el.className = 'flor' + (primera ? '' : ' brotar');
      el.setAttribute('role', 'listitem');
      el.setAttribute('aria-label', `Sostener en oración la petición de ${p.nombre}`);
      el.style.left = pos.x + '%';
      el.style.top = (64 + pos.prof * 33) + '%';
      el.style.zIndex = Math.round(pos.prof * 100);
      el.style.setProperty('--escala', (.72 + pos.prof * .5).toFixed(2));
      el.style.setProperty('--prof', (pos.prof - .5).toFixed(2));
      el.style.setProperty('--desenfoque', ((1 - pos.prof) * .9).toFixed(2) + 'px');
      el.style.setProperty('--mecer', (5 + Math.random() * 3).toFixed(2) + 's');
      el.style.setProperty('--retraso', (-Math.random() * 6).toFixed(2) + 's');
      const semilla = [...p.clave].reduce((a, c) => a + c.charCodeAt(0), 0);
      el.innerHTML = `<span class="flor__planta">${svgFlor(semilla)}</span><span class="flor__nombre"></span>`;
      el.querySelector('.flor__nombre').textContent = p.nombre;
      const mostrar = () => sostener(el, p.nombre, v);
      el.addEventListener('click', mostrar);
      el.addEventListener('focus', mostrar);
      if (punteroFino) el.addEventListener('mouseenter', mostrar);
      floresCont.appendChild(el);
      flores.set(p.clave, { el, pos });
    });
    const n = flores.size;
    contadorJ.textContent = n ? `${n} ${n === 1 ? 'petición sostenida' : 'peticiones sostenidas'} en oración` : 'El jardín espera tu primera petición.';
  }

  if (!movimientoReducido && punteroFino) {
    escena.addEventListener('pointermove', e => {
      const r = escena.getBoundingClientRect();
      floresCont.style.setProperty('--mx', (((e.clientX - r.left) / r.width - .5) * 2).toFixed(3));
    });
    escena.addEventListener('pointerleave', () => floresCont.style.setProperty('--mx', 0));
  }
  // Las flores se adaptan al ancho del jardín (celular → más pequeñas)
  const ajustarEscala = () => escena.style.setProperty('--k', Math.max(.62, Math.min(1, escena.clientWidth / 820)).toFixed(2));
  ajustarEscala(); addEventListener('resize', ajustarEscala, { passive: true });

  // Carga diferida: solo cuando el jardín se acerca a la pantalla
  let jardinIniciado = false;
  new IntersectionObserver(([en], obs) => {
    if (en.isIntersecting && !jardinIniciado) {
      jardinIniciado = true; obs.disconnect();
      cargarJardin(true); setInterval(() => cargarJardin(false), 120e3);
    }
  }, { rootMargin: '300px' }).observe(escena);

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

  $('#contacto-lista').innerHTML = canales.filter(c => c.tipo !== 'Oración').map(c =>
    `<li><a href="${esc(c.url)}" target="_blank" rel="noopener">${icono(c.icono)}<span><strong>${esc(c.tipo)}</strong> · ${esc(c.nombre)}</span></a></li>`).join('');

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
        <a class="boton" href="#contacto">Compartir mi testimonio</a>
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

  /* =====================================================================
     CONTACTO — sin servidor: abre WhatsApp o un mensaje directo de Instagram
     ===================================================================== */
  const form = $('#formulario-contacto'), estado = $('#c-estado');
  $('#c-boton').textContent = C.whatsapp ? 'Enviar por WhatsApp' : 'Enviar por Instagram';
  $('#c-nota').textContent = C.whatsapp
    ? 'Se abrirá WhatsApp con tu mensaje listo para enviar.'
    : 'Copiaremos tu mensaje y abriremos nuestro Instagram para que lo pegues en un mensaje directo.';
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const nombre = form.nombre.value.trim(), mensaje = form.mensaje.value.trim();
    if (!nombre || !mensaje) {
      estado.textContent = 'Por favor escribe tu nombre y tu mensaje.';
      (nombre ? form.mensaje : form.nombre).focus(); return;
    }
    const texto = `Hola, soy ${nombre}. ${mensaje}`;
    if (C.whatsapp) {
      open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
      estado.textContent = 'Abrimos WhatsApp con tu mensaje. ¡Gracias por escribirnos!';
    } else {
      try { await navigator.clipboard.writeText(texto); } catch (_) {}
      open(`https://ig.me/m/${C.instagram.usuario}`, '_blank', 'noopener');
      estado.textContent = 'Tu mensaje quedó copiado. Pégalo en el chat de Instagram que acabamos de abrir.';
    }
  });

  observarRevelados();
})();
