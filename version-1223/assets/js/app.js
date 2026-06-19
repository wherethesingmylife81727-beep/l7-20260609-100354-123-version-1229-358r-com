(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      button.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-category') || '',
      card.getAttribute('data-tags') || ''
    ].join(' ').toLowerCase();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var section = panel.closest('.content-section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
      var input = panel.querySelector('[data-search-input]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var categorySelect = panel.querySelector('[data-filter-category]');
      var empty = section.querySelector('[data-empty-state]');
      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var typeValue = typeSelect ? typeSelect.value : '';
        var yearValue = yearSelect ? parseInt(yearSelect.value || '0', 10) : 0;
        var categoryValue = categorySelect ? categorySelect.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = textOf(card);
          var year = parseInt(card.getAttribute('data-year') || '0', 10);
          var type = card.getAttribute('data-type') || '';
          var category = card.getAttribute('data-category') || '';
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (typeValue && type.indexOf(typeValue) === -1) {
            matched = false;
          }
          if (yearValue && year < yearValue) {
            matched = false;
          }
          if (categoryValue && category !== categoryValue) {
            matched = false;
          }
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }
      [input, typeSelect, yearSelect, categorySelect].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupPlayer() {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-button]');
    var stream = player.getAttribute('data-stream');
    var hlsInstance = null;
    if (!video || !stream) {
      return;
    }
    function bindStream() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.getAttribute('src') !== stream) {
          video.setAttribute('src', stream);
        }
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        }
        return;
      }
      if (video.getAttribute('src') !== stream) {
        video.setAttribute('src', stream);
      }
    }
    function play() {
      bindStream();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
}());
