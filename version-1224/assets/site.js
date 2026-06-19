(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function activate(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
      });
    });
    window.setInterval(function () {
      activate((current + 1) % slides.length);
    }, 5000);
  }

  function getText(card) {
    return (card.getAttribute('data-text') || '').toLowerCase();
  }

  function setupFilters() {
    Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]')).forEach(function (panel) {
      var scopeName = panel.getAttribute('data-filter-form');
      var scope = scopeName ? document.querySelector('[data-filter-scope="' + scopeName + '"]') : document;
      if (!scope) {
        return;
      }
      var input = panel.querySelector('[data-search-input]');
      var typeSelect = panel.querySelector('[data-type-select]');
      var yearSelect = panel.querySelector('[data-year-select]');
      var empty = document.querySelector('[data-empty-state="' + scopeName + '"]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card], [data-rank-card]'));
      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var matchedKeyword = !keyword || getText(card).indexOf(keyword) >= 0;
          var matchedType = !type || card.getAttribute('data-type') === type;
          var matchedYear = !year || card.getAttribute('data-year') === year;
          var show = matchedKeyword && matchedType && matchedYear;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
      apply();
    });
  }

  function setupPlayers() {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('[data-play-cover]');
      var url = player.getAttribute('data-video');
      var loaded = false;
      var hlsInstance = null;
      function loadAndPlay() {
        if (!video || !url) {
          return;
        }
        if (cover) {
          cover.classList.add('is-hidden');
        }
        if (!loaded) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
          } else {
            video.src = url;
          }
          loaded = true;
        }
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }
      if (cover) {
        cover.addEventListener('click', loadAndPlay);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!loaded || video.paused) {
            loadAndPlay();
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
