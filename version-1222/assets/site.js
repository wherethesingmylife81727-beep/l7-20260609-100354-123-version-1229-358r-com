(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

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
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var search = panel.querySelector('[data-filter-search]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var grid = document.querySelector('[data-filter-grid]');
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

      function apply() {
        var keyword = normalize(search && search.value);
        var typeValue = normalize(type && type.value);
        var yearValue = year && year.value;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = parseInt(card.getAttribute('data-year') || '0', 10);
          var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
          var typeMatch = !typeValue || cardType === typeValue;
          var yearMatch = true;

          if (yearValue === 'classic') {
            yearMatch = cardYear < 2000;
          } else if (yearValue) {
            yearMatch = cardYear >= parseInt(yearValue, 10);
          }

          card.classList.toggle('is-hidden', !(keywordMatch && typeMatch && yearMatch));
        });
      }

      [search, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<a class="movie-card" href="' + escapeHtml(movie.file) + '">',
      '  <div class="poster-frame">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '    <span class="play-glow">▶</span>',
      '  </div>',
      '  <div class="movie-info">',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function initSearch() {
    var input = document.querySelector('[data-site-search]');
    var button = document.querySelector('[data-site-search-button]');
    var results = document.querySelector('[data-search-results]');
    if (!input || !results || !window.SEARCH_MOVIES) {
      return;
    }

    function search() {
      var keyword = normalize(input.value);
      var list = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.oneLine,
          movie.summary,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.year
        ].join(' '));
        return !keyword || haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);

      if (!list.length) {
        results.innerHTML = '<div class="empty-results">没有找到匹配内容，请尝试更换关键词。</div>';
        return;
      }
      results.innerHTML = list.map(movieCard).join('');
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) {
      input.value = params.get('q');
    }
    input.addEventListener('input', search);
    if (button) {
      button.addEventListener('click', search);
    }
    search();
  }

  function initPlayer() {
    var shell = document.querySelector('[data-video-source]');
    if (!shell) {
      return;
    }
    var video = shell.querySelector('video');
    var playButton = shell.querySelector('[data-play]');
    var source = shell.getAttribute('data-video-source');
    var hlsInstance = null;

    function attachSource() {
      if (!video || video.getAttribute('data-source-ready') === 'true') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      video.setAttribute('data-source-ready', 'true');
    }

    function play() {
      attachSource();
      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (playButton) {
      playButton.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.currentTime) {
          shell.classList.remove('is-playing');
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearch();
    initPlayer();
  });
}());
