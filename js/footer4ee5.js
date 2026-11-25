(function () {
  var footer = document.querySelector('.site-footer');
  if (!footer) return;

  var mq = window.matchMedia('(max-width: 768px)');
  var details = footer.querySelectorAll('.site-footer-details');

  function syncFooterAccordion() {
    details.forEach(function (el) {
      if (mq.matches) {
        el.removeAttribute('open');
      } else {
        el.setAttribute('open', '');
      }
    });
  }

  syncFooterAccordion();

  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', syncFooterAccordion);
  } else if (typeof mq.addListener === 'function') {
    mq.addListener(syncFooterAccordion);
  }

  if (mq.matches) {
    details.forEach(function (el) {
      el.addEventListener('toggle', function () {
        if (!el.open) return;
        details.forEach(function (other) {
          if (other !== el) other.removeAttribute('open');
        });
      });
    });
  }
})();
