(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  ready(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
      navToggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });

    initHero();
    initFilters();
    initPlayer();
    initScrollPlayer();
  });

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        start();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        show(parseInt(thumb.getAttribute('data-hero-thumb'), 10) || 0);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var controls = document.querySelector('[data-library-controls]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (!controls || !cards.length) {
      return;
    }

    var keywordInput = controls.querySelector('[data-filter-keyword]');
    var categorySelect = controls.querySelector('[data-filter-category]');
    var yearInput = controls.querySelector('[data-filter-year]');
    var resetButton = controls.querySelector('[data-filter-reset]');
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && keywordInput) {
      keywordInput.value = initialQuery;
    }

    function apply() {
      var keyword = text(keywordInput && keywordInput.value);
      var category = text(categorySelect && categorySelect.value);
      var year = text(yearInput && yearInput.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-category'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okCategory = !category || text(card.getAttribute('data-category')) === category;
        var okYear = !year || text(card.getAttribute('data-year')) === year;
        var show = okKeyword && okCategory && okYear;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [keywordInput, categorySelect, yearInput].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }
        if (categorySelect) {
          categorySelect.value = '';
        }
        if (yearInput) {
          yearInput.value = '';
        }
        apply();
      });
    }

    apply();
  }

  function initPlayer() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play]');

      if (!video || !button) {
        return;
      }

      button.addEventListener('click', function () {
        var source = video.getAttribute('data-src');
        if (!source) {
          return;
        }

        button.hidden = true;
        video.controls = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (video._hls) {
            video._hls.destroy();
          }
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          video._hls = hls;
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              hls.destroy();
              video.src = source;
            }
          });
          return;
        }

        video.src = source;
        video.play().catch(function () {});
      });
    });
  }

  function initScrollPlayer() {
    document.querySelectorAll('[data-scroll-player]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var target = document.querySelector('[data-player]');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          var play = target.querySelector('[data-play]');
          if (play) {
            play.focus();
          }
        }
      });
    });
  }
})();
