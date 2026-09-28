import tinymce from "tinymce/tinymce";
import i18n from "../../../i18n";

tinymce.PluginManager.add("slashcommands", (editor) => {
  const insertActions = [
    {
      text: i18n.t("shell.tinymceSlashImage"),
      icon: "image",
      action: () => {
        editor.execCommand("mceZestyMediaApp", false, "Image");
      },
    },
    {
      text: i18n.t("shell.tinymceSlashVideo"),
      icon: "embed",
      action: () => {
        editor.execCommand("mceMedia", false);
      },
    },
    {
      text: i18n.t("shell.tinymceSlashParagraph"),
      icon: "paragraph",
      action: () => {
        editor.execCommand(
          "mceInsertContent",
          false,
          `<p>${i18n.t("shell.tinymceSlashParagraph")}</p>`
        );
        editor.selection.select(editor.selection.getNode());
      },
    },
    {
      text: i18n.t("shell.tinymceSlashHeading1"),
      icon: "heading1",
      action: () => {
        editor.execCommand(
          "mceInsertContent",
          false,
          `<h1>${i18n.t("shell.tinymceSlashHeading1")}</h1>`
        );
        editor.selection.select(editor.selection.getNode());
      },
    },
    {
      text: i18n.t("shell.tinymceSlashHeading2"),
      icon: "heading2",
      action: () => {
        editor.execCommand(
          "mceInsertContent",
          false,
          `<h2>${i18n.t("shell.tinymceSlashHeading2")}</h2>`
        );
        editor.selection.select(editor.selection.getNode());
      },
    },
    {
      text: i18n.t("shell.tinymceSlashHeading3"),
      icon: "heading3",
      action: () => {
        editor.execCommand(
          "mceInsertContent",
          false,
          `<h3>${i18n.t("shell.tinymceSlashHeading3")}</h3>`
        );
        editor.selection.select(editor.selection.getNode());
      },
    },
    {
      text: i18n.t("shell.tinymceSlashHeading4"),
      icon: "heading4",
      action: () => {
        editor.execCommand(
          "mceInsertContent",
          false,
          `<h4>${i18n.t("shell.tinymceSlashHeading4")}</h4>`
        );
        editor.selection.select(editor.selection.getNode());
      },
    },
    {
      text: i18n.t("shell.tinymceSlashHeading5"),
      icon: "heading5",
      action: () => {
        editor.execCommand(
          "mceInsertContent",
          false,
          `<h5>${i18n.t("shell.tinymceSlashHeading5")}</h5>`
        );
        editor.selection.select(editor.selection.getNode());
      },
    },
    {
      text: i18n.t("shell.tinymceSlashHeading6"),
      icon: "heading6",
      action: () => {
        editor.execCommand(
          "mceInsertContent",
          false,
          `<h6>${i18n.t("shell.tinymceSlashHeading6")}</h6>`
        );
        editor.selection.select(editor.selection.getNode());
      },
    },
    {
      text: i18n.t("shell.tinymceSlashQuote"),
      icon: "quote",
      action: () => {
        editor.execCommand("mceBlockQuote");
      },
    },
    {
      text: i18n.t("shell.tinymceSlashCodeBlock"),
      icon: "code-sample",
      action: () => {
        editor.execCommand("CodeSample");
      },
    },
    {
      text: i18n.t("shell.tinymceSlashLink"),
      icon: "link",
      action: () => {
        editor.execCommand("mceLink");
      },
    },
    {
      text: i18n.t("shell.tinymceSlashEmbedSocialMedia"),
      icon: "zesty-embed",
      action: () => {
        editor.execCommand("mceSocialMediaEmbed");
      },
    },
    {
      text: i18n.t("shell.tinymceSlashTable"),
      icon: "table",
      action: () => {
        editor.execCommand("mceInsertTableDialog");
      },
    },
    {
      text: i18n.t("shell.tinymceSlashBulletedList"),
      icon: "unordered-list",
      action: () => {
        editor.execCommand("InsertUnorderedList");
      },
    },
    {
      text: i18n.t("shell.tinymceSlashNumberedList"),
      icon: "ordered-list",
      action: () => {
        editor.execCommand("InsertOrderedList");
      },
    },
    {
      text: i18n.t("shell.tinymceSlashTime"),
      icon: "insert-time",
      action: () => {
        editor.execCommand("mceInsertTime");
      },
    },
    {
      text: i18n.t("shell.tinymceSlashSpecialCharacter"),
      icon: "insert-character",
      action: () => {
        editor.execCommand("mceShowCharmap");
      },
    },
    {
      text: i18n.t("shell.tinymceSlashEmoji"),
      icon: "emoji",
      action: () => {
        editor.execCommand("mceEmoticons");
      },
    },
  ];

  // Register the slash commands autocompleter
  editor.ui.registry.addAutocompleter("slashcommands", {
    ch: "/",
    minChars: 0,
    columns: 1,
    fetch: (pattern) => {
      const matchedActions = insertActions.filter((action) => {
        return action.text.toLowerCase().indexOf(pattern.toLowerCase()) !== -1;
      });

      return new Promise((resolve) => {
        const results = matchedActions.map((action) => {
          return {
            meta: action,
            text: action.text,
            icon: action.icon,
            value: action.text,
          };
        });

        resolve(results);
      });
    },
    onAction: (autocompleteApi, range, value, meta) => {
      editor.selection.setRng(range);
      // Some actions don't delete the "slash", so we delete all the slash
      // command content before performing the action
      editor.execCommand("Delete");
      meta.action();
      autocompleteApi.hide();
    },
  });

  return {};
});
