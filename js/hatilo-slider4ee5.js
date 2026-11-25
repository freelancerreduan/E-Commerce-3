(function () {
  const track = document.getElementById('hatiloBannerTrack');
  if (!track) return;

  const slides = track.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('.banner-dot');
  const prev = document.querySelector('.banner-prev');
  const next = document.querySelector('.banner-next');
  let current = 0;
  let timer;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function nextSlide() {
    show(current + 1);
  }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
  }

  prev?.addEventListener('click', () => {
    show(current - 1);
    startAutoplay();
  });
  next?.addEventListener('click', () => {
    nextSlide();
    startAutoplay();
  });
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(parseInt(dot.dataset.index, 10));
      startAutoplay();
    });
  });

  track.addEventListener('mouseenter', stopAutoplay);
  track.addEventListener('mouseleave', startAutoplay);

  if (slides.length > 1) startAutoplay();
})();
