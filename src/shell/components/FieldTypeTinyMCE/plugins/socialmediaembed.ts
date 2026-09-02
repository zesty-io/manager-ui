import tinymce from "tinymce/tinymce";
import i18n from "../../../i18n";

tinymce.PluginManager.add("socialmediaembed", (editor) => {
  // Social media embed dialog
  const openEmbedDialog = () => {
    editor.windowManager.open({
      title: i18n.t("shell.tinymceEmbedSocialMedia"),
      body: {
        type: "panel",
        items: [
          {
            type: "selectbox",
            name: "service",
            label: i18n.t("shell.tinymceService"),
            items: [
              { text: "Instagram", value: "instagram" },
              { text: "YouTube", value: "youtube" },
              { text: "Twitter", value: "twitter" },
            ],
          },
          {
            type: "input",
            name: "id",
            label: i18n.t("shell.tinymceUniquePostId"),
          },
        ],
      },
      buttons: [
        {
          type: "cancel",
          text: i18n.t("shell.tinymceClose"),
        },
        {
          type: "submit",
          text: i18n.t("common.save"),
          primary: true,
        },
      ],
      onSubmit: (api: any) => {
        const data: any = api.getData();

        let iframe = "";
        switch (data.service) {
          case "instagram":
            iframe = `<iframe src="https://www.instagram.com/p/${data.id}/embed/captioned" height="600px" width="500px"></iframe>`;
            break;
          case "youtube":
            iframe = `<iframe src="https://www.youtube.com/embed/${data.id}?modestbranding=1&rel=0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" height="315px" width="560px"></iframe>`;
            break;
          case "twitter":
            iframe = `<iframe src="https://platform.twitter.com/embed/Tweet.html?id=${encodeURI(
              data.id
            )}" height="530px" width="420px" allow="autoplay; encrypted-media; picture-in-picture; fullscreen"></iframe>`;
            break;
          default:
            iframe = `<iframe src="" height="315px" width="560px"></iframe>`;
        }

        // Insert content when the window form is submitted
        editor.insertContent(iframe);
        api.close();
      },
    });
  };

  // Social media embed command
  editor.addCommand("mceSocialMediaEmbed", openEmbedDialog);

  // Social media embed button
  editor.ui.registry.addButton("socialmediaembed", {
    icon: "zesty-embed",
    tooltip: i18n.t("shell.tinymceEmbedSocialMediaPost"),
    onAction: openEmbedDialog,
  });

  return {};
});
