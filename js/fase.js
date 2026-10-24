(function () {
  'use strict';

  // Single source of truth for which campaign phase the site is in.
  // 0 = before launch (waitlist only), 1 = launched, 2 = trainer feature live.
  // Flip this one number and redeploy — never rewrite page content for a
  // phase change.
  var FASE = 0;

  function applyFase() {
    document.querySelectorAll('[data-fase]').forEach(function (el) {
      var allowed = el.getAttribute('data-fase').split(',').map(function (s) {
        return parseInt(s.trim(), 10);
      });
      el.style.display = allowed.indexOf(FASE) === -1 ? 'none' : '';
    });
  }

  window.Rekalp = window.Rekalp || {};
  window.Rekalp.FASE = FASE;

  document.addEventListener('DOMContentLoaded', applyFase);
})();
