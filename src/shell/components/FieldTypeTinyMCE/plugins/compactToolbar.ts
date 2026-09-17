import { Editor } from "tinymce";
import tinymce from "tinymce/tinymce";
import i18n from "../../../i18n";

interface BlockFormat {
  textKey: string;
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
  { textKey: "shell.tinymceSlashHeading1", icon: "heading1", block: "h1" },
  { textKey: "shell.tinymceSlashHeading2", icon: "heading2", block: "h2" },
  { textKey: "shell.tinymceSlashHeading3", icon: "heading3", block: "h3" },
  { textKey: "shell.tinymceSlashHeading4", icon: "heading4", block: "h4" },
  { textKey: "shell.tinymceSlashHeading5", icon: "heading5", block: "h5" },
  { textKey: "shell.tinymceSlashHeading6", icon: "heading6", block: "h6" },
  { textKey: "shell.tinymceSlashParagraph", icon: "title", block: "p" },
  {
    textKey: "shell.tinymceBlockquote",
    icon: "quote",
    block: "blockquote",
  },
  { textKey: "shell.tinymcePreformatted", icon: "textSnippet", block: "pre" },
];

const setup = (editor: Editor): void => {
  editor.ui.registry.addMenuButton("compactBlocks", {
    icon: "format",
    tooltip: i18n.t("shell.tinymceBlockFormatting"),
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
        text: i18n.t(format.textKey),
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
    tooltip: i18n.t("shell.tinymceTextAlignment"),
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
          text: i18n.t("shell.tinymceLeftAlign"),
          icon: "align-left",
          onAction: () => {
            editor.execCommand("JustifyLeft");
            editor.focus();
          },
        },
        {
          type: "menuitem" as const,
          text: i18n.t("shell.tinymceCenterAlign"),
          icon: "align-center",
          onAction: () => {
            editor.execCommand("JustifyCenter");
            editor.focus();
          },
        },
        {
          type: "menuitem" as const,
          text: i18n.t("shell.tinymceRightAlign"),
          icon: "align-right",
          onAction: () => {
            editor.execCommand("JustifyRight");
            editor.focus();
          },
        },
        {
          type: "menuitem" as const,
          text: i18n.t("shell.tinymceJustify"),
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
    tooltip: i18n.t("shell.tinymceLists"),
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
          text: i18n.t("shell.tinymceNumberedList"),
          icon: "ordered-list",
          onAction: () => {
            editor.execCommand("InsertOrderedList");
            editor.focus();
          },
        },
        {
          type: "menuitem" as const,
          text: i18n.t("shell.tinymceBulletedList"),
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
