(function () {
  function openWhatsApp(wa) {
    var desktop = window.matchMedia('(min-width: 900px)').matches;
    if (desktop) {
      window.open(wa, '_blank', 'noopener,noreferrer');
      return;
    }
    window.location.href = wa;
  }

  document.querySelectorAll('.product-wa-fab-open').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var track = link.getAttribute('data-track-url');
      var wa = link.getAttribute('href');

      if (! track || ! wa || wa === '#') {
        return;
      }

      e.preventDefault();
      fetch(track, { method: 'GET', credentials: 'same-origin' })
        .catch(function () {})
        .finally(function () {
          openWhatsApp(wa);
        });
    });
  });

  const wrap = document.getElementById('productWaFabWrap');
  if (!wrap) return;

  const toggle = document.getElementById('productWaFabToggle');
  const panel = document.getElementById('productWaFabSellers');
  if (!toggle || !panel) return;

  function closePanel() {
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    if (panel.classList.contains('is-open')) {
      closePanel();
    } else {
      panel.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }
  });

  document.addEventListener('click', function (e) {
    if (!wrap.contains(e.target)) {
      closePanel();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closePanel();
    }
  });
})();
