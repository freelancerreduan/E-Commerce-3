(function () {
  'use strict';

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();

      try {
        document.execCommand('copy') ? resolve() : reject();
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  function flashCopied(btn) {
    const wasLabel = btn.getAttribute('aria-label') || 'Copy link';
    btn.classList.add('is-copied');
    btn.setAttribute('aria-label', 'Link copied');

    window.setTimeout(function () {
      btn.classList.remove('is-copied');
      btn.setAttribute('aria-label', wasLabel);
    }, 1600);
  }

  function bindShare(root) {
    const url = root.getAttribute('data-share-url') || '';
    const title = root.getAttribute('data-share-title') || '';
    const text = root.getAttribute('data-share-text') || title || 'Hatilo';

    if (!url) {
      return;
    }

    const copyBtn = root.querySelector('[data-product-share-copy]');
    const nativeBtn = root.querySelector('[data-product-share-native]');

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        copyText(url)
          .then(function () {
            flashCopied(copyBtn);
          })
          .catch(function () {
            window.prompt('Copy this link:', url);
          });
      });
    }

    if (nativeBtn && typeof navigator.share === 'function') {
      nativeBtn.hidden = false;
      nativeBtn.addEventListener('click', function () {
        navigator.share({ title: title, text: text, url: url }).catch(function () {});
      });
    }
  }

  function boot() {
    document.querySelectorAll('[data-product-share]').forEach(bindShare);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
