import { Editor } from "tinymce";

interface BlockFormat {
  name?: string;
  text: string;
  icon: string;
  block: string;
}

const COMPACT_BLOCK_FORMATS: BlockFormat[] = [
  { name: "heading1", text: "Heading 1", icon: "heading1", block: "h1" },
  { name: "heading2", text: "Heading 2", icon: "heading2", block: "h2" },
  { text: "Heading 3", icon: "heading3", block: "h3" },
  { text: "Heading 4", icon: "heading4", block: "h4" },
  { text: "Heading 5", icon: "heading5", block: "h5" },
  { text: "Heading 6", icon: "heading6", block: "h6" },
  { text: "Paragraph", icon: "title", block: "p" },
  {
    text: "Blockquote",
    icon: "quote",
    block: "blockquote",
    name: "blockquote",
  },
  { text: "Preformatted", icon: "textSnippet", block: "pre" },
];

const setup = (editor: Editor): void => {
  // Register compact blocks menu button with dynamic icon
  editor.ui.registry.addMenuButton("compactBlocks", {
    icon: "format",
    tooltip: "Block formatting",
    onSetup: (buttonApi: any) => {
      // Use a debounced or delayed update to prevent interference
      let updateTimeout: any;

      const updateButtonIcon = () => {
        // Clear previous timeout
        if (updateTimeout) {
          clearTimeout(updateTimeout);
        }

        // Delay the update to avoid interfering with menu opening
        updateTimeout = setTimeout(() => {
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
        }, 50);
      };

      // Use a more specific set of events
      editor.on("NodeChange", updateButtonIcon);
      editor.on("SelectionChange", updateButtonIcon);

      updateButtonIcon();

      return () => {
        if (updateTimeout) {
          clearTimeout(updateTimeout);
        }
        editor.off("NodeChange", updateButtonIcon);
        editor.off("SelectionChange", updateButtonIcon);
      };
    },
    fetch: (callback: (items: any[]) => void) => {
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
    fetch: (callback: (items: any[]) => void) => {
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
    onSetup: (buttonApi: any) => {
      let updateTimeout: any;

      const updateButtonIcon = () => {
        if (updateTimeout) {
          clearTimeout(updateTimeout);
        }

        updateTimeout = setTimeout(() => {
          const node = editor.selection.getNode();
          const body = editor.getBody();

          if (editor.dom.getParent(node, "ol", body)) {
            buttonApi.setIcon("ordered-list");
          } else if (editor.dom.getParent(node, "ul", body)) {
            buttonApi.setIcon("unordered-list");
          } else {
            buttonApi.setIcon("unordered-list");
          }
        }, 50);
      };

      editor.on("NodeChange", updateButtonIcon);
      editor.on("SelectionChange", updateButtonIcon);
      updateButtonIcon();

      return () => {
        if (updateTimeout) {
          clearTimeout(updateTimeout);
        }
        editor.off("NodeChange", updateButtonIcon);
        editor.off("SelectionChange", updateButtonIcon);
      };
    },
    fetch: (callback: (items: any[]) => void) => {
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

declare const tinymce: any;

tinymce.PluginManager.add("compactToolbar", (editor: Editor) => {
  setup(editor);

  return {
    getMetadata: () => ({
      name: "Compact Toolbar",
import tinymce from "tinymce/tinymce";

tinymce.PluginManager.add("compactToolbar", (editor: Editor) => {
});

export default setup;
