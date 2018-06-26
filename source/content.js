import elementReady from 'element-ready';
import domLoaded from 'dom-loaded';

async function init() {
    await safeElementReady('body');
    document.addEventListener('pjax:end', doWork);  // doWork after github page navigation is complete

    await domLoaded;
    await Promise.resolve();

    doWork(); // doWork after first github page is complete
}

function doWork() {
    let uri = window.location.pathname;
    if (!uri.match(/\/pull\//) && !uri.match(/\/pulls$/)) { // skip if we aren't on a PR page
        return;
    }
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


    console.log('imageNodes', imageNodes.length);
    console.log('authorNodes', authorNodes.length);

    imageNodes.forEach((img, i) => {
        img.src = blackImage;
    });

    authorNodes.forEach((a, i) => {
        a.innerHTML = block;
    });
}

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