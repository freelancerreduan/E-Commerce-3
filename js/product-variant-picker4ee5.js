(function () {
  'use strict';

  var picker = document.getElementById('productVariantPicker');

  if (!picker) {
    return;
  }

  var actions = document.getElementById('product-order-actions');
  var productId = parseInt(picker.dataset.productId || '0', 10);
  var variantsUrl = picker.dataset.variantsUrl || '';
  var basePriceLabel = picker.dataset.basePriceLabel || '';

  if (!actions) {
    return;
  }

  function priceDisplayEl() {
    return document.querySelector('[data-product-buying-price]');
  }

  function selectedPriceInput() {
    var fieldId = picker.dataset.priceFieldId || '';

    if (!fieldId) {
      return null;
    }

    var name = 'product_variant[' + fieldId + ']';
    var select = picker.querySelector('select.product-variant-picker-input[name="' + name + '"]');

    if (select) {
      return select;
    }

    var radio = picker.querySelector('input[type="radio"].product-variant-picker-input[name="' + name + '"]:checked');

    return radio || null;
  }

  function updateBuyingPrice() {
    var el = priceDisplayEl();

    if (!el) {
      return;
    }

    var input = selectedPriceInput();

    if (!input) {
      el.textContent = basePriceLabel;

      return;
    }

    var amount = input.getAttribute('data-price-amount');
    var label = input.getAttribute('data-price-label');

    if (input.tagName === 'SELECT') {
      var opt = input.selectedOptions[0];

      if (opt) {
        amount = opt.getAttribute('data-price-amount');
        label = opt.getAttribute('data-price-label');
      }
    }

    if (label) {
      el.textContent = label;
    } else {
      el.textContent = basePriceLabel;
    }
  }

  function pickerInputs() {
    return picker.querySelectorAll('.product-variant-picker-input');
  }

  function validatePicker() {
    var inputs = pickerInputs();
    var firstInvalid = null;

    inputs.forEach(function (el) {
      if (el.type === 'radio') {
        var name = el.name;
        var group = picker.querySelectorAll('input[type="radio"][name="' + name + '"]');
        var required = el.hasAttribute('required');
        var checked = false;

        group.forEach(function (r) {
          if (r.checked) {
            checked = true;
          }
        });

        if (required && !checked && !firstInvalid) {
          firstInvalid = group[0];
        }

        return;
      }

      if (!el.checkValidity() && !firstInvalid) {
        firstInvalid = el;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      picker.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid.reportValidity();

      return false;
    }

    return true;
  }

  function fieldValue(el) {
    if (el.type === 'radio') {
      return el.checked ? el.value : '';
    }

    if (el.tagName === 'SELECT') {
      return el.value || '';
    }

    return el.value ? el.value.trim() : '';
  }

  function appendVariantFields(form) {
    form.querySelectorAll('input[data-product-variant-clone]').forEach(function (n) {
      n.remove();
    });

    pickerInputs().forEach(function (el) {
      var val = fieldValue(el);

      if (el.type === 'radio' && !el.checked) {
        return;
      }

      if (!val || !el.name) {
        return;
      }

      var hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = el.name;
      hidden.value = val;
      hidden.setAttribute('data-product-variant-clone', '1');
      form.appendChild(hidden);
    });
  }

  function csrfInput(form) {
    return (
      form.querySelector('input[name="csrf_test_name"]') ||
      form.querySelector('input[type="hidden"][name*="csrf" i]')
    );
  }

  /**
   * Optional session sync only. Must refresh CSRF after response —
   * regenerate=true otherwise breaks the next Add to Cart / Buy Now submit.
   * Never call this during form submit (race with the main POST).
   */
  function syncVariantsToCart(form) {
    if (!variantsUrl || productId <= 0) {
      return;
    }

    var fd = new FormData();
    var csrf = csrfInput(form);

    fd.append('product_id', String(productId));

    if (csrf && csrf.value) {
      fd.append(csrf.name, csrf.value);
    }

    pickerInputs().forEach(function (el) {
      var val = fieldValue(el);

      if (el.type === 'radio' && !el.checked) {
        return;
      }

      if (!val || !el.name) {
        return;
      }

      fd.append(el.name, val);
    });

    fetch(variantsUrl, {
      method: 'POST',
      body: fd,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'same-origin',
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (typeof window.hatiloSyncCsrf === 'function') {
          window.hatiloSyncCsrf(data);
        }
      })
      .catch(function () {});
  }

  pickerInputs().forEach(function (el) {
    el.addEventListener('change', function () {
      updateBuyingPrice();
      var form = actions.querySelector('.btn-action-form');

      if (form) {
        syncVariantsToCart(form);
      }
    });
  });

  updateBuyingPrice();

  actions.querySelectorAll('.btn-action-form').forEach(function (form) {
    form.addEventListener(
      'submit',
      function (e) {
        if (!validatePicker()) {
          e.preventDefault();
          // Block public-cart AJAX (and any later submit handlers) when Size/etc. missing.
          e.stopImmediatePropagation();

          return;
        }

        // Clone options into the POST body only — do NOT AJAX /cart/variants here
        // (that regenerates CSRF and causes "action not allowed" on this submit).
        appendVariantFields(form);
      },
      true,
    );
  });
})();
