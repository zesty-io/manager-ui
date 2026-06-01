import { Editor } from "tinymce";
import tinymce from "tinymce/tinymce";

interface BlockFormat {
  text: string;
  icon: string;
  block: string;
}

interface MenuItemSpec {
  type: "menuitem";
  text: string;
  icon: string;
  onAction: () => void;
}

const COMPACT_BLOCK_FORMATS: BlockFormat[] = [
  { text: "Heading 1", icon: "heading1", block: "h1" },
  { text: "Heading 2", icon: "heading2", block: "h2" },
  { text: "Heading 3", icon: "heading3", block: "h3" },
  { text: "Heading 4", icon: "heading4", block: "h4" },
  { text: "Heading 5", icon: "heading5", block: "h5" },
  { text: "Heading 6", icon: "heading6", block: "h6" },
  { text: "Paragraph", icon: "title", block: "p" },
  {
    text: "Blockquote",
    icon: "quote",
    block: "blockquote",
  },
  { text: "Preformatted", icon: "textSnippet", block: "pre" },
];

const setup = (editor: Editor): void => {
  editor.ui.registry.addMenuButton("compactBlocks", {
    icon: "format",
    tooltip: "Block formatting",
    onSetup: (buttonApi) => {
      const updateButtonIcon = () => {
        const node = editor.selection.getNode();
        const body = editor.getBody();
        if (editor.dom.getParent(node, "blockquote", body)) {
          buttonApi.setIcon("quote");
          return;
        }
        const blockEl = editor.dom.getParent(
          node,
          "h1,h2,h3,h4,h5,h6,p,pre",
          body
        );
        const tagName = blockEl?.tagName?.toLowerCase() ?? "p";
        const format = COMPACT_BLOCK_FORMATS.find((f) => f.block === tagName);

        if (format) {
          buttonApi.setIcon(format.icon);
        } else {
          buttonApi.setIcon("format");
        }
      };
      editor.on("NodeChange", updateButtonIcon);
      editor.on("SelectionChange", updateButtonIcon);
      updateButtonIcon();
      return () => {
        editor.off("NodeChange", updateButtonIcon);
        editor.off("SelectionChange", updateButtonIcon);
      };
    },
    fetch: (callback: (items: MenuItemSpec[]) => void) => {
      const items = COMPACT_BLOCK_FORMATS.map((format) => ({
        type: "menuitem" as const,
        text: format.text,
        icon: format.icon,
        onAction: () => {
          editor.execCommand("FormatBlock", false, format.block);
          editor.focus();
        },
      }));
      callback(items);
    },
  });

  // Register compact align menu button
  editor.ui.registry.addMenuButton("compactAlign", {
    icon: "align-left",
    tooltip: "Text alignment",
    onSetup: (api) => {
      const updateButton = () => {
        const format = editor.formatter;
        if (format.match("aligncenter")) {
          api.setIcon("align-center");
        } else if (format.match("alignright")) {
          api.setIcon("align-right");
        } else if (format.match("alignjustify")) {
          api.setIcon("align-justify");
        } else {
          api.setIcon("align-left");
        }
      };
      editor.on("NodeChange", updateButton);
      editor.on("SelectionChange", updateButton);
      updateButton();
      return () => {
        editor.off("NodeChange", updateButton);
        editor.off("SelectionChange", updateButton);
      };
    },
    fetch: (callback: (items: MenuItemSpec[]) => void) => {
      callback([
        {
          type: "menuitem" as const,
          text: "Left Align",
          icon: "align-left",
          onAction: () => {
            editor.execCommand("JustifyLeft");
            editor.focus();
          },
        },
        {
          type: "menuitem" as const,
          text: "Center Align",
          icon: "align-center",
          onAction: () => {
            editor.execCommand("JustifyCenter");
            editor.focus();
          },
        },
        {
          type: "menuitem" as const,
          text: "Right Align",
          icon: "align-right",
          onAction: () => {
            editor.execCommand("JustifyRight");
            editor.focus();
          },
        },
        {
          type: "menuitem" as const,
          text: "Justify",
          icon: "align-justify",
          onAction: () => {
            editor.execCommand("JustifyFull");
            editor.focus();
          },
        },
      ]);
    },
  });

  // Register compact lists menu button with dynamic icon
  editor.ui.registry.addMenuButton("compactLists", {
    icon: "unordered-list",
    tooltip: "Lists",
    onSetup: (buttonApi) => {
      const updateButtonIcon = () => {
        const node = editor.selection.getNode();
        const body = editor.getBody();
        if (editor.dom.getParent(node, "ol", body)) {
          buttonApi.setIcon("ordered-list");
        } else {
          buttonApi.setIcon("unordered-list");
        }
      };
      editor.on("NodeChange", updateButtonIcon);
      editor.on("SelectionChange", updateButtonIcon);
      updateButtonIcon();
      return () => {
        editor.off("NodeChange", updateButtonIcon);
        editor.off("SelectionChange", updateButtonIcon);
      };
    },
    fetch: (callback: (items: MenuItemSpec[]) => void) => {
      callback([
        {
          type: "menuitem" as const,
          text: "Numbered List",
          icon: "ordered-list",
          onAction: () => {
            editor.execCommand("InsertOrderedList");
            editor.focus();
          },
        },
        {
          type: "menuitem" as const,
          text: "Bulleted List",
          icon: "unordered-list",
          onAction: () => {
            editor.execCommand("InsertUnorderedList");
            editor.focus();
          },
        },
      ]);
    },
  });
};

tinymce.PluginManager.add("compactToolbar", (editor: Editor) => {
  setup(editor);
  return {};
});
