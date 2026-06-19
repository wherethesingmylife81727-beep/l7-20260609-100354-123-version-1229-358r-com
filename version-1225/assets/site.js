(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
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
        };

        var start = function () {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        };

        var restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        showSlide(0);
        start();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var searchArea = document.querySelector('[data-search-area]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
    var activeCategory = 'all';

    var applySearch = function () {
        if (!searchArea) {
            return;
        }

        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var cards = Array.prototype.slice.call(searchArea.querySelectorAll('.searchable-card'));

        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var category = card.getAttribute('data-category') || '';
            var categoryMatched = activeCategory === 'all' || category === activeCategory;
            var keywordMatched = !keyword || text.indexOf(keyword) !== -1;

            card.classList.toggle('is-hidden', !(categoryMatched && keywordMatched));
        });
    };

    if (searchInput) {
        searchInput.addEventListener('input', applySearch);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeCategory = button.getAttribute('data-filter-category') || 'all';

            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });

            applySearch();
        });
    });

    applySearch();

    var player = document.querySelector('[data-player]');

    if (player) {
        var video = player.querySelector('video');
        var playButton = player.querySelector('.play-button');
        var hlsUrl = player.getAttribute('data-hls');
        var hlsInstance = null;

        var attachStream = function () {
            if (!video || !hlsUrl || video.getAttribute('data-ready') === 'yes') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = hlsUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(hlsUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = hlsUrl;
            }

            video.setAttribute('data-ready', 'yes');
        };

        var startVideo = function () {
            if (!video) {
                return;
            }

            attachStream();
            player.classList.add('is-playing');
            var playAction = video.play();

            if (playAction && typeof playAction.catch === 'function') {
                playAction.catch(function () {});
            }
        };

        if (playButton) {
            playButton.addEventListener('click', startVideo);
        }

        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                player.classList.remove('is-playing');
            });

            video.addEventListener('click', function () {
                if (video.paused) {
                    startVideo();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }
})();
