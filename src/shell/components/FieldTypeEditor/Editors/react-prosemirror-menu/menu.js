import { Slice, Fragment } from "prosemirror-model";
import { setBlockType, toggleMark, wrapIn } from "prosemirror-commands";
import { redo, undo } from "prosemirror-history";
import { wrapInList } from "prosemirror-schema-list";

import { schema } from "../react-prosemirror-schema";

import icons from "./icons";
import characters from "./characters";

export const markActive = (type) => (state) => {
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

export function menu(options) {
  const { t } = options;

  return {
    marks: {
      em: {
        title: t("shell.editorToggleEmphasis"),
        content: icons.em,
        active: markActive(schema.marks.em),
        run: toggleMark(schema.marks.em),
      },
      strong: {
        title: t("shell.editorToggleStrong"),
        content: icons.strong,
        active: markActive(schema.marks.strong),
        run: toggleMark(schema.marks.strong),
      },
      subscript: {
        title: t("shell.editorToggleSubscript"),
        content: icons.subscript,
        active: markActive(schema.marks.subscript),
        run: toggleMark(schema.marks.subscript),
      },
      superscript: {
        title: t("shell.editorToggleSuperscript"),
        content: icons.superscript,
        active: markActive(schema.marks.superscript),
        run: toggleMark(schema.marks.superscript),
      },
      underline: {
        title: t("shell.editorToggleUnderline"),
        content: icons.underline,
        active: markActive(schema.marks.underline),
        run: toggleMark(schema.marks.underline),
      },
      strikethrough: {
        title: t("shell.editorToggleStrikethrough"),
        content: icons.strikethrough,
        active: markActive(schema.marks.strikethrough),
        run: toggleMark(schema.marks.strikethrough),
      },
      link: {
        title: t("shell.editorAddRemoveLink"),
        content: icons.link,
        active: markActive(schema.marks.link),
        // enable: (state) => !state.selection.empty,
        run(state, dispatch, view) {
          // Remove existing links
          if (markActive(schema.marks.link)(state)) {
            toggleMark(schema.marks.link)(state, dispatch);
          } else {
            zesty.trigger("PROSEMIRROR_DIALOG_OPEN", "showLinkModal", { view });
          }
          return true;
        },
      },
    },
    alignment: {
      left: {
        title: t("shell.editorAlignLeft"),
        content: icons.align_left,
        active: markActive(schema.marks.alignLeft),
        run: toggleMark(schema.marks.alignLeft),
      },
      center: {
        title: t("shell.editorAlignCenter"),
        content: icons.align_center,
        active: markActive(schema.marks.alignCenter),
        run: toggleMark(schema.marks.alignCenter),
      },
      justify: {
        title: t("shell.editorAlignJustify"),
        content: icons.align_justify,
        active: markActive(schema.marks.alignJustify),
        run: toggleMark(schema.marks.alignJustify),
      },
      right: {
        title: t("shell.editorAlignRight"),
        content: icons.align_right,
        active: markActive(schema.marks.alignRight),
        run: toggleMark(schema.marks.alignRight),
      },
    },

    headings_dropdown: {
      title: t("shell.editorChangeHeading"),
      content: t("shell.editorHeading"),
      // classname: "dropdown-menu-list",
      children: ["1", "2", "3", "4", "5", "6"].reduce((acc, level) => {
        acc[level] = {
          title: t("shell.editorHeadingLevel", { level }),
          content: t("shell.editorLevel", { level }),
          active: blockActive(schema.nodes.heading, { level: level }),
          enable: setBlockType(schema.nodes.heading, { level: level }),
          run: setBlockType(schema.nodes.heading, { level: level }),
        };

        return acc;
      }, {}),
    },

    embed_dropdown: {
      title: t("shell.editorEmbedContent"),
      content: t("shell.editorEmbed"),
      classname: "dropdown-menu-list",
      children: ["Instagram", "YouTube", "Twitter"].reduce((acc, service) => {
        acc[service] = {
          title: `${service}`,
          content: `${service}`,
          enable: canInsert(schema.nodes.iframe),
          run: (state, dispatch, view) => {
            zesty.trigger("PROSEMIRROR_DIALOG_OPEN", "showEmbedModal", {
              service,
              view,
            });
          },
        };

        return acc;
      }, {}),
    },

    blocks: {
      plain: {
        title: t("shell.editorChangeToParagraph"),
        content: icons.paragraph,
        active: blockActive(schema.nodes.paragraph),
        enable: setBlockType(schema.nodes.paragraph),
        run: setBlockType(schema.nodes.paragraph),
      },
      code_block: {
        title: t("shell.editorChangeToCodeBlock"),
        content: icons.code_block,
        active: blockActive(schema.nodes.code_block),
        enable: setBlockType(schema.nodes.code_block),
        run: setBlockType(schema.nodes.code_block),
      },
      blockquote: {
        title: t("shell.editorChangeToBlockQuote"),
        content: icons.blockquote,
        active: blockActive(schema.nodes.blockquote),
        enable: setBlockType(schema.nodes.blockquote),
        run: setBlockType(schema.nodes.blockquote),
      },
      bullet_list: {
        title: t("shell.editorWrapInBulletList"),
        content: icons.bullet_list,
        active: blockActive(schema.nodes.bullet_list),
        enable: wrapInList(schema.nodes.bullet_list),
        run: wrapInList(schema.nodes.bullet_list),
      },
      ordered_list: {
        title: t("shell.editorWrapInOrderedList"),
        content: icons.ordered_list,
        active: blockActive(schema.nodes.ordered_list),
        enable: wrapInList(schema.nodes.ordered_list),
        run: wrapInList(schema.nodes.ordered_list),
      },
      indent: {
        title: t("shell.editorIndent"),
        content: icons.indent,
        active: markActive(schema.marks.indent),
        run: toggleMark(schema.marks.indent),
      },
      // outdent: {
      //   title: "Dedent",
      //   content: icons.outdent,
      //   active: markActive(schema.marks.dedent),
      //   run: toggleMark(schema.marks.dedent)
      // }
    },

    insert: {
      // footnote: {
      //   title: "Insert footnote",
      //   content: icons.footnote,
      //   enable: canInsert(schema.nodes.footnote),
      //   run: (state, dispatch) => {
      //     const footnote = schema.nodes.footnote.create();
      //     dispatch(state.tr.replaceSelectionWith(footnote));
      //   }
      // },
      hr: {
        title: t("shell.editorInsertHorizontalRule"),
        content: "HR",
        enable: canInsert(schema.nodes.hr),
        run: (state, dispatch) => {
          const hr = schema.nodes.hr.create();
          dispatch(state.tr.replaceSelectionWith(hr));
        },
      },
      table: {
        title: t("shell.editorInsertTable"),
        content: icons.table,
        enable: canInsert(schema.nodes.table),
        run: (state, dispatch) => {
          // const { from } = state.selection
          let rowCount =
            window && window.prompt(t("shell.editorPromptRows"), 2);
          let colCount =
            window && window.prompt(t("shell.editorPromptColumns"), 2);

          const cells = [];
          while (colCount--) {
            cells.push(schema.nodes.table_cell.createAndFill());
          }

          const rows = [];
          while (rowCount--) {
            rows.push(schema.nodes.table_row.createAndFill(null, cells));
          }

          const body = schema.nodes.table_body.createAndFill(null, rows);
          const table = schema.nodes.table.createAndFill(null, body);

          dispatch(state.tr.replaceSelectionWith(table));

          // const tr = state.tr.replaceSelectionWith(table)
          // tr.setSelection(Selection.near(tr.doc.resolve(from)))
          // dispatch(tr.scrollIntoView())
          // view.focus()
        },
      },
      // table: {
      // addColumnBefore: {
      //   title: 'Insert column before',
      //   content: icons.after,
      //   active: addColumnBefore, // TOOD: active -> select
      //   run: addColumnBefore
      // },
      // addColumnAfter: {
      //   title: 'Insert column before',
      //   content: icons.before,
      //   active: addColumnAfter, // TOOD: active -> select
      //   run: addColumnAfter
      // }
      // }
    },
    special_character_dropdown: {
      title: t("shell.editorInsertSpecialCharacter"),
      content: t("shell.editorSpecialCharacter"),
      classname: "dropdown-menu-row",
      children: characters.reduce((acc, char) => {
        acc[char] = {
          title: t("shell.editorInsertCharacter", { char }),
          content: char,
          enable: canInsert(schema.nodes.text),
          run: (state, dispatch) => {
            dispatch(state.tr.replaceSelectionWith(schema.text(char)));
          },
        };

        return acc;
      }, {}),
    },
    media: {
      image: {
        title: t("shell.editorInsertImage"),
        content: icons.image,
        enable: canInsert(schema.nodes.image),
        run: (state, dispatch) => {
          options.mediaBrowser({
            limit: 10,
            callback: (images) => {
              const imageNodes = images.map((image) =>
                schema.nodes.image.createAndFill({
                  src: image.url,
                  title: image.title,
                  "data-zuid": image.id,
                })
              );

              dispatch(
                state.tr.replaceSelection(
                  new Slice(Fragment.from(imageNodes), 0, 0)
                )
              );
            },
          });
        },
      },
      left: {
        title: t("shell.editorFloatLeft"),
        content: icons.float_left,
        active: markActive(schema.marks.floatLeft),
        run: toggleMark(schema.marks.floatLeft),
      },
      right: {
        title: t("shell.editorFloatRight"),
        content: icons.float_right,
        active: markActive(schema.marks.floatRight),
        run: toggleMark(schema.marks.floatRight),
      },
    },
    history: {
      undo: {
        title: t("shell.editorUndo"),
        content: icons.undo,
        enable: undo,
        run: undo,
      },
      redo: {
        title: t("shell.editorRedo"),
        content: icons.redo,
        enable: redo,
        run: redo,
      },
    },
  };
}
