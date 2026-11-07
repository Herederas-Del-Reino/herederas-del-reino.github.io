/* Aviso de privacidad: completa los datos desde assets/js/config.js */
  (function () {
    var cj = (window.HR_CONFIG && window.HR_CONFIG.consejeria) || {};
    var ig = (window.HR_CONFIG && window.HR_CONFIG.instagram) || {};
    var pendiente = { responsable: 'Pendiente: nombre legal del responsable', correoPrivacidad: 'Pendiente: canal de contacto para privacidad', conservacion: 'Pendiente: plazo de conservación aprobado por el ministerio', actualizado: '—' };
    document.querySelectorAll('[data-dato]').forEach(function (el) {
      var clave = el.getAttribute('data-dato'), valor = (cj[clave] || '').trim();
      if (valor) {
        if (clave === 'correoPrivacidad') { var a = document.createElement('a'); a.href = 'mailto:' + valor; a.textContent = valor; el.appendChild(a); }
        else el.textContent = valor;
      } else if (clave === 'correoPrivacidad' && ig.url) {
        // Sin correo de privacidad: mensaje directo a la cuenta oficial de Instagram
        el.append('mensaje directo a nuestra cuenta oficial de Instagram ');
        var b = document.createElement('a'); b.href = ig.url; b.target = '_blank'; b.rel = 'noopener'; b.textContent = '@' + ig.usuario; el.appendChild(b);
      } else { el.textContent = pendiente[clave]; el.className = 'pendiente'; }
    });
    document.getElementById('borrador').hidden = cj.avisoAprobado === true;
  })();
