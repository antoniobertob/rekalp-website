(function () {
  'use strict';

  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var slides = root.querySelectorAll('.carousel-slide');
    var dots = root.querySelectorAll('.carousel-dot');
    var index = 0, timer;
    function show(i) {
      index = i;
      slides.forEach(function (s, n) { s.classList.toggle('active', n === i); });
      dots.forEach(function (d, n) { d.classList.toggle('active', n === i); });
    }
    function next() { show((index + 1) % slides.length); }
    function restart() {
      clearInterval(timer);
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(next, 4500);
    }
    dots.forEach(function (dot, n) {
      dot.addEventListener('click', function () { show(n); restart(); });
    });
    restart();
  });
})();
