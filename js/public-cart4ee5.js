/**
 * Public Add to Cart without full page reload — toast + header badge update.
 */
(function () {
  'use strict';

  function updateCartBadge(count) {
    var n = parseInt(count, 10) || 0;
    var link = document.querySelector('[data-hatilo-cart-link]');
    var badge = document.querySelector('[data-hatilo-cart-badge]');

    if (link) {
      link.setAttribute('aria-label', n > 0 ? 'Cart, ' + n + ' item(s)' : 'Cart');
    }

    if (!badge && link) {
      badge = document.createElement('span');
      badge.className = 'header-cart-badge';
      badge.setAttribute('data-hatilo-cart-badge', '');
      link.appendChild(badge);
    }

    if (!badge) return;

    if (n <= 0) {
      badge.hidden = true;
      badge.textContent = '0';
      return;
    }

    badge.hidden = false;
    badge.textContent = n > 99 ? '99+' : String(n);
  }

  function setBusy(form, busy) {
    form.querySelectorAll('button[type="submit"]').forEach(function (btn) {
      btn.disabled = !!busy;
    });
  }

  function fireTracking(data) {
    var tracking = data && data.tracking;
    if (!tracking || !tracking.event) return;

    if (typeof window.hatiloTrackMarketing === 'function') {
      window.hatiloTrackMarketing(tracking.event, tracking.data || {});
    }

    if (typeof window.hatiloTrackVendor === 'function') {
      window.hatiloTrackVendor(tracking.event, tracking.data || {});
    }
  }

  function submitAjax(form, submitter) {
    var action = form.getAttribute('action');
    if (!action) return;

    var fd = new FormData(form);
    if (submitter && submitter.name) {
      fd.append(submitter.name, submitter.value || '1');
    }

    setBusy(form, true);

    fetch(action, {
      method: 'POST',
      body: fd,
      credentials: 'same-origin',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
      },
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { okHttp: res.ok, data: data || {} };
        }).catch(function () {
          return { okHttp: res.ok, data: { ok: false, message: 'Could not add to cart.' } };
        });
      })
      .then(function (result) {
        var data = result.data || {};
        if (typeof window.hatiloSyncCsrf === 'function') {
          window.hatiloSyncCsrf(data);
        }

        if (!result.okHttp || !data.ok) {
          if (typeof window.hatiloShowToast === 'function') {
            window.hatiloShowToast(data.message || 'Could not add to cart.', 'error');
          }
          return;
        }

        if (typeof data.cart_count !== 'undefined') {
          updateCartBadge(data.cart_count);
        }

        fireTracking(data);

        if (typeof window.hatiloShowToast === 'function') {
          window.hatiloShowToast(data.message || 'Added to cart.', 'success');
        }
      })
      .catch(function () {
        if (typeof window.hatiloShowToast === 'function') {
          window.hatiloShowToast('Could not add to cart.', 'error');
        }
      })
      .finally(function () {
        setBusy(form, false);
      });
  }

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (!form.matches('[data-hatilo-ajax-cart]')) return;
    // Variant picker (capture) already blocked this submit — do not AJAX.
    if (event.defaultPrevented) return;

    event.preventDefault();
    submitAjax(form, event.submitter || null);
  });
})();
