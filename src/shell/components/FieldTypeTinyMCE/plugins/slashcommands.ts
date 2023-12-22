import tinymce from "tinymce/tinymce";

tinymce.PluginManager.add("slashcommands", (editor) => {
  const insertActions = [
    {
      text: "Image",
      icon: "image",
      action: () => {
        editor.execCommand("mceZestyMediaApp", false, "Image");
      },
    },
    {
      text: "Video",
      icon: "embed",
      action: () => {
        editor.execCommand("mceMedia", false);
      },
    },
    {
      text: "Paragraph",
      icon: "paragraph",
      action: () => {
        editor.execCommand("mceInsertContent", false, "<p>Paragraph</p>");
        editor.selection.select(editor.selection.getNode());
      },
    },
    {
      text: "Heading 1",
      icon: "heading1",
      action: () => {
        editor.execCommand("mceInsertContent", false, "<h1>Heading 1</h1>");
        editor.selection.select(editor.selection.getNode());
      },
    },
    {
      text: "Heading 2",
      icon: "heading2",
      action: () => {
        editor.execCommand("mceInsertContent", false, "<h2>Heading 2</h2>");
        editor.selection.select(editor.selection.getNode());
      },
    },
    {
      text: "Heading 3",
      icon: "heading3",
      action: () => {
        editor.execCommand("mceInsertContent", false, "<h3>Heading 3</h3>");
        editor.selection.select(editor.selection.getNode());
      },
    },
    {
      text: "Heading 4",
      icon: "heading4",
      action: () => {
        editor.execCommand("mceInsertContent", false, "<h4>Heading 4</h4>");
        editor.selection.select(editor.selection.getNode());
      },
    },
    {
      text: "Heading 5",
      icon: "heading5",
      action: () => {
        editor.execCommand("mceInsertContent", false, "<h5>Heading 5</h5>");
        editor.selection.select(editor.selection.getNode());
      },
    },
    {
      text: "Heading 6",
      icon: "heading6",
      action: () => {
        editor.execCommand("mceInsertContent", false, "<h6>Heading 6</h6>");
        editor.selection.select(editor.selection.getNode());
      },
    },
    {
      text: "Quote",
      icon: "quote",
      action: () => {
        editor.execCommand("mceBlockQuote");
      },
    },
    {
      text: "Code Block",
      icon: "code-sample",
      action: () => {
        editor.execCommand("CodeSample");
      },
    },
    {
      text: "Link",
      icon: "link",
      action: () => {
        editor.execCommand("mceLink");
      },
    },
    {
      text: "Embed Social Media",
      icon: "zesty-embed",
      action: () => {
        editor.execCommand("mceSocialMediaEmbed");
      },
    },
    {
      text: "Table",
      icon: "table",
      action: () => {
        editor.execCommand("mceInsertTableDialog");
      },
    },
    {
      text: "Bulleted list",
      icon: "unordered-list",
      action: () => {
        editor.execCommand("InsertUnorderedList");
      },
    },
    {
      text: "Numbered list",
      icon: "ordered-list",
      action: () => {
        editor.execCommand("InsertOrderedList");
      },
    },
    {
      text: "Time",
      icon: "insert-time",
      action: () => {
        editor.execCommand("mceInsertTime");
      },
    },
    {
      text: "Special Character",
      icon: "insert-character",
      action: () => {
        editor.execCommand("mceShowCharmap");
      },
    },
    {
      text: "Emoji",
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
