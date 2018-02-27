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

/** When the image changes, update both the picker and the demo image. */
function updateImageUrl(url) {
  if (url.indexOf("//") == 0) {
    url = "https:" + url;
  }
  document.getElementById('demo').style.backgroundImage = 'url(' + url + ')';
}

/** Change which tab of options are visible. */
function setTab(tab) {
  isT1 = (tab == 't1');
  document.getElementById('demo').style.backgroundImage = 'none';
  document.getElementById('t1').checked = isT1;
  document.getElementById('t2').checked = !isT1;
  document.getElementById('t1Fields').style.display = (isT1 ? "block" : "none");
  document.getElementById('t2Fields').style.display = (isT1 ? "none" : "block");
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

/** Initialize URL from chrome sync options. */
function loadOptions() {
  chrome.storage.sync.get({
    imageURL: DEFAULT_IMAGE_URLS
  }, function(items) {
    if (!Array.isArray(items.imageURL)) {
      loadSingleOption(items.imageURL);
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

/** Persist extension options to chrome sync. */
function saveOptions() {
  if (!!document.getElementById('t1').checked) {
    saveSingleOption();
  } else {
    saveMonthOptions();
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

/** Reset current URLs to their defaults. */
function resetOptions() {
  if (!!document.getElementById('t1').checked) {
    resetSingleOption();
  } else {
    resetMonthOptions();
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
