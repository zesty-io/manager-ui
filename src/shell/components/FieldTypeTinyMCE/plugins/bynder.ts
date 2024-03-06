import tinymce from "tinymce/tinymce";

tinymce.PluginManager.add("bynder", (editor) => {
  // Social media embed command
  editor.addCommand("mceSocialMediaEmbed", () => {});

  // Social media embed button
  editor.ui.registry.addButton("bynder", {
    icon: "bynder",
    tooltip: "Add images via Bynder",
    onAction: () => {},
  });

  return {};
});
