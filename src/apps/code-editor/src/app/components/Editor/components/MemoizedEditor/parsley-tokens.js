export const ParsleyTokens = {
  root: [{ include: "code" }, { include: "blockComments" }],
  code: [["(\\{\\{)", { next: "code__b__0", token: "comment.block" }]],
  code__b__0: [
    ["(\\}\\})", { next: "@pop", token: "comment.block" }],
    { include: "singleVariable" },
    { include: "statementKeywords" },
    { include: "eachOperators" }
  ],
  singleVariable: [
    ["\\{", { next: "singleVariable__b__0", token: "comment.block" }]
  ],
  singleVariable__b__0: [
    ["\\}", { next: "@pop", token: "comment.block" }],
    { include: "allStrings" }
  ],
  allStrings: [[".", "constant.character.escape"]],
  statementKeywords: [
    [
      "(^)?( )?(if|each|end-each|end-if|(else( |-)if))(( )|($))?",
      "keyword.control.parsley"
    ]
  ],
  eachOperators: [["=", "variable.other.parsley"]],
  blockComments: [
    ["\\(\\*\\*", { next: "blockComments__b__0", token: "keyword.annotation" }]
  ],
  blockComments__b__0: [
    ["\\*\\*\\)", { next: "@pop", token: "keyword.annotation" }],
    { include: "allStrings" }
  ]
};
