(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var previous = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function restartHero() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    startHero();
  }

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  if (previous) {
    previous.addEventListener('click', function () {
      showSlide(current - 1);
      restartHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      restartHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      restartHero();
    });
  });

  var searchInput = document.querySelector('.js-search-input');
  var yearFilter = document.querySelector('.js-year-filter');
  var categoryFilter = document.querySelector('.js-category-filter');
  var sortFilter = document.querySelector('.js-sort-filter');
  var grid = document.querySelector('.js-filter-grid');
  var emptyState = document.querySelector('.js-empty-state');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function getCards() {
    if (!grid) {
      return [];
    }
    return Array.prototype.slice.call(grid.querySelectorAll('.js-movie-card'));
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-genre'),
      card.textContent
    ].join(' '));
  }

  function applyFilters() {
    var cards = getCards();
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInput && searchInput.value);
    var year = normalize(yearFilter && yearFilter.value);
    var category = normalize(categoryFilter && categoryFilter.value);
    var visible = 0;

    cards.forEach(function (card) {
      var matchQuery = !query || cardText(card).indexOf(query) !== -1;
      var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
      var matchCategory = !category || normalize(card.getAttribute('data-category')) === category;
      var matched = matchQuery && matchYear && matchCategory;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  function applySort() {
    if (!grid || !sortFilter) {
      return;
    }
    var cards = getCards();
    var mode = sortFilter.value;
    if (mode === 'year-desc') {
      cards.sort(function (a, b) {
        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
      });
    } else if (mode === 'title-asc') {
      cards.sort(function (a, b) {
        return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
      });
    } else {
      cards.sort(function (a, b) {
        return Number(a.getAttribute('data-order') || 0) - Number(b.getAttribute('data-order') || 0);
      });
    }
    cards.forEach(function (card) {
      grid.appendChild(card);
    });
    applyFilters();
  }

  [searchInput, yearFilter, categoryFilter].forEach(function (element) {
    if (element) {
      element.addEventListener('input', applyFilters);
      element.addEventListener('change', applyFilters);
    }
  });

  if (sortFilter) {
    sortFilter.addEventListener('change', applySort);
  }
})();
