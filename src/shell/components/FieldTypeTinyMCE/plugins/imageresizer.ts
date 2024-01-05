import tinymce from "tinymce/tinymce";

tinymce.PluginManager.add("imageresizer", (editor) => {
  let currentNode: HTMLImageElement = null;

  // imageresizer dialog
  const imageResizerDialog = () => {
    editor.windowManager.open({
      initialData: {
        dimensions: {
          /**
           * Initial width and height based on the image node's width and height property
           * or on the image's natural width and height
           */
          width:
            currentNode.getAttribute("width") ??
            currentNode.naturalWidth?.toString(),
          height:
            currentNode.getAttribute("height") ??
            currentNode?.naturalHeight?.toString(),
        },
      },
      title: "Resize image",
      body: {
        type: "panel",
        items: [
          {
            type: "sizeinput",
            name: "dimensions",
            label: "Constrain proportions",
            constrain: true,
          },
        ],
      },
      buttons: [
        {
          type: "submit",
          text: "Save",
          primary: true,
        },
      ],
      onChange(api, details) {
        console.log(api.getData());
        console.log(details);
      },
    });
  };

  // imageresizer context toolbar
  editor.ui.registry.addContextToolbar("imageresizer", {
    predicate: (node) => {
      if (node.nodeName.toLowerCase() === "img") {
        currentNode = node as HTMLImageElement;

        return true;
      }

      return false;
    },
    items: "imageresizer",
    position: "node",
    scope: "node",
  });

  // imageresizer button
  editor.ui.registry.addButton("imageresizer", {
    icon: "resize",
    tooltip: "Resize image dimensions",
    onAction: imageResizerDialog,
  });

  return {};
});
