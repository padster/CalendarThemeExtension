var BASE64_KEY = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var COLOR_PIXEL_PREFIX = "data:image/gif;base64,R0lGODlhAQABAPAA"
var COLOR_PIXEL_SUFFIX = "/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
var DEFAULT_COLOR_HEX = "#ffffff"

var DEFAULT_IMAGE_URLS = [
  '//storage.googleapis.com/static.useit.today/wallCalendarImg/January.jpg',
  '//storage.googleapis.com/static.useit.today/wallCalendarImg/February.jpg',
  '//storage.googleapis.com/static.useit.today/wallCalendarImg/March.jpg',
  '//storage.googleapis.com/static.useit.today/wallCalendarImg/April.jpg',
  '//storage.googleapis.com/static.useit.today/wallCalendarImg/May.jpg',
  '//storage.googleapis.com/static.useit.today/wallCalendarImg/June.jpg',
  '//storage.googleapis.com/static.useit.today/wallCalendarImg/July.jpg',
  '//storage.googleapis.com/static.useit.today/wallCalendarImg/August.jpg',
  '//storage.googleapis.com/static.useit.today/wallCalendarImg/September.jpg',
  '//storage.googleapis.com/static.useit.today/wallCalendarImg/October.jpg',
  '//storage.googleapis.com/static.useit.today/wallCalendarImg/November.jpg',
  '//storage.googleapis.com/static.useit.today/wallCalendarImg/December.jpg',
];

// OVERLAY: either lghtOverlay (default) or darkOverlay
DEFAULT_OVERLAY_MODE = 'lghtOverlay';

// Initialize overlay picker
function loadOverlayMode(overlayMode) {
  isDark = (overlayMode == 'darkOverlay')
  document.getElementById('o1').checked = !isDark;
  document.getElementById('o2').checked = isDark;
}

// Read overlay mode (gets persisted on image save)
function getOverlayMode() {
  if (document.getElementById('o2').checked) {
    return 'darkOverlay';
  } else {
    return 'lghtOverlay';
  }
}


// Encode three 8-bit numbers to 4 6-bit base64
// Kudos to https://stackoverflow.com/questions/5845238/javascript-generate-transparent-1x1-pixel-in-dataurl-format
function tripletEncode(e1, e2, e3) {
  enc1 = e1 >> 2;
  enc2 = ((e1 & 3) << 4) | (e2 >> 4);
  enc3 = ((e2 & 15) << 2) | (e3 >> 6);
  enc4 = e3 & 63;
  return BASE64_KEY.charAt(enc1) + BASE64_KEY.charAt(enc2) + BASE64_KEY.charAt(enc3) + BASE64_KEY.charAt(enc4);
}

// Decode 4 6-bit base64 to three 8-bit numbers (reverse the above)
function tripletDecode(aaaa) {
  enc1 = BASE64_KEY.indexOf(aaaa[0])
  enc2 = BASE64_KEY.indexOf(aaaa[1])
  enc3 = BASE64_KEY.indexOf(aaaa[2])
  enc4 = BASE64_KEY.indexOf(aaaa[3])
  e3 = ((enc3 & 3) << 6) | enc4
  e2 = ((enc2 & 15) << 4) | (enc3 >> 2)
  e1 = (enc1 << 2) | (enc2 >> 4)
  return [e1, e2, e3]
}

