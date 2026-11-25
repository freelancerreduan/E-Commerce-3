(function () {
  const roots = document.querySelectorAll('[data-home-blog-slider]');

  if (!roots.length) {
    return;
  }

  roots.forEach(function (root) {
    initHomeBlogSlider(root);
  });

  function initHomeBlogSlider(root) {
    const viewport = root.querySelector('.home-blog-slider-viewport');
    const track = root.querySelector('.home-blog-slider-track');
    const items = track ? Array.from(track.querySelectorAll('.home-blog-slider-item')) : [];

    if (!viewport || !track || items.length === 0) {
      return;
    }

    const DRAG_THRESHOLD = 36;
    const DRAG_START = 10;
    let current = 0;
    let timer = null;
    let visible = 1;
    let pointerId = null;
    let startX = 0;
    let dragDelta = 0;
    let suppressClick = false;
    let isDragging = false;
    let captured = false;

    function visibleCount() {
      return window.matchMedia('(max-width: 768px)').matches ? 2 : 4;
    }

    function maxIndex() {
      return Math.max(0, items.length - visible);
    }

    function canSlide() {
      return items.length > visible;
    }

    function stepSize() {
      const first = items[0];
      if (!first) return 0;
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      return first.getBoundingClientRect().width + gap;
    }

    function baseOffset() {
      return -current * stepSize();
    }

    function setTransform(offset, animate) {
      track.style.transition = animate ? '' : 'none';
      track.style.transform = 'translate3d(' + offset + 'px, 0, 0)';
    }

    function applyTransform(animate) {
      setTransform(baseOffset(), animate);
    }

    function clampIndex() {
      const max = maxIndex();
      if (current > max) current = 0;
      if (current < 0) current = max;
    }

    function goTo(index, animate) {
      visible = visibleCount();
      if (!canSlide()) {
        current = 0;
        applyTransform(false);
        stopAutoplay();
        return;
      }
      current = index;
      clampIndex();
      applyTransform(animate);
    }

    function nextSlide() {
      goTo(current >= maxIndex() ? 0 : current + 1, true);
    }

    function prevSlide() {
      goTo(current <= 0 ? maxIndex() : current - 1, true);
    }

    function startAutoplay() {
      stopAutoplay();
      if (!canSlide() || pointerId !== null || isDragging) return;
      timer = window.setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function releaseCapture() {
      if (captured && pointerId !== null) {
        try {
          viewport.releasePointerCapture(pointerId);
        } catch (err) {
          /* ignore */
        }
      }
      captured = false;
    }

    function beginDragCapture(e) {
      if (captured) return;
      try {
        viewport.setPointerCapture(e.pointerId);
        captured = true;
      } catch (err) {
        /* ignore */
      }
    }

    function endDrag() {
      const dragged = isDragging && Math.abs(dragDelta) >= DRAG_THRESHOLD;

      releaseCapture();
      isDragging = false;
      viewport.classList.remove('is-dragging');
      pointerId = null;
      suppressClick = dragged;

      if (!canSlide()) {
        applyTransform(true);
        startAutoplay();
        return;
      }

      if (!dragged) {
        applyTransform(true);
        startAutoplay();
        return;
      }

      if (dragDelta < 0) {
        nextSlide();
      } else {
        prevSlide();
      }

      startAutoplay();
    }

    root.addEventListener('dragstart', function (e) {
      if (!isDragging || !e.target.closest('.home-blog-slider')) {
        return;
      }
      e.preventDefault();
    });

    viewport.addEventListener('pointerdown', function (e) {
      if (!canSlide()) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      pointerId = e.pointerId;
      startX = e.clientX;
      dragDelta = 0;
      isDragging = false;
      suppressClick = false;
      captured = false;
      stopAutoplay();

      if (e.pointerType !== 'mouse') {
        beginDragCapture(e);
      }
    });

    viewport.addEventListener('pointermove', function (e) {
      if (pointerId === null || e.pointerId !== pointerId) return;

      dragDelta = e.clientX - startX;

      if (!isDragging) {
        if (Math.abs(dragDelta) < DRAG_START) return;
        isDragging = true;
        viewport.classList.add('is-dragging');
        setTransform(baseOffset(), false);
        beginDragCapture(e);
      }

      e.preventDefault();
      setTransform(baseOffset() + dragDelta, false);
    });

    viewport.addEventListener('pointerup', function (e) {
      if (pointerId === null || e.pointerId !== pointerId) return;
      endDrag();
    });

    viewport.addEventListener('pointercancel', function (e) {
      if (pointerId === null || e.pointerId !== pointerId) return;
      endDrag();
    });

    root.addEventListener(
      'click',
      function (e) {
        if (!suppressClick) return;
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
      },
      true,
    );

    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', function () {
      if (pointerId === null && !isDragging) {
        startAutoplay();
      }
    });

    window.addEventListener('resize', function () {
      const before = visible;
      visible = visibleCount();
      if (before !== visible) {
        clampIndex();
      }
      applyTransform(false);
      if (pointerId === null && !isDragging) {
        startAutoplay();
      }
    });

    goTo(0, false);
    startAutoplay();
  }
})();
