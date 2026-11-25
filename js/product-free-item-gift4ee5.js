(function () {
  'use strict';

  var modal = document.getElementById('productFreeItemModal');
  var bodyEl = document.getElementById('productFreeItemModalBody');
  var closeBtn = document.getElementById('btnProductFreeItemClose');

  if (!modal || !bodyEl) {
    return;
  }

  function openModal(text) {
    bodyEl.textContent = text || '';
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('product-free-item-modal-open');
  }

  function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('product-free-item-modal-open');
  }

  document.querySelectorAll('.product-free-gift-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openModal(btn.getAttribute('data-free-item') || '');
    });
  });

  closeBtn?.addEventListener('click', closeModal);

  modal.querySelector('.product-free-item-modal-backdrop')?.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });
})();
