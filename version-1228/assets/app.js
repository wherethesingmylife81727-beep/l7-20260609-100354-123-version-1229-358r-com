(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    document.querySelectorAll("[data-menu-button]").forEach(function (button) {
      var panel = document.querySelector("[data-mobile-panel]");
      button.addEventListener("click", function () {
        if (panel) {
          panel.classList.toggle("open");
        }
      });
    });

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var index = 0;
      var timer;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      function start() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
      var searchInput = root.querySelector("[data-search-input]");
      var yearFilter = root.querySelector("[data-year-filter]");
      var typeFilter = root.querySelector("[data-type-filter]");
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
      var noResult = root.querySelector("[data-no-result]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query && searchInput) {
        searchInput.value = query;
      }

      function valueOf(el) {
        return el ? el.value : "all";
      }

      function filter() {
        var text = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var year = valueOf(yearFilter);
        var type = valueOf(typeFilter);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.tags, card.dataset.type, card.dataset.year].join(" ").toLowerCase();
          var okText = !text || haystack.indexOf(text) !== -1;
          var okYear = year === "all" || card.dataset.year === year;
          var okType = type === "all" || card.dataset.type === type;
          var ok = okText && okYear && okType;
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (noResult) {
          noResult.classList.toggle("show", visible === 0);
        }
      }

      [searchInput, yearFilter, typeFilter].forEach(function (el) {
        if (el) {
          el.addEventListener("input", filter);
          el.addEventListener("change", filter);
        }
      });

      filter();
    });
  });

  window.initPlayer = function (source) {
    var video = document.getElementById("movie-player");
    var trigger = document.getElementById("player-trigger");
    var loaded = false;
    var hls;

    if (!video || !source) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function play() {
      load();
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
      video.controls = true;
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener("click", play);
    }

    video.addEventListener("play", function () {
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  };
})();
