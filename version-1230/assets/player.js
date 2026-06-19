(function () {
  window.initializeMoviePlayer = function (url) {
    var video = document.querySelector('.js-video-player');
    var overlay = document.querySelector('.js-player-overlay');
    var ready = false;
    var hlsInstance = null;

    if (!video || !url) {
      return;
    }

    function attachSource() {
      if (ready) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function beginPlayback() {
      attachSource();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', beginPlayback);
    }

    video.addEventListener('click', function () {
      if (!ready) {
        beginPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
