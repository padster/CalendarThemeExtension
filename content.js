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
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === 'visible') {
      setImageStyle();
    }
  });
}

function createSettingsButtonDOM() {
  var button = document.createElement('a');
  button.id = 'xtnBtn';
  button.className = TOP_BUTTONS_CLASS;
  button.title = 'Background';

  button.innerHTML = `
    <span class="xjKiLb">
      <span class="Ce1Y1c" style="top: -12px; padding-left: 8px;">
        <svg width="24" height="24" viewBox="0 0 18 18" focusable="false" class=" NMm5M hhikbc">
          <path d="M14.5 3.5v11h-11v-11h11zM14.4444 2H3.55556C2.7 2 2 2.7 2 3.55556V14.4444C2 15.3 2.7 16 3.55556 16H14.4444C15.3 16 16 15.3 16 14.4444V3.55556C16 2.7 15.3 2 14.4444 2zM10.5 9l-2 2.9985L7 10l-2 3h8l-2.5-4z" fill="#5f6368"/>
        </svg>
      </span>
    </span>
  `;

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
