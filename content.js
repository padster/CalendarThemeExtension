// var FAB_CLASS = 'zlaSJd';
var BUTTON_HOLDER_CLASS = 'uW9umb';
var TOP_BUTTONS_CLASS = 'd6McF';

var PURCHASE_SERVER = 'https://calendar.useit.today';
// if (chrome.runtime.id == 'fkbpcfnnknjdoolkoaliocdnefpkobhi') {
//   PURCHASE_SERVER = 'http://localhost:8080'; // Test mode
// }

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

var DEFAULT_OVERLAY_MODE = 'lghtOverlay';
var DEFAULT_SOUTHERN_HEMISPHERE = false;

USER_INFO = null;
function getUserInfo(cb) {
  if (USER_INFO != null) {
    cb(USER_INFO);
    return;
  }
  chrome.runtime.sendMessage({'type': 'getUserInfo'}, function(userInfo) {
    USER_INFO = userInfo;
    cb(USER_INFO);
  });
}

function maybeShowMismatch(calendarTheme) {
  chrome.storage.sync.get({
    overlayMode: DEFAULT_OVERLAY_MODE,
  }, function(items) {
    var mismatch = (items.overlayMode == 'darkOverlay' && calendarTheme == 'lght') || 
                   (items.overlayMode == 'lghtOverlay' && calendarTheme == 'dark');
    // TODO: Show mismatch warning notification
    if (mismatch) {
      console.log("Warning: theme mismatch detected, please change your background extension theme.");
    }
  });
}

function setImageStyle() {
  var currentMonth = new Date().getMonth();
  // Load settings
  chrome.storage.sync.get({
    imageURL: DEFAULT_IMAGE_URLS,
    overlayMode: DEFAULT_OVERLAY_MODE,
    southernHemisphere: DEFAULT_SOUTHERN_HEMISPHERE,
  }, function(items) {
    // Also load user details, may be needed for purchased themes:
    getUserInfo( userInfo => {
      var monthOffset = items.southernHemisphere ? 6 : 0;

      var imageArray = items.imageURL;
      if (!Array.isArray(imageArray)) {
        imageArray = [imageArray];
      }
      var currentMonth = new Date().getMonth();
      var currentUrl = imageArray[(currentMonth + monthOffset) % imageArray.length];
      if (currentUrl.indexOf(PURCHASE_SERVER) == 0) {
        currentUrl += '&u=' + userInfo.email;
      }
      document.getElementById('xtnImg').style.backgroundImage = "url('" +  currentUrl + "')";

      // Overlay:
      if (items.overlayMode == 'darkOverlay') {
        document.body.classList.add('xtnDarkOverlay');
      } else {
        document.body.classList.remove('xtnDarkOverlay');
      }

      // Check for mismatch:
      var calendarTheme = document.body.classList.contains('CcsDpe') ? 'dark' : 'lght';
      new MutationObserver(() => {
        var calendarTheme = document.body.classList.contains('CcsDpe') ? 'dark' : 'lght';
        maybeShowMismatch(calendarTheme);
      }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    })
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
          <path d="M14.5 3.5v11h-11v-11h11zM14.4444 2H3.55556C2.7 2 2 2.7 2 3.55556V14.4444C2 15.3 2.7 16 3.55556 16H14.4444C15.3 16 16 15.3 16 14.4444V3.55556C16 2.7 15.3 2 14.4444 2zM10.5 9l-2 2.9985L7 10l-2 3h8l-2.5-4z"/>
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
