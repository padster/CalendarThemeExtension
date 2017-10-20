var DEFAULT_IMAGE_URL =
    'https://lh3.googleusercontent.com/BPPMcW7KfZNOZJM3QNHhye8LtE0pV1bh6vgC9Q7U4bpRfYEZF2' +
    'zczlVQxh3RvhNPKo5RnqoLDGjJJKbsapEXmtkHVar_eRUnWOHK8o9b5w1wyEO72Yn3-H3-dyxgyejHESSno1' +
    '1Q_43LBf4S-VXHMPt3TQEj9UzJ0DMrxLUnqQK0K7Umq8fVhUGG8b9RGbV3pH0sQDynVClkItBgmEebQHVy1t' +
    '2CHc1-3_fhgDIkQ3x8Tppe52Buy0vtAaS2ZSzDpV8ZInsOvAcLMxIKCs7fvKXeTme2dvZXcSD1z7GbLqfPQ-' +
    'QJysNyZfm_xsYhnZtoBrlFvBSCeBJZl-we7Lekd8UGH0XZproH9RxMStU2jbxq3DplY6Ebg2BFaPlCTQRdL6' +
    'y5Q1k-KasC5orVWwc6X1W0pQOmCHg6tgHoeZpd_a1lyMfUyJPdVk0fONgmoE216_A75bxDv-hdTy6PZtA6Fa' +
    'H7EWpbqSE3gyuvVXX1rg3IX57e-twVhQUKd4RruYLhE6FTGP8lWsY9hm41IrtwY6q32UGefvdBzmgOxo9Row' +
    '2GS3VCvScI659UE-9sK1ZsCi6uTz9qckqDdjDu6CN74QJfdNpcYsUj7l7f5M_SVw=w2400'

function loadOptions() {
  chrome.storage.sync.get({
    imageURL: DEFAULT_IMAGE_URL
  }, function(items) {
    document.getElementById('url').value = items.imageURL;
  });
}

function saveOptions() {
  var imageURL = document.getElementById('url').value;
  chrome.storage.sync.set({
    imageURL: imageURL,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);
