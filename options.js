var BASE64_KEY = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var COLOR_PIXEL_PREFIX = "data:image/gif;base64,R0lGODlhAQABAPAA";
var COLOR_PIXEL_SUFFIX = "/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
var DEFAULT_COLOR_HEX = "#ffffff";

var PURCHASE_SERVER = 'https://calendar.useit.today';
// if (chrome.runtime.id == 'fkbpcfnnknjdoolkoaliocdnefpkobhi') {
//   PURCHASE_SERVER = 'http://localhost:8080'; // Test mode
// }

var DEFAULT_TOKEN = '';
var TOKEN_LENGTH = 12;

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
var DEFAULT_OVERLAY_MODE = 'lghtOverlay';
// MONTH_OFFSET: Southern hemisphere mode = true/false
var DEFAULT_SOUTHERN_HEMISPHERE = false;

USER_INFO = null;
function getUserInfo(cb) {
  if (USER_INFO != null) {
    cb(USER_INFO);
    return;
  }
  chrome.identity.getProfileUserInfo( {accountStatus: 'ANY'}, userInfo => cb(userInfo) );
}

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

// Initialize hemisphere picker
function loadSouthernHemisphereMode(southernHemisphere) {
  document.getElementById('southern_hemisphere').checked = !!southernHemisphere;
}

// Read hemisphere mode (gets persisted on image save)
function getSouthernHemisphereMode() {
  return !!document.getElementById('southern_hemisphere').checked;
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

// Convert the purchase token + user email + month into the image address to load.
function monthToPurchaseUrl(fullToken, month, email) {
  const parts = fullToken.split('/');
  if (parts.length != 2 || parts[1].length != TOKEN_LENGTH) {
    return;
  }
  const theme = parts[0];
  const token = parts[1];
  const monthName = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][month];

  return PURCHASE_SERVER +
    '/img/' + theme + '/' + monthName + '.jpg' +
    '?t=' + window.encodeURIComponent(token);
}

/** When the image changes, update both the picker and the demo image. */
function updateImageUrl(url) {
  getUserInfo( userInfo => {
    if (url.indexOf("//") == 0) {
      url = "https:" + url;
    }
    if (url.indexOf(PURCHASE_SERVER) == 0) {
      url += '&u=' + userInfo.email;
    }
    document.getElementById('demo').style.backgroundImage = 'url(' + url + ')';

    isDark = (getOverlayMode() == 'darkOverlay')
    sideColor = "rgba(255,255,255,0.3)"
    if (isDark) {
      sideColor = "rgba(0,0,0,0.3)";
    }
    document.getElementById('sidebar').style.backgroundColor = sideColor;
  });
}

/** Change which tab of options are visible. */
function setTab(tab) {
  document.getElementById('demo').style.backgroundImage = 'none';

  document.getElementById('t1').checked = (tab == 't1');
  document.getElementById('t2').checked = (tab == 't2');
  document.getElementById('t3').checked = (tab == 't3');
  document.getElementById('t4').checked = (tab == 't4');

  document.getElementById('t1Fields').style.display = ((tab == 't1') ? "block" : "none");
  document.getElementById('t2Fields').style.display = ((tab == 't2') ? "block" : "none");
  document.getElementById('t3Fields').style.display = ((tab == 't3') ? "block" : "none");
  document.getElementById('t4Fields').style.display = ((tab == 't4') ? "block" : "none");

  // Load user details when looking at the purchase tab
  getUserInfo( userInfo => {
    if (!userInfo.email) {
      document.getElementById('no_email_error').style.display = 'inline-block';
    } else {
      document.getElementById('no_email_error').style.display = 'none';
      redirect_url = PURCHASE_SERVER + '/store?user=' + window.encodeURIComponent(userInfo.email);
      document.getElementById('purchase_redirect').href = redirect_url;
    }
  });
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
  var currentMonth = (new Date().getMonth() + (getSouthernHemisphereMode() ? 6 : 0)) % 12;
  updateImageUrl(imageURL[currentMonth % imageURL.length]);
}

/** Show tab for single colour picker and load colour based on base64 pixel. */
function loadColorOption(imageURL, parsedColorHex) {
  setTab('t3');
  document.getElementById('color').value = parsedColorHex;
  updateImageUrl(imageURL);
}

