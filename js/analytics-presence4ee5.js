(function () {
  'use strict';

  var STORAGE_KEY = 'hatilo_device_id';
  var COOKIE_NAME = 'hatilo_did';
  var PING_MS = 30000;
  var pingUrl =
    (document.currentScript && document.currentScript.getAttribute('data-presence-url')) ||
    '/analytics/presence';

  function randomHex() {
    var bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }

  function getDeviceId() {
    try {
      var id = localStorage.getItem(STORAGE_KEY);
      if (!id || !/^[a-f0-9]{32}$/.test(id)) {
        id = randomHex();
        localStorage.setItem(STORAGE_KEY, id);
      }

      var secure = window.location.protocol === 'https:' ? ';Secure' : '';
      document.cookie =
        COOKIE_NAME + '=' + id + ';path=/;max-age=31536000;SameSite=Lax' + secure;

      return id;
    } catch (e) {
      return '';
    }
  }

  function csrfHeaders() {
    var match = document.cookie.match(/(?:^|;\s*)csrf_cookie_name=([^;]+)/);
    if (!match) {
      return {};
    }

    return { 'X-CSRF-TOKEN': decodeURIComponent(match[1]) };
  }

  function ping() {
    var deviceId = getDeviceId();
    if (!deviceId) {
      return;
    }

    var body = JSON.stringify({
      device_id: deviceId,
      path: window.location.pathname || '/',
    });

    fetch(pingUrl, {
      method: 'POST',
      headers: Object.assign(
        {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        csrfHeaders()
      ),
      body: body,
      credentials: 'same-origin',
      keepalive: true,
    }).catch(function () {});
  }

  getDeviceId();
  ping();
  window.setInterval(ping, PING_MS);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      ping();
    }
  });
})();
