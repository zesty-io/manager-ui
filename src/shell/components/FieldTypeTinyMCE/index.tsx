import React, { useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Box, alpha } from "@mui/material";
import { theme } from "@zesty-io/material";
import { debounce } from "lodash";

// TinyMCE so the global var exists
import tinymce from "tinymce/tinymce";
// DOM model
import "tinymce/models/dom/model";
// Theme
import "tinymce/themes/silver";
// Toolbar icons
import "tinymce/icons/default";
// Editor styles
import "tinymce/skins/ui/tinymce-5/skin.min.css";

// importing the plugin js.
// if you use a plugin that is not listed here the editor will fail to load
import "tinymce/plugins/advlist";
import "tinymce/plugins/autolink";
import "tinymce/plugins/charmap";
import "tinymce/plugins/code";
import "tinymce/plugins/codesample";
import "tinymce/plugins/emoticons";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/help";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "tinymce/plugins/quickbars";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/table";
import "tinymce/plugins/wordcount";
import "./plugins/slashcommands";
import "./plugins/socialmediaembed";
import "./plugins/imageresizer";

// importing plugin resources
import "tinymce/plugins/emoticons/js/emojis";

import { File } from "../../services/types";

const EDITOR_HEIGHT = 560;

type FieldTypeTinyMCEProps = {
  value: any;
  version: any;
  error: boolean;
  name: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange: (content: string, name: string, datatype: string) => void;
  datatype: "wysiwyg_advanced" | "wysiwyg_basic";
  externalPlugins?: Record<string, string>;
  onSave: () => void;
  mediaBrowser: (opts: any) => void;
  onCharacterCountChange: (charCount: number) => void;
};
export const FieldTypeTinyMCE = React.memo(function FieldTypeTinyMCE({
  value,
  version,
  name,
  error,
  onFocus,
  onBlur,
  onChange,
  datatype,
  externalPlugins,
  onSave,
  mediaBrowser,
  onCharacterCountChange,
}: FieldTypeTinyMCEProps) {
  // NOTE: controlled component
  const [initialValue, setInitialValue] = useState(value);
  const [isSkinLoaded, setIsSkinLoaded] = useState(false);

  // NOTE: update if version changes
  useEffect(() => {
    setInitialValue(value);
  }, [version]);

  const debouncedOnChange = debounce((content: string) => {
    onChange(content, name, datatype);
  }, 100);

  return (
    <Box
      id="tinyMceWrapper"
      sx={{
        minHeight: EDITOR_HEIGHT,
        "& .tox.tox-tinymce": {
          borderColor: error && "error.main",
        },
        "&:has(div.tox-fullscreen)": {
          backgroundColor: alpha(theme.palette.grey[900], 0.5),
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: (theme) => theme.zIndex.drawer,
        },
      }}
      onClick={(evt) => {
        if (
          evt.target instanceof Element &&
          evt.target.id === "tinyMceWrapper"
        ) {
          tinymce.activeEditor.execCommand("mceFullScreen");
        }
      }}
    >
      <Box sx={{ visibility: isSkinLoaded ? "visibile" : "hidden" }}>
        <Editor
          id={name}
          onFocusIn={onFocus}
          onFocusOut={onBlur}
          initialValue={initialValue}
          onEditorChange={(content, editor) => {
            debouncedOnChange(content);

            const charCount =
              editor.plugins?.wordcount?.body?.getCharacterCount() ?? 0;

            onCharacterCountChange(charCount);
          }}
          onInit={(_, editor) => {
            const charCount =
              editor.plugins?.wordcount?.body?.getCharacterCount() ?? 0;

            onCharacterCountChange(charCount);
          }}
          onKeyDown={(evt) => {
            // Makes sure that when scrolling through a collection group, it
            // autoscrolls highlighted items that are out of view
            if (evt.code === "ArrowDown" || evt.code === "ArrowUp") {
              const autocompleterEl =
                document.getElementsByClassName("tox-autocompleter");

              if (autocompleterEl.length) {
                const activeAutocompleteItem =
                  autocompleterEl[0].getElementsByClassName(
                    "tox-collection__item--active"
                  );

                // Needed to scroll to view the first and last item when scroll wrapping
                setTimeout(() => {
                  activeAutocompleteItem?.[0]?.scrollIntoView({
                    block: "center",
                  });
                }, 100);
              }
            }
          }}
          onObjectResized={(evt) => {
            if (evt.target.nodeName !== "IMG") {
              return;
            }

            const clonedCurrentNode = evt.target.cloneNode();

            // Remove attributes that are not included in the editor value to make replacing easier
            clonedCurrentNode.removeAttribute("data-mce-src");
            clonedCurrentNode.removeAttribute("data-mce-selected");

            const newImageNode = clonedCurrentNode.cloneNode();

            // Replace the image's width and height
            newImageNode.src = `${newImageNode.src.split("?")?.[0]}?width=${
              evt.width
            }`;
            newImageNode.width = Number(evt.width);
            // We want the width to automatically be set to preserve the image proportions
            newImageNode.removeAttribute("height");

            const currentValue = tinymce?.activeEditor?.getContent() ?? "";

            // Update the content with the new image data
            tinymce?.activeEditor?.setContent(
              currentValue.replace(
                clonedCurrentNode.outerHTML?.replaceAll("&", "&amp;"),
                newImageNode.outerHTML
              )
            );
          }}
          init={{
            plugins: [
              "advlist",
              "autolink",
              "charmap",
              "code",
              "codesample",
              "emoticons",
              "fullscreen",
              "help",
              "insertdatetime",
              "link",
              "lists",
              "media",
              "quickbars",
              "searchreplace",
              "table",
              "wordcount",
              "slashcommands",
              "socialmediaembed",
              "imageresizer",
            ],

            // NOTE: premium plugins are being loaded from a self hosted location
            // specific to our application. Making this component not usable outside of our context.
            external_plugins: externalPlugins ?? {},

            // Editor Settings
            toolbar:
              "slashcommands blocks | \
              bold italic underline backcolor | \
              zestyMediaApp media link socialmediaembed table | \
              align bullist numlist outdent indent | \
              searchreplace | \
              superscript subscript strikethrough removeformat | \
              codesample insertdatetime charmap emoticons | \
              undo redo | \
              code help | \
              fullscreen",
            contextmenu: "bold italic link | copy paste",
            toolbar_mode: "wrap",
            relative_urls: false,
            branding: false,
            menubar: false,
            statusbar: false,
            object_resizing: true,
            block_formats:
              "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Blockquoute=blockquote; Preformatted=pre",
            color_default_background: "none",
            help_tabs: ["shortcuts", "keyboardnav", "versions"],

            // file_picker_callback: (callback, value, meta) => {
            //   console.log(callback, value, meta);
            // },

            // imagetools_proxy: "path/to/proxy",
            // imagetools_toolbar: "imageoptions",
            // imagetools_fetch_image: function(img) {
            //   console.log("IMAGE", img);
            //   return new tinymce.util.Promise(function(resolve) {
            //     // Fetch the image and return a blob containing the image content
            //     fetch(img.src, {
            //       mode: "no-cors",
            //       cache: "no-cache"
            //     })
            //       .then(res => res.blob())
            //       .then(blob => resolve(blob));
            //   });
            // },

            // Plugin Settings
            quickbars_insert_toolbar: false,
            quickbars_image_toolbar: false,
            quickbars_selection_toolbar:
              "blocks | bold italic underline backcolor superscript subscript strikethrough removeformat | align bullist numlist outdent indent",
            help_accessibility: false,

            // powerpaste_word_import: "prompt",
            // media_live_embeds: true,
            image_advtab: true,

            // Allows for embeds with script tags
            // extended_valid_elements: "script[src|async|defer|type|charset]",
            valid_elements: "*[*]",

            // Autoresizer does not work with the resize handle.
            // Therefore we opt for the resize handle over auto resizing
            resize: false,
            min_height: EDITOR_HEIGHT,

            // skin: false,
            skin_url: "/vendors/tinymce/skins/ui/Zesty",
            icon_url: "/vendors/tinymce/icons/material-rounded/icons.js",
            icons: "material-rounded",

            // If a content_css file is not provided tinymce will attempt
            // loading the default which is not available
            content_css: [
              "https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700",
            ],

            content_style: `
            html { justify-content: center }\ 
            body { font-family: 'Mulish', Arial, sans-serif; color: #101828; font-size: 16px; }\ 
            img { max-width: 100%; height: auto}\ 
            h1, h2, h3, h4, h5, h6, strong { font-weight: 700; }\ 
            h1, h2, h3, h4, h5, h6 { margin-top: 0px; margin-bottom: 16px; }\ 
            p, pre, blockquote, ol, ul { color: #475467; margin-top: 0px; margin-bottom: 16px; }\ 
            h1 { font-size: 36px; line-height: 44px }\ 
            h2 { font-size: 32px; line-height: 40px }\ 
            h3 { font-size: 28px; line-height: 36px }\ 
            h4 { font-size: 24px; line-height: 32px }\ 
            h5 { font-size: 20px; line-height: 28px }\ 
            h6 { font-size: 16px; line-height: 22px }\ 
            p { font-size: 16px; line-height: 24px; }\ 
            span.mce-preview-object.mce-object-video { width: 100%; height: 100% }\ 
            video { width: 100%; height: 100%; object-fill: fill; aspect-ratio: auto;}\ 
            #tinymce { margin: 16px }`,

            // init_instance_callback: (editor) => {
            //   tinymce.DOM.styleSheetLoader
            //     .load("/vendors/tinymce/skins/ui/Zesty/skin.min.css")
            //     .then(() => editor.render());
            //   console.log(editor.dom.st);
            // },

            // Customize editor buttons and actions
            setup: (editor: any) => {
              editor.on("SkinLoaded", () => {
                console.log("skin loaded");
                setIsSkinLoaded(true);
              });

              // Limits the content width to 640px when in fullscreen
              editor.on("FullscreenStateChanged", (evt: any) => {
                if (evt.state) {
                  editor.contentDocument.documentElement.style.display = "flex";
                  editor.contentDocument.body.style.width = "640px";
                } else {
                  editor.contentDocument.documentElement.style.display =
                    "block";
                  editor.contentDocument.body.style.width = "auto";
                }
              });

              /**
               * Handle save key command
               */
              editor.shortcuts.add("meta+s", "Save item", onSave);

              /**
               * This does not work as the resizing action provides an element with the data attributes striped
               * so we lose context on this image ZUID, preventing modify calls to the media service
               */
              // Request resized image from media service
              // editor.on("ObjectResized", function(evt) {
              //   evt.target.src = `http://svc.zesty.localdev:3007/media-resolver-service/resolve/${evt.target.dataset.id}/getimage/?w=${evt.width}&h=${evt.height}`;
              // });

              /**
               * Zesty Media App
               */
              const mediaBrowserDialog = (ui?: boolean, filetype?: string) => {
                mediaBrowser({
                  limit: 10,
                  filetype,
                  callback: (files: File[]) => {
                    const imageFileTypes = [
                      ".jpg",
                      ".jpeg",
                      ".gif",
                      ".webp",
                      ".png",
                      ".svg",
                      ".ico",
                    ];
                    const videoFileTypes = [
                      ".mp4",
                      ".mov",
                      ".avi",
                      ".wmv",
                      ".mkv",
                      ".webm",
                      ".flv",
                      ".f4v",
                      ".swf",
                      ".avch",
                      ".html5",
                    ];

                    editor.insertContent(
                      files
                        .map((file: File) => {
                          if (
                            imageFileTypes.some((fileType) =>
                              file.filename?.includes(fileType)
                            )
                          ) {
                            return `<img src="${file.url}" data-id="${file.id}" title="${file.title}" alt="${file.title}" />`;
                          }

                          if (
                            videoFileTypes.some((fileType) =>
                              file.filename?.includes(fileType)
                            )
                          ) {
                            return `
                            <video controls src="${file.url}"/>
                          `;
                          }

                          return `
                            <a href="${file.url}" target="_blank" rel="noopener">${file.filename}</a>
                        `;
                        })
                        .join(" ")
                    );
                  },
                });
              };
              editor.ui.registry.addButton("zestyMediaApp", {
                icon: "image",
                tooltip: "Select media from your uploaded assets",
                onAction: mediaBrowserDialog,
              });
              editor.addCommand("mceZestyMediaApp", mediaBrowserDialog);
            },
          }}
        />
      </Box>
    </Box>
  );
});
