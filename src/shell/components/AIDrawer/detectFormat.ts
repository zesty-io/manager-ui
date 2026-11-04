import { html as beautifyHtml } from "js-beautify";

export type ResponseFormat = "html" | "markdown" | "code" | "plain";

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

const parseJson = (text: string): unknown => {
  const trimmed = text.trim();
  if (!/^[[{]/.test(trimmed)) return undefined;

  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
};

// Checked before html: DOMParser reads `<stdio.h>` as an element.
const LEADING_CODE = /^\s*(#!\/|#include\s*[<"])/;

// Any one of these is enough: each is hard to hit in ordinary prose.
// Keywords are case-sensitive and anchored to a line start for that reason.
const STRONG_CODE = [
  /<\?(php|=)/, // php
  /\{\{[^}\n]+\}\}|\{%[^%\n]+%\}|\{\[[^\]\n]+\]\}/, // {{ }} {% %} {[ ]} templates
  /[^{}\n]+\{\s*[\w-]+\s*:\s*[^;{}]+;[^}]*\}/, // css rule
  /^\s*import\s[\s\S]*?\sfrom\s+['"]/m, // es import
  /^\s*export\s+(default|const|let|function|class|async)\b/m,
  /\brequire\(['"]/,
  /^\s*(const|let|var)\s+[\w$]+\s*[=:]/m,
  /^\s*(async\s+)?function\s*\*?\s*[\w$]*\s*\(/m,
  /^\s*def\s+\w+\s*\(.*\)\s*:/m, // python
  /^\s*class\s+\w+\s*(\(|\{|:|extends\b)/m,
  /\bSELECT\b[\s\S]+\bFROM\b|\bINSERT INTO\b|\bCREATE TABLE\b|\bDELETE FROM\b/, // sql
];

// One of these alone proves nothing, so a response needs several different
// kinds. Each kind counts once however many lines match.
const WEAK_CODE: ((lines: string[], text: string) => boolean)[] = [
  (lines) => lines.filter((line) => /[;{}]\s*$/.test(line)).length >= 2,
  (_, text) => /=>|===|!==|&&|\|\|/.test(text),
  (_, text) => /[\w$]+\([^()\n]*\)\s*[;{.]/.test(text),
  (lines) => lines.some((line) => /^\s*(\/\/|\/\*)/.test(line)),
  (_, text) => /^\s*(if|for|while|switch)\s*\(.*\)/m.test(text),
  (_, text) => /^\s*(return\b.*;|else\s*\{|\}\s*else\b)/m.test(text),
  (_, text) => /\)\s*\{\s*$/m.test(text),
  (_, text) => /^\s*[\w$.]+\s*[-+*/]?=\s*[^=\s].*;\s*$/m.test(text),
  (lines) =>
    lines.length >= 4 &&
    lines.filter((line) => /^(\t| {2,})\S/.test(line)).length >= 3,
];
const WEAK_CODE_THRESHOLD = 3;

const looksLikeCode = (text: string): boolean => {
  if (parseJson(text)) return true;
  if (STRONG_CODE.some((pattern) => pattern.test(text))) return true;

  const lines = text.split("\n");
  return (
    WEAK_CODE.filter((signal) => signal(lines, text)).length >=
    WEAK_CODE_THRESHOLD
  );
};

// Guesses what a response is written in. Checked from the most specific kind
// down: a fenced block stays markdown, but other code is checked before the
// remaining markdown signals because `# comment` reads as a heading.
export const detectFormat = (text: string): ResponseFormat => {
  if (!text || !text.trim()) return "plain";

  if (LEADING_CODE.test(text)) return "code";
  if (hasHtmlElements(text)) return "html";
  if (MD_FENCE.test(text)) return "markdown";
  if (looksLikeCode(text)) return "code";

  if (
    MD_HEADING.test(text) ||
    MD_LINK.test(text) ||
    MD_BOLD.test(text) ||
    MD_QUOTE.test(text) ||
    text.split("\n").filter((line) => MD_LIST_ITEM.test(line)).length >= 2
  )
    return "markdown";

  return "plain";
};

// Display only: one-line html and json are indented so they read like code.
// Other languages are shown exactly as written.
export const formatSource = (text: string, format: ResponseFormat): string => {
  if (format === "html") return beautifyHtml(text, { indent_size: 2 });

  if (format === "code") {
    const json = parseJson(text);
    if (json) return JSON.stringify(json, null, 2);
  }

  return text;
};
