import getReadingTime from "reading-time";
import { toString as _toString } from "mdast-util-to-string";

export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = _toString(tree);
    const readingTime = getReadingTime(textOnPage);
    // readingTime.text will give us minutes read as a friendly string,
    // i.e. "3 min read"
    console.log("readingTime", readingTime);
    data.astro.frontmatter.minutesRead = readingTime.text;
  };
}
