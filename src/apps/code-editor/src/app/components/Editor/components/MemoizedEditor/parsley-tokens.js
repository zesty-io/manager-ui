// adapted from handlebars language definition
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
var EMPTY_ELEMENTS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "menuitem",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];
export const languageConf = {
  wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
  comments: {
    blockComment: ["{{!--", "--}}"],
  },
  brackets: [
    ["<!--", "-->"],
    ["<", ">"],
    ["{{", "}}"],
    ["{", "}"],
    ["(", ")"],
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  surroundingPairs: [
    { open: "<", close: ">" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  onEnterRules: [
    {
      beforeText: new RegExp(
        "<(?!(?:" +
          EMPTY_ELEMENTS.join("|") +
          "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$",
        "i"
      ),
      afterText: /^<\/(\w[\w\d]*)\s*>$/i,
      action: { indentAction: monaco.languages.IndentAction.IndentOutdent },
    },
    {
      beforeText: new RegExp(
        "<(?!(?:" +
          EMPTY_ELEMENTS.join("|") +
          "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$",
        "i"
      ),
      action: { indentAction: monaco.languages.IndentAction.Indent },
    },
  ],
};
export const tokenizer = {
  root: [
    [/\{\{/, { token: "@rematch", switchTo: "@parsleyInSimpleState.root" }],
    [/<!DOCTYPE/, "metatag.html", "@doctype"],
    [/<!--/, "comment.html", "@comment"],
    [/(<)(\w+)(\/>)/, ["delimiter.html", "tag.html", "delimiter.html"]],
    [/(<)(script)/, ["delimiter.html", { token: "tag.html", next: "@script" }]],
    [/(<)(style)/, ["delimiter.html", { token: "tag.html", next: "@style" }]],
    [
      /(<)([:\w]+)/,
      ["delimiter.html", { token: "tag.html", next: "@otherTag" }],
    ],
    [
      /(<\/)(\w+)/,
      ["delimiter.html", { token: "tag.html", next: "@otherTag" }],
    ],
    [/</, "delimiter.html"],
    [/\{/, "delimiter.html"],
    [/[^<{]+/], // text
    { include: "blockComments" },
  ],
  doctype: [
    [/\{\{/, { token: "@rematch", switchTo: "@parsleyInSimpleState.comment" }],
    [/[^>]+/, "metatag.content.html"],
    [/>/, "metatag.html", "@pop"],
  ],
  comment: [
    [/\{\{/, { token: "@rematch", switchTo: "@parsleyInSimpleState.comment" }],
    [/-->/, "comment.html", "@pop"],
    [/[^-]+/, "comment.content.html"],
    [/./, "comment.content.html"],
  ],
  otherTag: [
    [/\{\{/, { token: "@rematch", switchTo: "@parsleyInSimpleState.otherTag" }],
    [/\/?>/, "delimiter.html", "@pop"],
    [/"([^"]*)"/, "attribute.value"],
    [/'([^']*)'/, "attribute.value"],
    [/[\w\-]+/, "attribute.name"],
    [/=/, "delimiter"],
    [/[ \t\r\n]+/],
  ],
  // -- BEGIN <script> tags handling
  // After <script
  script: [
    [/\{\{/, { token: "@rematch", switchTo: "@parsleyInSimpleState.script" }],
    [/type/, "attribute.name", "@scriptAfterType"],
    [/"([^"]*)"/, "attribute.value"],
    [/'([^']*)'/, "attribute.value"],
    [/[\w\-]+/, "attribute.name"],
    [/=/, "delimiter"],
    [
      />/,
      {
        token: "delimiter.html",
        next: "@scriptEmbedded.text/javascript",
        nextEmbedded: "text/javascript",
      },
    ],
    [/[ \t\r\n]+/],
    [
      /(<\/)(script\s*)(>)/,
      ["delimiter.html", "tag.html", { token: "delimiter.html", next: "@pop" }],
    ],
  ],
  // After <script ... type
  scriptAfterType: [
    [
      /\{\{/,
      {
        token: "@rematch",
        switchTo: "@parsleyInSimpleState.scriptAfterType",
      },
    ],
    [/=/, "delimiter", "@scriptAfterTypeEquals"],
    [
      />/,
      {
        token: "delimiter.html",
        next: "@scriptEmbedded.text/javascript",
        nextEmbedded: "text/javascript",
      },
    ],
    [/[ \t\r\n]+/],
    [/<\/script\s*>/, { token: "@rematch", next: "@pop" }],
  ],
  // After <script ... type =
  scriptAfterTypeEquals: [
    [
      /\{\{/,
      {
        token: "@rematch",
        switchTo: "@parsleyInSimpleState.scriptAfterTypeEquals",
      },
    ],
    [
      /"([^"]*)"/,
      { token: "attribute.value", switchTo: "@scriptWithCustomType.$1" },
    ],
    [
      /'([^']*)'/,
      { token: "attribute.value", switchTo: "@scriptWithCustomType.$1" },
    ],
    [
      />/,
      {
        token: "delimiter.html",
        next: "@scriptEmbedded.text/javascript",
        nextEmbedded: "text/javascript",
      },
    ],
    [/[ \t\r\n]+/],
    [/<\/script\s*>/, { token: "@rematch", next: "@pop" }],
  ],
  // After <script ... type = $S2
  scriptWithCustomType: [
    [
      /\{\{/,
      {
        token: "@rematch",
        switchTo: "@parsleyInSimpleState.scriptWithCustomType.$S2",
      },
    ],
    [
      />/,
      {
        token: "delimiter.html",
        next: "@scriptEmbedded.$S2",
        nextEmbedded: "$S2",
      },
    ],
    [/"([^"]*)"/, "attribute.value"],
    [/'([^']*)'/, "attribute.value"],
    [/[\w\-]+/, "attribute.name"],
    [/=/, "delimiter"],
    [/[ \t\r\n]+/],
    [/<\/script\s*>/, { token: "@rematch", next: "@pop" }],
  ],
  scriptEmbedded: [
    [
      /\{\{/,
      {
        token: "@rematch",
        switchTo: "@parsleyInEmbeddedState.scriptEmbedded.$S2",
        nextEmbedded: "@pop",
      },
    ],
    [/<\/script/, { token: "@rematch", next: "@pop", nextEmbedded: "@pop" }],
  ],
  // -- END <script> tags handling
  // -- BEGIN <style> tags handling
  // After <style
  style: [
    [/\{\{/, { token: "@rematch", switchTo: "@parsleyInSimpleState.style" }],
    [/type/, "attribute.name", "@styleAfterType"],
    [/"([^"]*)"/, "attribute.value"],
    [/'([^']*)'/, "attribute.value"],
    [/[\w\-]+/, "attribute.name"],
    [/=/, "delimiter"],
    [
      />/,
      {
        token: "delimiter.html",
        next: "@styleEmbedded.text/css",
        nextEmbedded: "text/css",
      },
    ],
    [/[ \t\r\n]+/],
    [
      /(<\/)(style\s*)(>)/,
      ["delimiter.html", "tag.html", { token: "delimiter.html", next: "@pop" }],
    ],
  ],
  // After <style ... type
  styleAfterType: [
    [
      /\{\{/,
      { token: "@rematch", switchTo: "@parsleyInSimpleState.styleAfterType" },
    ],
    [/=/, "delimiter", "@styleAfterTypeEquals"],
    [
      />/,
      {
        token: "delimiter.html",
        next: "@styleEmbedded.text/css",
        nextEmbedded: "text/css",
      },
    ],
    [/[ \t\r\n]+/],
    [/<\/style\s*>/, { token: "@rematch", next: "@pop" }],
  ],
  // After <style ... type =
  styleAfterTypeEquals: [
    [
      /\{\{/,
      {
        token: "@rematch",
        switchTo: "@parsleyInSimpleState.styleAfterTypeEquals",
      },
    ],
    [
      /"([^"]*)"/,
      { token: "attribute.value", switchTo: "@styleWithCustomType.$1" },
    ],
    [
      /'([^']*)'/,
      { token: "attribute.value", switchTo: "@styleWithCustomType.$1" },
    ],
    [
      />/,
      {
        token: "delimiter.html",
        next: "@styleEmbedded.text/css",
        nextEmbedded: "text/css",
      },
    ],
    [/[ \t\r\n]+/],
    [/<\/style\s*>/, { token: "@rematch", next: "@pop" }],
  ],
  // After <style ... type = $S2
  styleWithCustomType: [
    [
      /\{\{/,
      {
        token: "@rematch",
        switchTo: "@parsleyInSimpleState.styleWithCustomType.$S2",
      },
    ],
    [
      />/,
      {
        token: "delimiter.html",
        next: "@styleEmbedded.$S2",
        nextEmbedded: "$S2",
      },
    ],
    [/"([^"]*)"/, "attribute.value"],
    [/'([^']*)'/, "attribute.value"],
    [/[\w\-]+/, "attribute.name"],
    [/=/, "delimiter"],
    [/[ \t\r\n]+/],
    [/<\/style\s*>/, { token: "@rematch", next: "@pop" }],
  ],
  styleEmbedded: [
    [
      /\{\{/,
      {
        token: "@rematch",
        switchTo: "@parsleyInEmbeddedState.styleEmbedded.$S2",
        nextEmbedded: "@pop",
      },
    ],
    [/<\/style/, { token: "@rematch", next: "@pop", nextEmbedded: "@pop" }],
  ],
  // -- END <style> tags handling

  parsleyInSimpleState: [
    [/\{\{/, "comment.block"],
    [/\}\}/, { token: "comment.block", switchTo: "@$S2.$S3" }],
    { include: "parsleyRoot" },
  ],
  parsleyInEmbeddedState: [
    [/\{\{/, "comment.block"],
    [
      /\}\}/,
      {
        token: "comment.block",
        switchTo: "@$S2.$S3",
        nextEmbedded: "$S3",
      },
    ],
    { include: "parsleyRoot" },
  ],
  parsleyRoot: [
    { include: "singleVariable" },
    { include: "statementKeywords" },
    { include: "eachOperators" },
  ],
  singleVariable: [
    ["\\{", { next: "singleVariable__b__0", token: "comment.block" }],
  ],
  singleVariable__b__0: [
    ["\\}", { next: "@pop", token: "comment.block" }],
    { include: "allStrings" },
  ],
  allStrings: [[".", "constant.character.escape"]],
  statementKeywords: [
    [
      "(^)?( )?(if|each|end-each|end-if|(else( |-)if))(( )|($))?",
      "keyword.control.parsley",
    ],
  ],
  eachOperators: [["=", "variable.other.parsley"]],
  blockComments: [
    ["\\(\\*\\*", { next: "blockComments__b__0", token: "keyword.annotation" }],
  ],
  blockComments__b__0: [
    ["\\*\\*\\)", { next: "@pop", token: "keyword.annotation" }],
    { include: "allStrings" },
  ],
};
