import elementReady from 'element-ready';
import domLoaded from 'dom-loaded';

let origNodes = [];
let origImages = [];

async function init() {

  chrome.storage.local.get(['isEnabled'], async (storage) => {
    let isEnabled = Boolean(storage.isEnabled); // make it a bool (don't flip, this is init)

    await safeElementReady('body');
    document.addEventListener('pjax:end', doWork);  // doWork after github page navigation is complete

    await domLoaded;
    await Promise.resolve();

    doWork(isEnabled); // doWork after first github page is complete
  });
}

function doWork(isEnabled) {
  let uri = window.location.pathname;
  if (!uri.match(/\/pull\//) && !uri.match(/\/pulls$/)) { // skip if we aren't on a PR page
    return;
  }
  obfuscate(isEnabled);
}

function obfuscate(isEnabled) {
  let block = "&block;&block;&block;"
  let blackImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

  let imageSelectors = [
    'img.avatar',
    'img.from-avatar',
    'a.avatar > img',
  ];
  let authorSelectors = [
    'a.author',
    'a.assignee',
    '.opened-by > a.muted-link',
    'a.commit-author',
  ];

  let imageNodes = Array.from(document.querySelectorAll(imageSelectors.join(', ')));
  let authorNodes = Array.from(document.querySelectorAll(authorSelectors.join(', ')));

  if (isEnabled) {
    if (origNodes.length === 0 && origImages.length === 0) {
      origNodes = authorNodes.map((n) => n.innerHTML);
      origImages = imageNodes.map((n) => n.src);
    }

    imageNodes.forEach((img, i) => {
      img.src = blackImage;
    });

    authorNodes.forEach((a, i) => {
      a.innerHTML = block;
    });

  } else {
    if (origImages.length > 0) {
      imageNodes.forEach((img, i) => {
        img.src = origImages[i];
      });
    }

    if (origNodes.length > 0) {
      authorNodes.forEach((a, i) => {
        a.innerHTML = origNodes[i];
      });
    }
  }
}

// from https://github.com/sindresorhus/refined-github
/**
 * Automatically stops checking for an element to appear once the DOM is ready.
 */
export const safeElementReady = selector => {
  const waiting = elementReady(selector);

  // Don't check ad-infinitum
  domLoaded.then(() => requestAnimationFrame(() => waiting.cancel()));

  // If cancelled, return null like a regular select() would
  return waiting.catch(() => null);
};

init();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  doWork(request.obfuscate);
  sendResponse("Hello from content script, I am done working");
  return true;
});