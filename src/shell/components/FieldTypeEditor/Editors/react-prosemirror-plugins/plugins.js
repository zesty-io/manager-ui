import { history } from "prosemirror-history";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { placeholder } from "@aeaton/prosemirror-placeholder";
import { footnotes } from "@aeaton/prosemirror-footnotes";
import { PluginKey, Plugin } from "prosemirror-state";

import keys from "./keys";
import rules from "./rules";

import "prosemirror-tables/style/tables.css";
import "prosemirror-gapcursor/style/gapcursor.css";
import "@aeaton/prosemirror-footnotes/style/footnotes.css";
import "@aeaton/prosemirror-placeholder/style/placeholder.css";

const placeholderKey = new PluginKey("custom-placeholder");
const footnotesKey = new PluginKey("custom-footnotes");

// Clone the original plugins with custom keys
const placeholderPlugin = placeholder();
const customPlaceholderPlugin = new Plugin({
  key: placeholderKey,
  props: placeholderPlugin.props || {},
});

const footnotesPlugin = footnotes();
const customFootnotesPlugin = new Plugin({
  key: footnotesKey,
  state: {
    init: footnotesPlugin.state?.init || (() => {}),
    apply: footnotesPlugin.state?.apply || ((tr, value) => value),
  },
  props: footnotesPlugin.props || {},
});

const dropCursorPlugin = dropCursor();
const gapCursorPlugin = gapCursor();
const historyPlugin = history();

const plugins = [
  rules,
  keys,
  customPlaceholderPlugin,
  customFootnotesPlugin,
  dropCursorPlugin,
  gapCursorPlugin,
  historyPlugin,
];

export { plugins };

// (Optional) Keep this, but not part of plugin system
document.execCommand("enableObjectResizing", false, false);
document.execCommand("enableInlineTableEditing", false, false);
