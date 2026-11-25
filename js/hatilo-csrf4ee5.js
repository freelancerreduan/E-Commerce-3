(function () {
  'use strict';

  function findCsrfInputs(tokenName) {
    var nodes = [];
    if (tokenName) {
      document.querySelectorAll('input[type="hidden"][name="' + tokenName + '"]').forEach(function (el) {
        nodes.push(el);
      });
    }
    if (!nodes.length) {
      document.querySelectorAll('input[type="hidden"][name*="csrf" i]').forEach(function (el) {
        nodes.push(el);
      });
    }
    return nodes;
  }

  /** Update all CSRF hidden fields after AJAX (cookie CSRF regenerate=true). */
  window.hatiloSyncCsrf = function (data) {
    if (!data || typeof data !== 'object') {
      return;
    }

    var tokenName = data.csrf_token_name;
    var token = data.csrf_token;

    if (!tokenName || !token) {
      return;
    }

    findCsrfInputs(tokenName).forEach(function (input) {
      input.value = token;
    });
  };
})();
