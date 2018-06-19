// background script - CANNOT interact with page

console.log('hello from bg');

chrome.pageAction.onClicked.addListener(() => {
  let bw = new BackgroundWorker();
  bw.handleButtonClick();
});

class BackgroundWorker {

  constructor() {
    console.log('plugin constructor');
  }

  handleButtonClick() {
    console.log('button clicked, sending msg to tab');
    this.sendMessageToCurrentTab({start: 1})
      .then((resp) => {
        console.log("bg page has comments", resp.response);
      })
      .catch((resp) => {
        console.log("UH OH", resp);
      });
  }

  sendMessageToCurrentTab(msg) {
    return new Promise((resolve) => {
      chrome.tabs.query({
        currentWindow: true,
        active: true
      }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          msg,
          (response) => {
            if (!response) {
              console.log('ERR:', chrome.runtime.lastError);
            }
            resolve(response);
          });
      });
    });
  } 

};


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
        urlMatches: '.*\/pull-requests\/.*'
      },
    })
  ],
  actions: [ new chrome.declarativeContent.ShowPageAction() ]
};

chrome.runtime.onInstalled.addListener((details) => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([matchingRule]);
  });
});