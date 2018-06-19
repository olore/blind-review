import elementReady from 'element-ready';
import domLoaded from 'dom-loaded';
import select from 'select-dom';
import ghInjection from 'github-injection';

function doWork() {
    let block = "&block;&block;&block;"
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

    imageNodes.forEach((img, i) => {
        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    });

    authorNodes.forEach((a, i) => {
        a.innerHTML = block;
    });

}


// h/t to https://github.com/sindresorhus/refined-github/ for providing a mechanism for 
// handling page loads & navigation in github

/**
 *`github-injection` happens even when the user navigates in history
 * This causes listeners to run on content that has already been updated.
 * If a feature needs to be disabled when navigating away,
 * use the regular `github-injection`
 */
export function safeOnAjaxedPages(callback) {
	ghInjection(() => {
		if (!select.exists('has-rgh')) {
			callback();
		}
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

safeOnAjaxedPages(async () => {
    // Wait for the tab bar to be loaded
    await safeElementReady('.pagehead + *');
    doWork();
});
