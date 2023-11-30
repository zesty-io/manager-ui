import {
  // joinUp,
  // lift,
  setBlockType,
  toggleMark,
  wrapIn,
} from "prosemirror-commands";
// import { redo, undo } from "prosemirror-history";
import { wrapInList } from "prosemirror-schema-list";
// import { addColumnAfter, addColumnBefore } from 'prosemirror-tables'

import { schema } from "../react-prosemirror-schema";
import icons from "./icons";

const markActive = (type) => (state) => {
  const { from, $from, to, empty } = state.selection;

  return empty
    ? type.isInSet(state.storedMarks || $from.marks())
    : state.doc.rangeHasMark(from, to, type);
};

const blockActive =
  (type, attrs = {}) =>
  (state) => {
    const { $from, to, node } = state.selection;

    if (node) {
      return node.hasMarkup(type, attrs);
    }

    return to <= $from.end() && $from.parent.hasMarkup(type, attrs);
  };

const canInsert = (type) => (state) => {
  const { $from } = state.selection;

  for (let d = $from.depth; d >= 0; d--) {
    const index = $from.index(d);

    if ($from.node(d).canReplaceWith(index, index, type)) {
      return true;
    }
  }

  return false;
};

const promptForURL = () => {
  let url = window && window.prompt("Enter the URL", "https://");
  return url;
};

export function inline(options) {
  return {
    marks: {
      em: {
        title: "Italic",
        content: icons.em,
        active: markActive(schema.marks.em),
        run: toggleMark(schema.marks.em),
      },
      strong: {
        title: "Bold",
        content: icons.strong,
        active: markActive(schema.marks.strong),
        run: toggleMark(schema.marks.strong),
      },
      underline: {
        title: "Underline",
        content: icons.underline,
        active: markActive(schema.marks.underline),
        run: toggleMark(schema.marks.underline),
      },
      link: {
        title: "Add or remove link",
        content: icons.link,
        active: markActive(schema.marks.link),
        enable: (state) => !state.selection.empty,
        run(state, dispatch) {
          if (markActive(schema.marks.link)(state)) {
            toggleMark(schema.marks.link)(state, dispatch);
            return true;
          }

          const href = promptForURL();
          if (!href) return false;

          toggleMark(schema.marks.link, { href })(state, dispatch);
          // view.focus()
        },
      },

      // subscript: {
      //   title: "Toggle subscript",
      //   content: icons.subscript,
      //   active: markActive(schema.marks.subscript),
      //   run: toggleMark(schema.marks.subscript)
      // },
      // superscript: {
      //   title: "Toggle superscript",
      //   content: icons.superscript,
      //   active: markActive(schema.marks.superscript),
      //   run: toggleMark(schema.marks.superscript)
      // },
      //
      // strikethrough: {
      //   title: "Toggle strikethrough",
      //   content: icons.strikethrough,
      //   active: markActive(schema.marks.strikethrough),
      //   run: toggleMark(schema.marks.strikethrough)
      // }
    },
    blocks: {
      // code_block: {
      //   title: "Change to code block",
      //   content: icons.code_block,
      //   active: blockActive(schema.nodes.code_block),
      //   enable: setBlockType(schema.nodes.code_block),
      //   run: setBlockType(schema.nodes.code_block)
      // },
      h1: {
        title: "Change to heading level 1",
        content: "H1",
        active: blockActive(schema.nodes.heading, { level: 1 }),
        enable: setBlockType(schema.nodes.heading, { level: 1 }),
        run: setBlockType(schema.nodes.heading, { level: 1 }),
      },
      h2: {
        title: "Change to heading level 2",
        content: "H2",
        active: blockActive(schema.nodes.heading, { level: 2 }),
        enable: setBlockType(schema.nodes.heading, { level: 2 }),
        run: setBlockType(schema.nodes.heading, { level: 2 }),
      },
      h3: {
        title: "Change to heading level 3",
        content: "H3",
        active: blockActive(schema.nodes.heading, { level: 3 }),
        enable: setBlockType(schema.nodes.heading, { level: 3 }),
        run: setBlockType(schema.nodes.heading, { level: 3 }),
      },
      h4: {
        title: "Change to heading level 4",
        content: "H4",
        active: blockActive(schema.nodes.heading, { level: 4 }),
        enable: setBlockType(schema.nodes.heading, { level: 4 }),
        run: setBlockType(schema.nodes.heading, { level: 4 }),
      },
      h5: {
        title: "Change to heading level 5",
        content: "H5",
        active: blockActive(schema.nodes.heading, { level: 5 }),
        enable: setBlockType(schema.nodes.heading, { level: 5 }),
        run: setBlockType(schema.nodes.heading, { level: 5 }),
      },
      h6: {
        title: "Change to heading level 6",
        content: "H6",
        active: blockActive(schema.nodes.heading, { level: 6 }),
        enable: setBlockType(schema.nodes.heading, { level: 6 }),
        run: setBlockType(schema.nodes.heading, { level: 6 }),
      },
      plain: {
        title: "Change to paragraph",
        content: icons.paragraph,
        active: blockActive(schema.nodes.paragraph),
        enable: setBlockType(schema.nodes.paragraph),
        run: setBlockType(schema.nodes.paragraph),
      },
      code_block: {
        title: "Change to code block",
        content: icons.code_block,
        active: blockActive(schema.nodes.code_block),
        enable: setBlockType(schema.nodes.code_block),
        run: setBlockType(schema.nodes.code_block),
      },
      blockquote: {
        title: "Wrap in block quote",
        content: icons.blockquote,
        active: blockActive(schema.nodes.blockquote),
        enable: wrapIn(schema.nodes.blockquote),
        run: wrapIn(schema.nodes.blockquote),
      },
      bullet_list: {
        title: "Wrap in bullet list",
        content: icons.bullet_list,
        active: blockActive(schema.nodes.bullet_list),
        enable: wrapInList(schema.nodes.bullet_list),
        run: wrapInList(schema.nodes.bullet_list),
      },
      ordered_list: {
        title: "Wrap in ordered list",
        content: icons.ordered_list,
        active: blockActive(schema.nodes.ordered_list),
        enable: wrapInList(schema.nodes.ordered_list),
        run: wrapInList(schema.nodes.ordered_list),
      },
      indent: {
        title: "Indent",
        content: icons.indent,
        active: markActive(schema.marks.indent),
        run: toggleMark(schema.marks.indent),
      },
    },
    insert: {
      image: {
        title: "Insert image from media library",
        content: icons.image,
        enable: canInsert(schema.nodes.image),
        run: (state, dispatch) => {
          options.mediaBrowser({
            limit: 10,
            callback: (images) => {
              images.forEach((image) => {
                dispatch(
                  state.tr.replaceSelectionWith(
                    schema.nodes.image.createAndFill({
                      src: image.url,
                    })
                  )
                );
              });
            },
          });
        },
      },
    },
    // history: {
    //   undo: {
    //     title: "Undo last change",
    //     content: icons.undo,
    //     enable: undo,
    //     run: undo
    //   },
    //   redo: {
    //     title: "Redo last undone change",
    //     content: icons.redo,
    //     enable: redo,
    //     run: redo
    //   }
    // }
  };
}
