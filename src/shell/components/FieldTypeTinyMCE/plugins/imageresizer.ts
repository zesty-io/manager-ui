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
      onSubmit(api) {
        const { width, height } = api.getData()?.dimensions;
        const currentValue = tinymce?.activeEditor?.getContent() ?? "";
        const clonedCurrentNode = <HTMLImageElement>currentNode.cloneNode();

        // Remove attributes that are not included in the editor value to make replacing easier
        clonedCurrentNode.removeAttribute("data-mce-src");
        clonedCurrentNode.removeAttribute("data-mce-selected");

        const newImageNode = <HTMLImageElement>clonedCurrentNode.cloneNode();

        // Replace the image's width and height
        newImageNode.src = `${
          newImageNode.src.split("?")?.[0]
        }?width=${width}&height=${height}`;
        newImageNode.width = Number(width);
        newImageNode.height = Number(height);

        // Update the content with the new image data
        tinymce?.activeEditor?.setContent(
          currentValue.replace(
            clonedCurrentNode.outerHTML?.replaceAll(/&(?!amp;)/g, "&amp;"),
            newImageNode.outerHTML
          )
        );

        api.close();
      },
    });

    // HACK: Prevents the input field from being autofocused when dialog opens
    document
      .querySelector(".tox-dialog__body-content input.tox-textfield")
      // @ts-ignore
      .blur();

    document
      .querySelector(".tox-dialog")
      ?.addEventListener("keydown", (evt: KeyboardEvent) => {
        console.log(evt.key);
        if (evt.key.toLowerCase() === "enter") {
          document
            .querySelector<HTMLButtonElement>('button.tox-button[title="Save"')
            ?.click();
        }
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
