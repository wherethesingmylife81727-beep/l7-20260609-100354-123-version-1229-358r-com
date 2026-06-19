(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function initFilters() {
    var input = document.querySelector("[data-search-input]");
    var year = document.querySelector("[data-filter-year]");
    var region = document.querySelector("[data-filter-region]");
    var type = document.querySelector("[data-filter-type]");
    var scope = document.querySelector("[data-card-scope]") || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");

    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : "";
    }

    function apply() {
      var q = valueOf(input);
      var y = valueOf(year);
      var r = valueOf(region);
      var t = valueOf(type);
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-type") || ""
        ].join(" ").toLowerCase();
        var ok = true;

        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (y && (card.getAttribute("data-year") || "").toLowerCase() !== y) {
          ok = false;
        }
        if (r && (card.getAttribute("data-region") || "").toLowerCase() !== r) {
          ok = false;
        }
        if (t && (card.getAttribute("data-type") || "").toLowerCase() !== t) {
          ok = false;
        }

        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    [input, year, region, type].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });

    apply();
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector("script[data-hls-library]");
    if (existing) {
      existing.addEventListener("load", callback);
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-library", "true");
    script.addEventListener("load", callback);
    document.head.appendChild(script);
  }

  window.setupPlayer = function (stream) {
    ready(function () {
      var box = document.querySelector("[data-player]");
      var video = document.querySelector("[data-video]");
      var button = document.querySelector("[data-play-button]");
      if (!box || !video || !button || !stream) {
        return;
      }

      var started = false;
      var hls = null;

      function attachAndPlay() {
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        button.classList.add("is-hidden");
        video.controls = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.play().catch(function () {
            button.classList.remove("is-hidden");
          });
          return;
        }

        loadHls(function () {
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {
                button.classList.remove("is-hidden");
              });
            });
          } else {
            video.src = stream;
            video.play().catch(function () {
              button.classList.remove("is-hidden");
            });
          }
        });
      }

      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        attachAndPlay();
      });

      box.addEventListener("click", function (event) {
        if (event.target === video || event.target === box) {
          attachAndPlay();
        }
      });

      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });

      video.addEventListener("pause", function () {
        if (!video.ended) {
          button.classList.remove("is-hidden");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
