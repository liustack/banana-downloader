(function () {
  'use strict';

  var _fetch = window.fetch;
  var pendingCaptureIds = [];
  var MAX_PENDING_CAPTURES = 64;

  window.addEventListener('message', function (event) {
    if (event.source !== window || !event.data) {
      return;
    }

    if (event.data.type === 'GBD_CAPTURE_EXPECT' && typeof event.data.captureId === 'string') {
      pendingCaptureIds.push(event.data.captureId);

      if (pendingCaptureIds.length > MAX_PENDING_CAPTURES) {
        pendingCaptureIds.splice(0, pendingCaptureIds.length - MAX_PENDING_CAPTURES);
      }
      return;
    }

    if (event.data.type === 'GBD_CAPTURE_CANCEL' && typeof event.data.captureId === 'string') {
      var idx = pendingCaptureIds.indexOf(event.data.captureId);
      if (idx !== -1) {
        pendingCaptureIds.splice(idx, 1);
      }
    }
  });

  // Patch fetch to intercept final image responses from Gemini download chain.
  // Redirect chain: gg-dl/ -> (text) -> rd-gg-dl/ -> (text) -> rd-gg-dl/ -> image/png
  //
  // Download suppression (preventing the native blob: download) is handled by
  // the background service worker via chrome.downloads.onCreated — that approach
  // is reliable regardless of how the page triggers downloads (anchor.click,
  // dispatchEvent, navigation, etc.)
  window.fetch = async function () {
    var args = arguments;
    var response = await _fetch.apply(this, args);
    var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url);

    if (url && (url.indexOf('/rd-gg-dl/') !== -1 || url.indexOf('/gg-dl/') !== -1)) {
      var contentType = response.headers.get('content-type') || '';
      if (contentType.indexOf('image/') === 0) {
        // Final image in the redirect chain — convert to data URL and post to content script
        var captureId = pendingCaptureIds.length > 0 ? pendingCaptureIds.shift() : null;
        var cloned = response.clone();
        cloned.blob().then(function (blob) {
          var reader = new FileReader();
          reader.onload = function () {
            window.postMessage({
              type: 'GBD_IMAGE_CAPTURED',
              captureId: captureId,
              dataUrl: reader.result,
              size: blob.size
            }, '*');
          };
          reader.readAsDataURL(blob);
        });
      }
    }

    return response;
  };
})();
