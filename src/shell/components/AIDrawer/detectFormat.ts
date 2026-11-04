export type ResponseFormat = "html" | "markdown" | "plain";

// Parsed, never rendered or attached, so nothing in the text runs. Leading
// <script>, <style>, <meta>, <link> and <title> land in <head>, not <body>.
const hasHtmlElements = (text: string): boolean => {
  const { head, body } = new DOMParser().parseFromString(text, "text/html");
  return head.childElementCount + body.childElementCount > 0;
};

const MD_FENCE = /^\s*(```|~~~)/m;
const MD_HEADING = /^\s{0,3}#{1,6}\s+\S/m;
const MD_LINK = /!?\[[^\]\n]+\]\([^)\s]+\)/;
const MD_BOLD = /(\*\*|__)(?=\S)[^\n]*?\S\1/;
const MD_QUOTE = /^\s{0,3}>\s+\S/m;
const MD_LIST_ITEM = /^\s*([-*+]|\d+[.)])\s+\S/;

// Guesses what a response is written in. Markdown needs a strong signal, and a
// list needs two items, so a stray `*` or a lone "- " in prose stays plain.
export const detectFormat = (text: string): ResponseFormat => {
  if (!text || !text.trim()) return "plain";

  if (hasHtmlElements(text)) return "html";

  if (
    MD_FENCE.test(text) ||
    MD_HEADING.test(text) ||
    MD_LINK.test(text) ||
    MD_BOLD.test(text) ||
    MD_QUOTE.test(text) ||
    text.split("\n").filter((line) => MD_LIST_ITEM.test(line)).length >= 2
  )
    return "markdown";

  return "plain";
};
