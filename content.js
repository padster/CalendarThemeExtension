var FAB_CLASS = 'zlaSJd';
var DEFAULT_IMAGE_URL = 'http://static.useit.today/wallCalendarImg/October.jpg';

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
