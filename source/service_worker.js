// CANNOT interact with page
import debounce from 'lodash.debounce';

chrome.action.onClicked.addListener(() => {
  console.log("extension button clicked");
  handleButtonClick();
});

// ---------------------------------------------------------
// FIND A WAY TO HANDLE GITHUB PAGE NAVIAGATION
// ONCE PAGE IS LOADED, sendMessageToCurrentTab TO OBFUSCATE
// ---------------------------------------------------------
// let debouncedHandleButtonClick = debounce(() => {
//   handleButtonClick();
// }, 500);

// chrome.webNavigation.onHistoryStateUpdated.addListener((evt) => {
//   console.log("history changed", evt);
//   debouncedHandleButtonClick()
// });

// when extension button is hit
//  * Flip the enabled boolean 
//  * Save it
//  * Tell the tab there was a change
const handleButtonClick = async () => {
  let { isEnabled } = await chrome.storage.local.get(['isEnabled'])
  await chrome.storage.local.set({ isEnabled: !isEnabled }); // store flipped value
  console.log("set isEnabled", isEnabled);

  sendMessageToCurrentTab() // { obfuscate: isEnabled })
    .then((resp) => {
      console.log("response from content script page", resp);
    })
    .catch((resp) => {
      console.log("UH OH", resp);
    });
}

const sendMessageToCurrentTab = (msg) => {
  return chrome.tabs.query({
    currentWindow: true,
    active: true
  }).then((tabs) => {
    return chrome.tabs.sendMessage(
      tabs[0].id,
      msg);
  });
}


// TODO: 2018-09-21 - Can we do this in a Firefox compatible way??
//    Firefox doesn't like "declarativeContent" in manifest.json
//    1 find programmatic way to do declaritveContent (page action button display)
//    2 maybe add it with a webpack plugin and have 2 builds/outputs ?

// if (chrome && chrome.declarativeContent) {
// In Chrome, the page action button display logic happens here instead of manifest.json
var matchingRule = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        urlMatches: '.*\/pulls.*'
      },
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        urlMatches: '.*\/pull\/.*'
      },
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        urlMatches: '.*\/pull-requests.*' // bitbucket
      },
    })
  ],
  actions: [new chrome.declarativeContent.ShowPageAction()]
};

chrome.runtime.onInstalled.addListener((details) => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([matchingRule]);
  });
});
