import React, { useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import cx from "classnames";

// TinyMCE so the global var exists
// eslint-disable-next-line no-unused-vars
import tinymce from "tinymce/tinymce";
// DOM model
import "tinymce/models/dom/model";
// Theme
import "tinymce/themes/silver";
// Toolbar icons
import "tinymce/icons/default";
// Editor styles
// import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/skins/ui/tinymce-5/skin.min.css";

// importing the plugin js.
// if you use a plugin that is not listed here the editor will fail to load
import "tinymce/plugins/advlist";
import "tinymce/plugins/anchor";
import "tinymce/plugins/autolink";
import "tinymce/plugins/autoresize";
import "tinymce/plugins/autosave";
import "tinymce/plugins/charmap";
import "tinymce/plugins/code";
import "tinymce/plugins/codesample";
import "tinymce/plugins/directionality";
import "tinymce/plugins/emoticons";
import "tinymce/plugins/fullscreen";
// import "tinymce/plugins/help";
import "tinymce/plugins/image";
import "tinymce/plugins/importcss";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "tinymce/plugins/nonbreaking";
import "tinymce/plugins/pagebreak";
import "tinymce/plugins/preview";
import "tinymce/plugins/quickbars";
import "tinymce/plugins/save";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/table";
import "tinymce/plugins/template";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/visualchars";
import "tinymce/plugins/wordcount";

// importing plugin resources
import "tinymce/plugins/emoticons/js/emojis";

import styles from "./FieldTypeTinyMCE.less";

export const FieldTypeTinyMCE = React.memo(function FieldTypeTinyMCE(props) {
  // NOTE: controlled component
  const [initialValue, setInitialValue] = useState(props.value);

  // NOTE: update if version changes
  useEffect(() => {
    setInitialValue(props.value);
  }, [props.version]);

  return (
    <div
      className={cx(
        styles.FieldTypeTinyMCE,
        props.className,
        props.error ? styles.hasError : ""
      )}
    >
      <div className={styles.FieldTypeTinyMCEPM}>
        <Editor
          id={props.name}
          onFocusIn={props.onFocus}
          onFocusOut={props.onBlur}
          initialValue={initialValue}
          onEditorChange={(content) => {
            props.onChange(content, props.name, props.datatype);
          }}
          init={{
            plugins: [
              "advlist",
              "lists",
              "autolink",
              "code",
              "charmap",
              "emoticons",
              "fullscreen",
              "quickbars",
              "searchreplace",
              "insertdatetime",
              "table",
              "help",
              "link",
              "media",
              // "visualblocks",
              "codesample",
              "wordcount",

              // "advcode",
              // "anchor",
              // "hr",
              // "preview",
              // "spellchecker", // TODO: Deprecated in latest version, replace with the pro version
            ],

            // NOTE: premium plugins are being loaded from a self hosted location
            // specific to our application. Making this component not usable outside of our context.
            // TODO: Premium plugins are not working on latest version of tinymce
            external_plugins: props.externalPlugins,
            // TODO: Check with zosh the placement for other buttons not on his list
            toolbar:
              "blocks | \
              bold italic underline backcolor | \
              zestyMediaApp media link embed table | \
              align bullist numlist outdent indent | \
              fullscreen | \
              superscript subscript strikethrough removeformat | \
              codesample insertdatetime charmap emoticons | \
              undo redo | \
              searchreplace code help",
            contextmenu: "bold italic link | copy paste",
            toolbar_mode: "sliding",
            relative_urls: false,

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

            // Editor Settings
            branding: false,
            menubar: false,
            object_resizing: true,

            // Plugin Settings
            quickbars_insert_toolbar: false,
            quickbars_image_toolbar: false,
            quickbars_selection_toolbar:
              "blocks | bold italic underline backcolor superscript subscript strikethrough removeformat | align bullist numlist outdent indent",
            help_accessibility: false,
            block_formats:
              "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Blockquoute=blockquote; Preformatted=pre",

            // TODO: Determine if this still works??
            // powerpaste_word_import: "prompt",
            // media_live_embeds: true,
            image_advtab: true,

            // Allows for embeds with script tags
            // extended_valid_elements: "script[src|async|defer|type|charset]",
            valid_elements: "*[*]",

            // Autoresizer does not work with the resize handle.
            // Therefore we opt for the resize handle over auto resizing
            resize: false,
            min_height: 560,
            // max_height: 2000,

            skin_url: "/vendors/tinymce/skins/ui/Zesty",
            icon_url: "/vendors/tinymce/icons/material-rounded/icons.js",
            icons: "material-rounded",

            // If a content_css file is not provided tinymce will attempt
            // loading the default which is not available
            content_css: [
              // props.contentCSS,
              "https://fonts.googleapis.com/css?family=Mulish",
            ],

            content_style: "body { font-family: 'Mulish', Arial, sans-serif  }",

            // Customize editor buttons and actions
            setup: function (editor) {
              /**
               * Handle save key command
               */
              editor.shortcuts.add("meta+s", "Save item", props.onSave);

              /**
               * This does not work as the resizing action provides an element with the data attributes striped
               * so we lose context on this image ZUID, preventing modify calls to the media service
               */
              // Request resized image from media service
              // editor.on("ObjectResized", function(evt) {
              //   evt.target.src = `http://svc.zesty.localdev:3007/media-resolver-service/resolve/${evt.target.dataset.id}/getimage/?w=${evt.width}&h=${evt.height}`;
              // });

              /**
               * Clear Float Button
               */
              editor.ui.registry.addIcon(
                "return",
                `<?xml version="1.0" encoding="iso-8859-1"?>
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="22px" height="22px"
                   viewBox="0 0 16 16" style="enable-background:new 0 0 16 16;" xml:space="preserve">
                  <g>
                    <path d="M12,2.147H7v2h5c1.103,0,2,0.897,2,2s-0.897,2-2,2H3.414l2.293-2.293L4.293,4.44l-4,4c-0.391,0.391-0.391,1.023,0,1.414
                      l4,4l1.414-1.414l-2.293-2.293H12c2.206,0,4-1.794,4-4S14.206,2.147,12,2.147z"/>
                  </g>
                </svg>`
              );
              editor.ui.registry.addButton("clearfloat", {
                icon: "return",
                tooltip:
                  "Insert new element to clear previously floated elements",
                onAction: function (_) {
                  editor.insertContent("<p style='clear:both;'>&nbsp;</p>");
                },
              });

              /**
               * Zesty Media App Button
               */
              editor.ui.registry.addButton("zestyMediaApp", {
                icon: "image",
                tooltip: "Select media from your uploaded assets",
                onAction: function () {
                  props.mediaBrowser({
                    limit: 10,
                    callback: (images) => {
                      editor.insertContent(
                        images
                          .map((image) => {
                            return `<img src="${image.url}" data-id="${image.id}" title="${image.title}" alt="${image.title}" />`;
                          })
                          .join(" ")
                      );
                    },
                  });
                },
              });

              /**
               * Custom Embed Button
               */
              editor.ui.registry.addButton("embed", {
                icon: "zesty-embed",
                tooltip: "Embed a social media post",
                onAction: function () {
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
                    onSubmit: function (api) {
                      const data = api.getData();

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
                },
              });
            },
          }}
        />
      </div>
    </div>
  );
});
