var DEFAULT_IMAGE_URL = 'http://static.useit.today/wallCalendarImg/October.jpg';

/** When the image changes, update both the picker and the demo image. */
function updateImageUrl(url) {
  document.getElementById('url').value = url;
  document.getElementById('demo').style.backgroundImage = 'url(' + url + ')';
}

/** Initialize URL from chrome sync options. */
function loadOptions() {
  chrome.storage.sync.get({
    imageURL: DEFAULT_IMAGE_URL
  }, function(items) {
    updateImageUrl(items.imageURL);
  });
}

/** Persist extension options to chrome sync. */
function saveOptions() {
  var imageURL = document.getElementById('url').value;
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

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);
