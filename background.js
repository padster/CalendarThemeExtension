// RPC handlers for the content script

// Cached getUserInfo
USER_INFO = null;
function getUserInfo(cb) {
  if (USER_INFO != null) {
    cb(USER_INFO);
    return;
  }
  chrome.identity.getProfileUserInfo( {accountStatus: 'ANY'}, userInfo => {
    cb(userInfo);
  } );
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type == "getUserInfo") {
      getUserInfo(userInfo => sendResponse(userInfo));
    }
    return true;
  }
);
