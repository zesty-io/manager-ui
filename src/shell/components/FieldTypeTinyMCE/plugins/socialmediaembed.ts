import tinymce from "tinymce/tinymce";

tinymce.PluginManager.add("socialmediaembed", (editor) => {
  // Social media embed dialog
  const openEmbedDialog = () => {
    editor.windowManager.open({
      title: "Embed Social Media",
      body: {
        type: "panel",
        items: [
          {
            type: "selectbox",
            name: "service",
            label: "Service",
            items: [
              { text: "Instagram", value: "instagram" },
              { text: "YouTube", value: "youtube" },
              { text: "Twitframe", value: "twitframe" },
            ],
          },
          {
            type: "input",
            name: "id",
            label: "Unique Post ID",
          },
        ],
      },
      buttons: [
        {
          type: "cancel",
          text: "Close",
        },
        {
          type: "submit",
          text: "Save",
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
          case "twitframe":
            iframe = `<iframe src="https://twitframe.com/show?url=${encodeURI(
              data.id
            )}" height="315px" width="560px"></iframe>`;
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
    tooltip: "Embed a social media post",
    onAction: openEmbedDialog,
  });

  return {};
});
