function setNavOpen(open) {
  const panel = document.getElementById('mobileNavPanel');
  const toggle = document.getElementById('navToggle');
  if (!panel || !toggle) return;

  panel.classList.toggle('open', open);
  panel.hidden = !open;
  panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

function fitDesktopNav() {
  const nav = document.querySelector('.nav-desktop');
  const moreLink = document.querySelector('[data-nav-more-link]');
  if (!nav || !moreLink || window.innerWidth < 769) {
    return;
  }

  const moreItem = nav.querySelector('.nav-more');
  const items = Array.from(nav.querySelectorAll('.nav-item:not(.nav-more)'));
  const baseUrl = moreLink.getAttribute('data-nav-more-base') || moreLink.getAttribute('href') || '/categories';

  items.forEach((item) => item.classList.remove('is-nav-hidden'));
  if (moreItem) {
    moreItem.classList.remove('is-nav-hidden');
  }

  const container = nav.closest('.container') || nav.parentElement || nav;

  function navFits() {
    return nav.scrollWidth <= container.clientWidth + 1;
  }

  const hiddenSlugs = [];

  if (!navFits()) {
    for (let i = items.length - 1; i >= 0; i -= 1) {
      items[i].classList.add('is-nav-hidden');
      const slug = items[i].getAttribute('data-nav-slug');
      if (slug) {
        hiddenSlugs.unshift(slug);
      }
      if (navFits()) {
        break;
      }
    }
  }

  if (hiddenSlugs.length > 0) {
    moreLink.href = baseUrl + '?nav=' + encodeURIComponent(hiddenSlugs.join(','));
  } else {
    moreLink.href = baseUrl;
  }
}

let navFitTimer = null;

function scheduleDesktopNavFit() {
  if (navFitTimer) {
    window.clearTimeout(navFitTimer);
  }
  navFitTimer = window.setTimeout(fitDesktopNav, 50);
}

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const close = document.getElementById('navClose');

  toggle?.addEventListener('click', () => {
    const panel = document.getElementById('mobileNavPanel');
    const isOpen = panel?.classList.contains('open');
    setNavOpen(!isOpen);
  });

  close?.addEventListener('click', () => setNavOpen(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setNavOpen(false);
  });

  document.querySelectorAll('#mobileNavPanel .m-has-children .m-expand').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const li = btn.closest('.m-has-children');
      const sub = li?.querySelector(':scope > .m-sub');
      if (!sub) return;
      const isOpen = !sub.hidden;
      sub.hidden = isOpen;
      btn.textContent = isOpen ? '+' : '−';
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  });

  fitDesktopNav();
  window.addEventListener('resize', scheduleDesktopNavFit);

  if (typeof ResizeObserver !== 'undefined') {
    const nav = document.querySelector('.nav-desktop');
    const container = nav?.closest('.container');
    if (nav && container) {
      const observer = new ResizeObserver(scheduleDesktopNavFit);
      observer.observe(container);
      observer.observe(nav);
    }
  }
});

window.addEventListener('load', fitDesktopNav);
