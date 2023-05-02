import elementReady from 'element-ready';
import domLoaded from 'dom-loaded';
import {observe} from 'selector-observer';
import debounce from 'lodash.debounce';

let origNodes = [];
let origImages = [];
let imageSelectors = [
  // github.com
  'img.avatar',
  'img.from-avatar',
  'a.avatar > img',

  // Atlassian Bitbucket v4.14.5
  '.author img',
  '.activity-item-content .summary > a',
  '.user-avatar img',
  '.avatar img',
];

let authorSelectors = [
  // github.com
  // 'a.author',
  //'span.author',
  'a.assignee',
  '.opened-by > a.muted-link',
  'a.commit-author',
  '.gh-header-meta .css-truncate-target.user',
  '.user-mention',
  'a[data-hovercard-type=user]',

  // Atlassian Bitbucket v4.14.5
  '.author .name',
  '.activity-item-content .aui-avatar-inner img',
  '.comment .content > a',
  '.action > .summary > a',
  ".pr-author-number-and-timestamp > span",
];

async function init() {

  chrome.storage.local.get(['isEnabled'])
  .then(async (result) => {
    let isEnabled = Boolean(result.isEnabled); // make it a bool (don't flip, this is init)

    await safeElementReady('body');
    // document.addEventListener('loadend', doWork);  // doWork after github page navigation is complete
    // document.addEventListener('load', () => {
    //   console.log("nav loaded!");
    // });

    await domLoaded;
    await Promise.resolve();

    if (isBitBucket() && window.location.href.match(/pull-requests\/.*/)) {
      let debouncedDoWork = debounce(() => {
        doWork(isEnabled);
      }, 50);

      observe('.activity-item', {
        initialize(el) {
          debouncedDoWork();
        }
      });
    } else {
      console.log('init');
      doWork(isEnabled); // doWork after first github page is complete
    }

  });
}

function doWork(isEnabled) {
  console.log("doing work", isEnabled);
  let uri = window.location.pathname;
  if ( !uri.match(/\/pull\//)           // github
    && !uri.match(/\/pulls/)            // github
    && !uri.match(/\/commits/)          // github
    && !uri.match(/\/pull-requests/)    // bitbucket
  ) { // skip if we aren't on a PR page
    return;
  }
  obfuscate(isEnabled);
}

function obfuscate(isEnabled) {
  let block = "&block;&block;&block;"
  let blackImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  let self = 'olore';
  let selfAlt = 'Olore, Brian (CORP)';

  if (isGithub()) {
    let userImage = '#user-links > li:nth-child(3) > details > summary > img';
    let headerImages = Array.from(document.querySelectorAll(userImage));
    if (headerImages.length > 1) {
      self = headerImages[2].alt.replace('@', '');
    }

  } else if (isBitBucket()) {
    let currentUser = document.querySelector('header #current-user');
    if (currentUser) {
      self = currentUser.attributes['data-username'].value
      let currentUserImage = document.querySelector('header #current-user img');
      selfAlt = currentUserImage.attributes['alt'].value;
      selfAlt = selfAlt.match(/Logged in as (.*) \(.*\)$/)[1]
    }
  }

  let imageNodes = Array.from(document.querySelectorAll(imageSelectors.join(', ')));
  let authorNodes = Array.from(document.querySelectorAll(authorSelectors.join(', ')));

  // remove self from authorNodes
  // let notMeNodes = [];
  // authorNodes.forEach((a, i) => {
  //   if ( (a.title && a.title.includes(self)) ||
  //        (a.innerText && a.innerText.includes(self)) || // github
  //        (a.href && a.href.trim().endsWith(self))) {    // bitbucket

  //     //console.log('removing', a.title, a.innerText, a.href);
  //   } else {
  //     notMeNodes.push(a);
  //   }
  // });
  // authorNodes = notMeNodes;

  if (isEnabled) {
    if (origNodes.length === 0 && origImages.length === 0) {
      origNodes = authorNodes.map((n) => n.innerHTML);
      origImages = imageNodes.map((n) => n.src);
    }

    imageNodes.forEach((img, i) => {
    //   if (img.alt !== `@${self}` &&   // github
    //       img.alt !== selfAlt) {      // bitbucket
        img.src = blackImage;
    //   }
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

function isGithub() {
  return /github\.com/.test(window.location.href);
}

function isBitBucket() {
  return /bitbucket/.test(window.location.href);
}

// Listen for message from background script that button was clicked
// FIXME - why can't this be `browser` instead of `chrome` ?
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('content.js')
  doWork(request.obfuscate);
  sendResponse("Hello from content script, I am done working");
  return true;
});

init();