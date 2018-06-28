Blind Review
============
A browser extension to help perform unbiased reviews of pull requests.

Install
-------
- [**Chrome** extension](https://chrome.google.com/webstore/detail/blind-review/mpejgchdkdnopdakonfflegngoehabca) [<img valign="middle" src="https://img.shields.io/chrome-web-store/v/mpejgchdkdnopdakonfflegngoehabca.svg?label=%20">](https://chrome.google.com/webstore/detail/blind-review/mpejgchdkdnopdakonfflegngoehabca)

About
-----
We all have our own code review biases, whether we admit it or not. 
- "This person always writes good code, I'm just going to merge it" 
- "I better go over this thoroughly because this person screwed things up last time"
- "This was written by a person way smarter than me, I better just approve, they know what they are doing"
- "This person destroyed my last PR, I am going to nitpick the hell out of theirs"

The goal of this extension is to relieve you, the pull-request reviewer, of your known and unknown biases. Treat the code **as the code**, no matter who wrote it.

Take it for a spin and [let me know](https://twitter.com/olore) how it changes your review process.

Building
--------
- `npm run build` - point Chrome at the `distribution/` directory
- `npm run watch` - dev mode

Screenshots
-----------
<img src="media/screen1.png" />


<img src="media/screen2.png" />


Shoutouts
---------
- Framework for building browser plugins borrowed from the amazing [Sindre Sorhhus](https://github.com/sindresorhus) and his [refined-github](https://github.com/sindresorhus/refined-github) project.


Inspiration
-----------
- Recoginition of my own bias. Seeing a person's picture or even the recoginition of a cartoon avatar immediately sets the mood of how I am going to review the code. It shouldn't. I know better. But humans are complicated.
- I can't find the original whitepaper published on this topic, but it was pretty interesting. Holler if you can find it. This is close: [Gender differences and bias in open source: Pull request acceptance of women versus men](https://news.ycombinator.com/item?id=11074587), but it was less "women vs men" and more "we ran a study". I'm not solely trying to address the "women vs. men" problem. I think the problem of bias goes much further (young vs old, n00b vs veteran, nice vs pita) - all of which should not influence a code review. The code is the code, no matter where it came from.