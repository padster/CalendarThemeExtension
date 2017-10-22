var FAB_CLASS = 'zlaSJd';

// TODO - make a nicer URL
var DEFAULT_IMAGE_URL =
    'https://lh3.googleusercontent.com/BPPMcW7KfZNOZJM3QNHhye8LtE0pV1bh6vgC9Q7U4bpRfYEZF2' +
    'zczlVQxh3RvhNPKo5RnqoLDGjJJKbsapEXmtkHVar_eRUnWOHK8o9b5w1wyEO72Yn3-H3-dyxgyejHESSno1' +
    '1Q_43LBf4S-VXHMPt3TQEj9UzJ0DMrxLUnqQK0K7Umq8fVhUGG8b9RGbV3pH0sQDynVClkItBgmEebQHVy1t' +
    '2CHc1-3_fhgDIkQ3x8Tppe52Buy0vtAaS2ZSzDpV8ZInsOvAcLMxIKCs7fvKXeTme2dvZXcSD1z7GbLqfPQ-' +
    'QJysNyZfm_xsYhnZtoBrlFvBSCeBJZl-we7Lekd8UGH0XZproH9RxMStU2jbxq3DplY6Ebg2BFaPlCTQRdL6' +
    'y5Q1k-KasC5orVWwc6X1W0pQOmCHg6tgHoeZpd_a1lyMfUyJPdVk0fONgmoE216_A75bxDv-hdTy6PZtA6Fa' +
    'H7EWpbqSE3gyuvVXX1rg3IX57e-twVhQUKd4RruYLhE6FTGP8lWsY9hm41IrtwY6q32UGefvdBzmgOxo9Row' +
    '2GS3VCvScI659UE-9sK1ZsCi6uTz9qckqDdjDu6CN74QJfdNpcYsUj7l7f5M_SVw=w2400'

function createImageDOM() {
  var imgHolder = document.createElement('div');
  var img = document.createElement('div');
  var imgFade = document.createElement('div');
  imgHolder.id = 'xtnImgHolder';
  img.id = 'xtnImg';
  imgFade.id = 'xtnImgFade'
  imgHolder.appendChild(img);
  imgHolder.appendChild(imgFade);
  return imgHolder;
}

function installImage() {
  var banner = document.getElementById('gb');
  var imageDOM = createImageDOM();
  banner.parentElement.insertBefore(imageDOM, banner);
  chrome.storage.sync.get({
    imageURL: DEFAULT_IMAGE_URL
  }, function(items) {
    document.getElementById('xtnImg').style.backgroundImage = "url('" +  items.imageURL + "')";
  });
}

function createSettingsButtonDOM() {
  var button = document.createElement('a');
  button.id = 'xtnBtn';
  button.className = FAB_CLASS;
  var buttonContent = document.createElement('div');
  buttonContent.id = 'xtnBtnContent'
  buttonContent.className = 'XHsn7e Gw6Zhc';
  button.appendChild(buttonContent);
  button.href = 'chrome-extension://' + chrome.runtime.id + '/options.html';
  button.target = '_blank';
  return button;
}

function installSettingsButton() {
  var addButton = document.querySelector('.' + FAB_CLASS);
  var newButton = createSettingsButtonDOM();
  addButton.parentElement.insertBefore(newButton, addButton);
}

function install() {
  installImage();
  installSettingsButton();
}

install();