/** Show tab for user-purchased image sets. */
function loadPurchasedOption(themeToken) {
  setTab('t4');
  document.getElementById('purchase_token').value = themeToken;
  getUserInfo( userInfo => {
    var currentMonth = (new Date().getMonth() + (getSouthernHemisphereMode() ? 6 : 0)) % 12;
    const imageURL = monthToPurchaseUrl(themeToken, currentMonth, userInfo.email);
    updateImageUrl(imageURL);
  });
}

/** Initialize URL from chrome sync options. */
function loadOptions() {
  console.log("Loading options for user ... ");

  chrome.storage.sync.get({
    imageURL: DEFAULT_IMAGE_URLS,
    overlayMode: DEFAULT_OVERLAY_MODE,
    southernHemisphere: DEFAULT_SOUTHERN_HEMISPHERE,
    themeToken: DEFAULT_TOKEN,
  }, function(items) {
    loadOverlayMode(items.overlayMode);
    loadSouthernHemisphereMode(items.southernHemisphere);

    if (!Array.isArray(items.imageURL)) {
      parsedColorHex = urlToMaybeColorHex(items.imageURL);
      if (parsedColorHex) {
        loadColorOption(items.imageURL, parsedColorHex);
      } else {
        loadSingleOption(items.imageURL);
      }
    } else {
      if (items.themeToken != DEFAULT_TOKEN) {
        loadPurchasedOption(items.themeToken);
      } else {
        loadMonthOptions(items.imageURL);
      }
    }

    // Force switch to the token page if in the URL:
    const params = new URLSearchParams(window.location.search);
    if (params.get('token')) {
      loadPurchasedOption(params.get('token'));
      savePurchaseOption();
      return;
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
    southernHemisphere: getSouthernHemisphereMode(),
    // NOTE: doesn't reset themeToken
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
    southernHemisphere: getSouthernHemisphereMode(),
    themeToken: DEFAULT_TOKEN, // force back to unset
  }, function() {
    var currentMonth = new Date().getMonth() + (getSouthernHemisphereMode() ? 6 : 0);
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
    southernHemisphere: getSouthernHemisphereMode(),
    // NOTE: doesn't reset themeToken
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

/** Save purchase option by storing the token. */
function savePurchaseOption() {
  // TODO - handle saving an empty string?

  const fullToken = document.getElementById('purchase_token').value;
  const parts = fullToken.split('/');
  if (parts.length != 2 || parts[1].length != TOKEN_LENGTH) {
    // TODO - warn on error
    alert("Invalid token - please visit the store and copy the token exactly, or click 'Use in calendar'");
    return;
  }

  getUserInfo(userInfo => {
    var imageURLs = [];
    for (var i = 0; i < 12; i++) {
      const url = monthToPurchaseUrl(fullToken, i, userInfo.email);
      imageURLs.push(url);
      document.getElementById('urlMonth' + i).value = url;
    }
    chrome.storage.sync.set({
      imageURL: imageURLs,
      overlayMode: getOverlayMode(),
      southernHemisphere: getSouthernHemisphereMode(),
      themeToken: fullToken,
    }, function() {
      var currentMonth = new Date().getMonth() + (getSouthernHemisphereMode() ? 6 : 0);
      updateImageUrl(imageURLs[currentMonth % imageURLs.length]);
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 1000);
    });
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
  } else if (!!document.getElementById('t4').checked) {
    savePurchaseOption();
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

/** Change paid calendar back to unused. */
function resetPurchasedOption() {
  document.getElementById('purchase_token').value = DEFAULT_TOKEN;
}

/** Reset current URLs to their defaults. */
function resetOptions() {
  if (!!document.getElementById('t1').checked) {
    resetSingleOption();
  } else if (!!document.getElementById('t2').checked) {
    resetMonthOptions();
  } else if (!!document.getElementById('t3').checked) {
    resetColorOption();
  } else if (!!document.getElementById('t4').checked) {
    resetPurchasedOption(); // Keep?
  }
}

/** Set tab after a radio button was selected. */
function changeTab(e) {
  setTab(e.target.id);
}


function main() {
  document.addEventListener('DOMContentLoaded', loadOptions);
  document.getElementById('save').addEventListener('click', saveOptions);
  document.getElementById('reset').addEventListener('click', resetOptions);
  document.getElementById('t1').addEventListener('change', changeTab);
  document.getElementById('t2').addEventListener('change', changeTab);
  document.getElementById('t3').addEventListener('change', changeTab);
  document.getElementById('t4').addEventListener('change', changeTab);
}
main();