// Reverse colorHexToUrl back into a hex color.
// If it's not from colorHexToUrl, return null.
function urlToMaybeColorHex(url) {
  if (!url.startsWith(COLOR_PIXEL_PREFIX) || !url.endsWith(COLOR_PIXEL_SUFFIX)) {
    return null;
  }

  encoded = url.substring(COLOR_PIXEL_PREFIX.length, url.length - COLOR_PIXEL_SUFFIX.length)
  _rg = tripletDecode(encoded.substring(0, 4))
  b__ = tripletDecode(encoded.substring(4, 8))
  r = _rg[1]
  g = _rg[2]
  b = b__[0]
  // Kudos to https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Convert a hex color (#aabbcc) to a data URL for a 1x1 pixel of that color
function colorHexToUrl(hexColor) {
  var s = hexColor.substring(1, 7);
  r = parseInt(s[0] + s[1], 16)
  g = parseInt(s[2] + s[3], 16)
  b = parseInt(s[4] + s[5], 16)
  encoded = tripletEncode(0, r, g) + tripletEncode(b, 255, 255);
  return COLOR_PIXEL_PREFIX + encoded + COLOR_PIXEL_SUFFIX;
}

/** When the image changes, update both the picker and the demo image. */
function updateImageUrl(url) {
  if (url.indexOf("//") == 0) {
    url = "https:" + url;
  }
  document.getElementById('demo').style.backgroundImage = 'url(' + url + ')';

  isDark = (getOverlayMode() == 'darkOverlay')
  sideColor = "rgba(255,255,255,0.3)"
  if (isDark) {
    sideColor = "rgba(0,0,0,0.3)";
  }
  document.getElementById('sidebar').style.backgroundColor = sideColor;
}

/** Change which tab of options are visible. */
function setTab(tab) {
  document.getElementById('demo').style.backgroundImage = 'none';

  document.getElementById('t1').checked = (tab == 't1');
  document.getElementById('t2').checked = (tab == 't2');
  document.getElementById('t3').checked = (tab == 't3');

  document.getElementById('t1Fields').style.display = ((tab == 't1') ? "block" : "none");
  document.getElementById('t2Fields').style.display = ((tab == 't2') ? "block" : "none");
  document.getElementById('t3Fields').style.display = ((tab == 't3') ? "block" : "none");
}

/** Show single tab, and update the one URL to use. */
function loadSingleOption(singleImageURL) {
  setTab('t1');
  document.getElementById('url').value = singleImageURL;
  updateImageUrl(singleImageURL);
}

/** Show tab for 12 images, and update the URL to use based on this month. */
function loadMonthOptions(imageURL) {
  setTab('t2');
  document.getElementById('t2').checked = true;
  for (var i = 0; i < imageURL.length && i < 12; i++) {
    document.getElementById('urlMonth' + i).value = imageURL[i];
  }
  var currentMonth = new Date().getMonth();
  updateImageUrl(imageURL[currentMonth % imageURL.length]);
}

/** Show tab for single colour picker and load colour based on base64 pixel. */
function loadColorOption(imageURL, parsedColorHex) {
  setTab('t3');
  document.getElementById('color').value = parsedColorHex;
  updateImageUrl(imageURL);
}

/** Initialize URL from chrome sync options. */
function loadOptions() {
  chrome.storage.sync.get({
    imageURL: DEFAULT_IMAGE_URLS,
    overlayMode: DEFAULT_OVERLAY_MODE,
  }, function(items) {
    loadOverlayMode(items.overlayMode);

    if (!Array.isArray(items.imageURL)) {
      parsedColorHex = urlToMaybeColorHex(items.imageURL);
      if (parsedColorHex) {
        loadColorOption(items.imageURL, parsedColorHex);
      } else {
        loadSingleOption(items.imageURL);
      }
    } else {
      loadMonthOptions(items.imageURL);
    }
  });
}

/** Save a single image URL as the one to use. */
function saveSingleOption() {
  var imageURL = document.getElementById('url').value;
  if (imageURL.length == 0) {
    imageURL = DEFAULT_IMAGE_URLS[0];
    document.getElementById('url').value = imageURL;
  }
  chrome.storage.sync.set({
    imageURL: imageURL,
    overlayMode: getOverlayMode(),
  }, function() {
    updateImageUrl(imageURL);
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);
  });
}

/** Save a collection of up to twelve images, for use once per month. */
function saveMonthOptions() {
  var imageURL = [];
  for (var i = 0; i < 12; i++) {
    var url = document.getElementById('urlMonth' + i).value;
    if (url) {
      imageURL.push(url);
    }
  }
  if (imageURL.length == 0) {
    imageURL = DEFAULT_IMAGE_URLS;
    for (var i = 0; i < imageURL.length && i < 12; i++) {
      document.getElementById('urlMonth' + i).value = imageURL[i];
    }
  }
  chrome.storage.sync.set({
    imageURL: imageURL,
    overlayMode: getOverlayMode(),
  }, function() {
    var currentMonth = new Date().getMonth();
    updateImageUrl(imageURL[currentMonth % imageURL.length]);
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);
  });
}

/** Save colour by generating data URL to single pixel of that color. */
function saveColorOptions() {
  var colorHex = document.getElementById('color').value;
  var imageURL = colorHexToUrl(colorHex)

  chrome.storage.sync.set({
    imageURL: imageURL,
    overlayMode: getOverlayMode(),
  }, function() {
    updateImageUrl(imageURL);
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);
  });
}

/** Persist extension options to chrome sync. */
function saveOptions() {
  if (!!document.getElementById('t1').checked) {
    saveSingleOption();
  } else if (!!document.getElementById('t2').checked) {
    saveMonthOptions();
  } else if (!!document.getElementById('t3').checked) {
    saveColorOptions();
  }
}

/** Change the single URL tab back to the default path. */
function resetSingleOption() {
  document.getElementById('url').value = DEFAULT_IMAGE_URLS[0];
}

/** Change the all month paths to their default URLs. */
function resetMonthOptions() {
  for (var i = 0; i < 12; i++) {
    document.getElementById('urlMonth' + i).value = DEFAULT_IMAGE_URLS[i];
  }
}

/** Change single color back to the default color. */
function resetColorOption() {
  document.getElementById('color').value = DEFAULT_COLOR_HEX;
}

/** Reset current URLs to their defaults. */
function resetOptions() {
  if (!!document.getElementById('t1').checked) {
    resetSingleOption();
  } else if (!!document.getElementById('t2').checked) {
    resetMonthOptions();
  } else if (!!document.getElementById('t3').checked) {
    resetColorOption();
  }
}

/** Set tab after a radio button was selected. */
function changeTab(e) {
  setTab(e.target.id);
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('reset').addEventListener('click', resetOptions);
document.getElementById('t1').addEventListener('change', changeTab);
document.getElementById('t2').addEventListener('change', changeTab);
document.getElementById('t3').addEventListener('change', changeTab);
