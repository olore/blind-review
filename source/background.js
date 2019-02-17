// background script - CANNOT interact with page

// console.log('hello from bg');

browser.pageAction.onClicked.addListener(() => {
  let bw = new BackgroundWorker();
  bw.handleButtonClick();
});

class BackgroundWorker {

  constructor() {
    this.isEnabled = true;
  }

  handleButtonClick() {
    browser.storage.local.get(['isEnabled'])
    .then((storage) => {
      let storedIsEnabled = storage.isEnabled;
      this.isEnabled = !Boolean(storedIsEnabled); // flip it & make it a bool
      browser.storage.local.set({isEnabled: this.isEnabled}); // store flipped value

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
      return browser.tabs.query({
        currentWindow: true,
        active: true
      }).then((tabs) => {
        return browser.tabs.sendMessage(
          tabs[0].id,
          msg);
      });
  } 

};


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
    actions: [ new chrome.declarativeContent.ShowPageAction() ]
  };

  chrome.runtime.onInstalled.addListener((details) => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
      chrome.declarativeContent.onPageChanged.addRules([matchingRule]);
    });
  });
// }