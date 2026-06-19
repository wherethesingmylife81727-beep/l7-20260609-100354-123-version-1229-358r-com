(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      var typeValue = normalize(typeSelect ? typeSelect.value : '');
      var yearValue = normalize(yearSelect ? yearSelect.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        var typeText = normalize(card.getAttribute('data-type'));
        var yearText = normalize(card.getAttribute('data-year'));
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (typeValue && typeText.indexOf(typeValue) === -1) {
          matched = false;
        }
        if (yearValue && yearText !== yearValue) {
          matched = false;
        }

        card.classList.toggle('hidden', !matched);
      });
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  function movieCard(movie) {
    var text = [movie.title, movie.region, movie.type, movie.year, (movie.tags || []).join(' ')].join(' ');
    return [
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-year="' + escapeHtml(movie.year) + '" data-tags="' + escapeHtml(text) + '">',
      '  <a class="movie-card-link" href="./' + escapeHtml(movie.file) + '">',
      '    <span class="movie-thumb">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="movie-region">' + escapeHtml(movie.region) + '</span>',
      '      <span class="movie-play">▶</span>',
      '    </span>',
      '    <span class="movie-card-body">',
      '      <strong>' + escapeHtml(movie.title) + '</strong>',
      '      <em>' + escapeHtml(movie.oneLine) + '</em>',
      '      <span class="movie-meta"><b>' + escapeHtml(movie.type) + '</b><i>' + escapeHtml(movie.year) + '</i></span>',
      '    </span>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var results = document.getElementById('search-results');
    var input = document.getElementById('site-search-input');
    var title = document.getElementById('search-title');
    var summary = document.getElementById('search-summary');

    if (!results || !input || !Array.isArray(window.siteMovies)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function render() {
      var query = input.value.trim().toLowerCase();
      var matched = window.siteMovies.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, 120);

      results.innerHTML = matched.map(movieCard).join('');

      if (title) {
        title.textContent = query ? '搜索结果：' + input.value.trim() : '热门片单';
      }
      if (summary) {
        summary.textContent = matched.length ? '已为你匹配相关影片，点击卡片进入详情页。' : '没有找到相关影片，可以换一个关键词。';
      }
    }

    input.addEventListener('input', render);
    var form = document.querySelector('[data-search-form]');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
    }
    render();
  }

  initSearchPage();
})();

function setupMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var overlay = document.getElementById(config.overlayId);
  var button = document.getElementById(config.buttonId);
  var attached = false;
  var hlsInstance = null;

  if (!video || !overlay || !button || !config.stream) {
    return;
  }

  function attachStream() {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(config.stream);
      hlsInstance.attachMedia(video);
    } else {
      video.src = config.stream;
    }

    attached = true;
  }

  function playVideo() {
    attachStream();
    overlay.classList.add('is-hidden');
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', function (event) {
    event.stopPropagation();
    playVideo();
  });

  overlay.addEventListener('click', playVideo);
  overlay.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      playVideo();
    }
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
