// background script - CANNOT interact with page

// console.log('hello from bg');

chrome.pageAction.onClicked.addListener(() => {
  let bw = new BackgroundWorker();
  bw.handleButtonClick();
});

class BackgroundWorker {

  constructor() {
    this.isEnabled = true;
  }

  handleButtonClick() {
    chrome.storage.local.get(['isEnabled'], (storage) => {
      let storedIsEnabled = storage.isEnabled;
      this.isEnabled = !Boolean(storedIsEnabled); // flip it & make it a bool
      chrome.storage.local.set({isEnabled: this.isEnabled}); // store flipped value

      // console.log('button clicked, sending msg to tab');
      this.sendMessageToCurrentTab({obfuscate: this.isEnabled})
        .then((resp) => {
          // console.log("response from content script page", resp);
        })
        .catch((resp) => {
          console.log("UH OH", resp);
        });
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
        urlMatches: '.*\/pull-requests.*' // bitbucket
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