import { history } from "prosemirror-history";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { placeholder } from "@aeaton/prosemirror-placeholder";
import { footnotes } from "@aeaton/prosemirror-footnotes";

import keys from "./keys";
import rules from "./rules";

import "prosemirror-tables/style/tables.css";
import "prosemirror-gapcursor/style/gapcursor.css";
import "@aeaton/prosemirror-footnotes/style/footnotes.css";
import "@aeaton/prosemirror-placeholder/style/placeholder.css";

const plugins = [
  rules,
  keys,
  placeholder(),
  footnotes(),
  dropCursor(),
  gapCursor(),
  history(),
];

export { plugins };

// (Optional) Keep this, but not part of plugin system
document.execCommand("enableObjectResizing", false, false);
document.execCommand("enableInlineTableEditing", false, false);
