(function () {
  'use strict';

  function ensureToastHost() {
    var host = document.getElementById('hatilo-toast-host');
    if (host) return host;
    host = document.createElement('div');
    host.className = 'hatilo-toast-host';
    host.id = 'hatilo-toast-host';
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
    return host;
  }

  window.hatiloShowToast = function (message, type) {
    if (!message) return;
    var host = ensureToastHost();
    host.innerHTML = '';
    var el = document.createElement('div');
    el.className = 'hatilo-toast ' + (type === 'error' ? 'hatilo-toast--error' : 'hatilo-toast--success');
    el.setAttribute('data-hatilo-toast', '');
    el.setAttribute('role', 'status');
    el.textContent = message;
    host.appendChild(el);

    requestAnimationFrame(function () {
      el.classList.add('is-visible');
    });

    var hideMs = 3800;
    var timer = window.setTimeout(function () {
      el.classList.remove('is-visible');
      window.setTimeout(function () {
        if (host.parentNode) host.parentNode.removeChild(host);
      }, 320);
    }, hideMs);

    el.addEventListener('click', function () {
      window.clearTimeout(timer);
      el.classList.remove('is-visible');
      window.setTimeout(function () {
        if (host.parentNode) host.parentNode.removeChild(host);
      }, 320);
    });
  };

  var el = document.querySelector('[data-hatilo-toast]');
  if (!el) return;

  var host = document.getElementById('hatilo-toast-host');
  var hideMs = 3800;
  var timer;

  function show() {
    requestAnimationFrame(function () {
      el.classList.add('is-visible');
    });
  }

  function hide() {
    el.classList.remove('is-visible');
    window.setTimeout(function () {
      if (host && host.parentNode) {
        host.parentNode.removeChild(host);
      }
    }, 320);
  }

  function dismiss() {
    window.clearTimeout(timer);
    hide();
  }

  show();
  timer = window.setTimeout(dismiss, hideMs);
  el.addEventListener('click', dismiss);
})();
