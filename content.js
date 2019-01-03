// var FAB_CLASS = 'zlaSJd';
var BUTTON_HOLDER_CLASS = 'uW9umb';
var TOP_BUTTONS_CLASS = 'd6McF';

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

function setImageStyle() {
  var currentMonth = new Date().getMonth();
  chrome.storage.sync.get({
    imageURL: DEFAULT_IMAGE_URLS
  }, function(items) {
    var imageArray = items.imageURL;
    if (!Array.isArray(imageArray)) {
      imageArray = [imageArray];
    }
    var currentMonth = new Date().getMonth();
    var currentImage = imageArray[currentMonth % imageArray.length];
    document.getElementById('xtnImg').style.backgroundImage = "url('" +  currentImage + "')";
  });
}

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
  console.log("Installing Calendar background extension...");
  var banner = document.getElementById('gb');
  var imageDOM = createImageDOM();
  banner.parentElement.insertBefore(imageDOM, banner);
  setImageStyle();
  window.addEventListener('focus', function(e) { setImageStyle(); });
}

function createSettingsButtonDOM() {
  var button = document.createElement('a');
  button.id = 'xtnBtn';
  button.className = TOP_BUTTONS_CLASS;
  button.title = 'Background';
  var buttonContent = document.createElement('div');
  buttonContent.id = 'xtnBtnContent'
  buttonContent.className = 'Gw6Zhc';
  button.appendChild(buttonContent);
  button.href = 'chrome-extension://' + chrome.runtime.id + '/options.html';
  button.target = '_blank';
  return button;
}

function installSettingsButton() {
  var addButton = document.querySelector('.' + BUTTON_HOLDER_CLASS);
  var newButton = createSettingsButtonDOM();
  addButton.insertBefore(newButton, addButton.firstElementChild);
}

function install() {
  installImage();
  installSettingsButton();
}

install();
