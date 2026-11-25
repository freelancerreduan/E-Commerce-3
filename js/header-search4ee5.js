(function () {
  var root = document.getElementById('headerSearchLive');
  if (!root) return;

  var input = document.getElementById('headerSearchInput');
  var panel = document.getElementById('headerSearchPanel');
  var list = document.getElementById('headerSearchList');
  var labelEl = document.getElementById('headerSearchPanelLabel');
  var emptyEl = document.getElementById('headerSearchEmpty');
  var moreEl = document.getElementById('headerSearchMore');
  var form = root.querySelector('.header-search');

  var suggestUrl = root.getAttribute('data-suggest-url') || '';
  var boostIcon = root.getAttribute('data-boost-icon') || '✨';
  var searchPageUrl = form ? (form.getAttribute('action') || '') : '';
  var debounceTimer = null;
  var activeIndex = -1;
  var lastItems = [];

  function openPanel() {
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function closePanel() {
    panel.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function renderItems(items, mode) {
    lastItems = items || [];
    list.innerHTML = '';
    activeIndex = -1;

    if (!items || items.length === 0) {
      emptyEl.hidden = false;
      emptyEl.textContent = mode === 'promoted'
        ? 'No hot picks right now.'
        : 'No products found.';
      moreEl.hidden = true;
      return;
    }

    emptyEl.hidden = true;

    items.forEach(function (item, i) {
      var li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.className = 'header-search-item' + (item.is_promoted ? ' is-promoted' : '');
      li.dataset.index = String(i);

      var imgHtml = item.image
        ? '<img src="' + escapeHtml(item.image) + '" alt="" class="header-search-item-img" loading="lazy">'
        : '<span class="header-search-item-noimg" aria-hidden="true">📦</span>';

      var badge = item.is_promoted
        ? '<span class="hatilo-boost-icon hatilo-boost-icon--search" aria-hidden="true">' + boostIcon + '</span>'
        : '';

      li.innerHTML =
        '<a href="' + escapeHtml(item.url) + '" class="header-search-item-link">' +
          imgHtml +
          '<span class="header-search-item-body">' +
            '<span class="header-search-item-title">' + escapeHtml(item.title) + '</span>' +
            '<span class="header-search-item-price">' + escapeHtml(item.price) + badge + '</span>' +
          '</span>' +
        '</a>';

      list.appendChild(li);
    });
  }

  function applyResponse(data) {
    if (!data || !data.ok) return;

    labelEl.textContent = data.label || '';
    labelEl.hidden = !data.label;
    renderItems(data.items, data.mode);

    if (data.mode === 'search' && data.q && searchPageUrl) {
      moreEl.href = searchPageUrl + (searchPageUrl.indexOf('?') >= 0 ? '&' : '?') + 'q=' + encodeURIComponent(data.q);
      moreEl.hidden = false;
    } else {
      moreEl.hidden = true;
    }

    openPanel();
  }

  function fetchSuggest(q) {
    var url = suggestUrl + (q ? '?q=' + encodeURIComponent(q) : '');
    fetch(url, {
      headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
      credentials: 'same-origin',
    })
      .then(function (r) { return r.json(); })
      .then(applyResponse)
      .catch(function () {
        emptyEl.hidden = false;
        emptyEl.textContent = 'Could not load results.';
        moreEl.hidden = true;
        openPanel();
      });
  }

  function scheduleFetch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      fetchSuggest(input.value.trim());
    }, 280);
  }

  function setActive(idx) {
    var options = list.querySelectorAll('.header-search-item');
    activeIndex = idx;
    options.forEach(function (el, i) {
      el.classList.toggle('is-active', i === activeIndex);
    });
  }

  input.addEventListener('focus', function () {
    scheduleFetch();
  });

  input.addEventListener('input', function () {
    scheduleFetch();
  });

  input.addEventListener('keydown', function (e) {
    var options = list.querySelectorAll('.header-search-item');
    if (!options.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(Math.min(activeIndex + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      var link = options[activeIndex].querySelector('a');
      if (link) window.location.href = link.href;
    } else if (e.key === 'Escape') {
      closePanel();
    }
  });

  document.addEventListener('click', function (e) {
    if (!root.contains(e.target)) {
      closePanel();
    }
  });

  if (form) {
    form.addEventListener('submit', function () {
      closePanel();
    });
  }
})();
