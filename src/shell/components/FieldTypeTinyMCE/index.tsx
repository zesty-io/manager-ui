import React, { useMemo, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Box, alpha } from "@mui/material";
import { theme } from "@zesty-io/material";

import openBynder from "../../../utility/openBynder";

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
import "tinymce/plugins/autoresize";
import "./plugins/slashcommands";
import "./plugins/socialmediaembed";
import "./plugins/imageresizer";
import "./plugins/compactToolbar";

// importing plugin resources
import "tinymce/plugins/emoticons/js/emojis";

import { File } from "../../services/types";
import { useGetInstanceSettingsQuery } from "../../services/instance";

const IMAGE_FILE_TYPES = [
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".png",
  ".svg",
  ".ico",
  ".avif",
] as const;
const VIDEO_FILE_TYPES = [
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
] as const;

const NORMAL_EDITOR_HEIGHT = 560;
const COMPACT_EDITOR_HEIGHT = 259;

const compactToolbar =
  "compactBlocks | bold italic underline compactAlign compactLists | zestyMediaApp media link | fullscreen";
const normalToolbar =
  "slashcommands blocks | bold italic underline | backcolor | " +
  "align | " +
  "bullist numlist outdent indent | " +
  "zestyMediaApp media link | bynder socialmediaembed table | " +
  "searchreplace | superscript subscript strikethrough removeformat | " +
  "codesample insertdatetime charmap emoticons | " +
  "undo redo | code help | fullscreen";

type FieldTypeTinyMCEProps = {
  value: any;
  version?: any;
  error: boolean;
  name: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange: (content: string, name: string, datatype: string) => void;
  datatype: "wysiwyg_advanced" | "wysiwyg_basic";
  externalPlugins?: Record<string, string>;
  onSave?: () => void;
  mediaBrowser: (opts: any) => void;
  onCharacterCountChange?: (charCount: number) => void;
  compact?: boolean;
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
  compact = false,
}: FieldTypeTinyMCEProps) {
  // NOTE: controlled component
  const [initialValue, setInitialValue] = useState(value);
  const [isSkinLoaded, setIsSkinLoaded] = useState(false);
  const { data: rawInstanceSettings } = useGetInstanceSettingsQuery();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const effectiveCompact = compact && !isFullscreen;
  const toolbar = effectiveCompact ? compactToolbar : normalToolbar;

  // The Editor remounts whenever this key changes (version bump on save,
  // compact/fullscreen toggle). The baseline is tagged with the key of the
  // editor instance that captured it, so a remounted instance's normalization
  // pass isn't compared against a stale baseline and can't re-dirty a just-saved
  // item.
  const editorKey = `${effectiveCompact}-${version}`;
  const baselineRef = useRef<{ key: string; content: string } | null>(null);

  const EDITOR_HEIGHT = effectiveCompact
    ? COMPACT_EDITOR_HEIGHT
    : NORMAL_EDITOR_HEIGHT;

  // Checks if the bynder portal and token are set
  const isBynderSessionValid =
    localStorage.getItem("cvrt") && localStorage.getItem("cvad");

  const bynderPortalUrlSetting = useMemo(
    () =>
      rawInstanceSettings?.find(
        (setting) => setting.key === "bynder_portal_url"
      ),
    [rawInstanceSettings]
  );

  return (
    <Box
      id="tinyMceWrapper"
      data-compact={effectiveCompact}
      sx={{
        minHeight: EDITOR_HEIGHT,
        "&[data-compact='true']": {
          "& .tox-toolbar__group": {
            "& .tox-tbtn": {
              transform: "scale(0.85)",
            },
          },
          // Push the fullscreen button group (always last in compact toolbar) to the far right.
          // Uses :last-child instead of aria-label so it doesn't break when TinyMCE updates.
          "& .tox-toolbar__primary .tox-toolbar__group:last-child": {
            position: "absolute",
            right: 0,
          },
        },
        "& .tox.tox-tinymce": {
          borderColor: error ? "error.main" : undefined,
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
          tinymce.activeEditor?.execCommand("mceFullScreen");
        }
      }}
    >
      <Box sx={{ visibility: isSkinLoaded ? "visible" : "hidden" }}>
        <Editor
          // key must change whenever effectiveCompact or version changes
          // to update toolbar and value
          key={editorKey}
          id={name}
          onFocusIn={onFocus}
          onFocusOut={onBlur}
          initialValue={initialValue}
          onEditorChange={(content, editor) => {
            // Baseline tracks the last content sent to the parent (see onInit):
            // the key guard skips TinyMCE's pre-init normalization, while any
            // later change — including undo back to the loaded value — syncs.
            if (
              baselineRef.current?.key === editorKey &&
              content !== baselineRef.current.content
            ) {
              baselineRef.current.content = content;
              onChange(content, name, datatype);
            }

            const charCount =
              editor.plugins?.wordcount?.body?.getCharacterCount() ?? 0;

            onCharacterCountChange && onCharacterCountChange(charCount);
          }}
          onInit={(_, editor) => {
            // Seed the baseline with the loaded (post-normalization) content,
            // tagged with this instance's key so a remount starts fresh.
            baselineRef.current = {
              key: editorKey,
              content: editor.getContent(),
            };

            setInitialValue(value ?? "");

            const charCount =
              editor.plugins?.wordcount?.body?.getCharacterCount() ?? 0;

            onCharacterCountChange && onCharacterCountChange(charCount);
            // component re-render due to fullscreen toggle.
            if (isFullscreen) {
              editor.execCommand("mceFullScreen");
            }
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

            const currentValue = tinymce.activeEditor?.getContent() ?? "";

            // Update the content with the new image data
            tinymce.activeEditor?.setContent(
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
              "compactToolbar",
              // "bynder",
            ],
            // NOTE: premium plugins are being loaded from a self hosted location
            // specific to our application. Making this component not usable outside of our context.
            external_plugins: externalPlugins ?? {},

            // Editor Settings
            toolbar: toolbar,
            contextmenu: "bold italic link | copy paste",
            toolbar_mode: effectiveCompact ? "sliding" : "wrap",
            relative_urls: false,
            branding: false,
            menubar: false,
            statusbar: false,
            object_resizing: true,
            block_formats:
              "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Blockquote=blockquote; Preformatted=pre",
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
            quickbars_selection_toolbar: effectiveCompact
              ? false
              : "blocks | bold italic underline backcolor link superscript subscript strikethrough | align bullist numlist outdent indent | removeformat",
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
            ...(effectiveCompact && { max_height: EDITOR_HEIGHT }),

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
            body { font-family: 'Mulish', Arial, sans-serif; color: ${theme.palette.text.primary}; font-size: 16px; }\
            img { max-width: 100%; height: auto}\
            h1, h2, h3, h4, h5, h6, strong { font-weight: 700; }\
            h1, h2, h3, h4, h5, h6 { margin-top: 0px; margin-bottom: 16px; }\
            p, pre, blockquote, ol, ul { color: ${theme.palette.text.secondary}; margin-top: 0px; margin-bottom: 16px; }\
            h1 { font-size: 36px; line-height: 44px }\
            h2 { font-size: 32px; line-height: 40px }\
            h3 { font-size: 28px; line-height: 36px }\
            h4 { font-size: 24px; line-height: 32px }\
            h5 { font-size: 20px; line-height: 28px }\
            h6 { font-size: 16px; line-height: 22px }\
            p { font-size: 16px; line-height: 24px; }\
            span.mce-preview-object.mce-object-video { width: 100%; height: 100% }\
            video { width: 100%; height: 100%; object-fill: fill; aspect-ratio: auto;}\
            #tinymce { margin: 16px; }\
            ul, ol { line-height: 24px; }`,

            // init_instance_callback: (editor) => {
            //   tinymce.DOM.styleSheetLoader
            //     .load("/vendors/tinymce/skins/ui/Zesty/skin.min.css")
            //     .then(() => editor.render());
            //   console.log(editor.dom.st);
            // },

            // Customize editor buttons and actions
            setup: (editor: any) => {
              editor.on("init", function () {
                editor.addShortcut("meta+p", "", () => {
                  window.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "p", metaKey: true })
                  );
                });
              });
              editor.on("SkinLoaded", () => {
                setIsSkinLoaded(true);
              });

              editor.on("keydown", (evt: any) => {
                if (evt.key === "Escape") {
                  if (editor.plugins.fullscreen?.isFullscreen()) {
                    editor.execCommand("mceFullScreen");
                    evt.preventDefault();
                  }
                }
              });

              // Limits the content width to 640px when in fullscreen
              editor.on("FullscreenStateChanged", (evt: any) => {
                setIsFullscreen(evt.state);
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
              if (onSave) {
                editor.shortcuts.add("meta+s", "Save item", onSave);
              }

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
                    editor.insertContent(
                      files
                        .map((file: File) => {
                          if (
                            IMAGE_FILE_TYPES.some((fileType) =>
                              file.filename?.toLowerCase().includes(fileType)
                            )
                          ) {
                            return `<img src="${file.url}" data-id="${file.id}" title="${file.title}" alt="${file.title}" />`;
                          }

                          if (
                            VIDEO_FILE_TYPES.some((fileType) =>
                              file.filename?.toLowerCase().includes(fileType)
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

              // Bynder App
              const handleOpenBynder = () => {
                openBynder({
                  url: bynderPortalUrlSetting?.value,
                  onSuccess: (assets) => {
                    if (assets?.length) {
                      tinymce.activeEditor?.insertContent(
                        assets
                          .map((asset) => {
                            const filename = asset.originalUrl.split("/").pop();

                            if (
                              IMAGE_FILE_TYPES.some((fileType) =>
                                filename?.toLowerCase().includes(fileType)
                              )
                            ) {
                              return `<img src="${asset.originalUrl}" data-id="${asset.id}" title="${asset.name}" alt="${asset.name}" />`;
                            }

                            if (
                              VIDEO_FILE_TYPES.some((fileType) =>
                                filename?.toLowerCase().includes(fileType)
                              )
                            ) {
                              return `
                                        <video controls src="${asset.originalUrl}"/>
                                      `;
                            }

                            return `
                                        <a href="${asset.originalUrl}" target="_blank" rel="noopener">${filename}</a>
                                    `;
                          })
                          .join(" ")
                      );
                    }
                  },
                });
              };

              // Bynder command
              editor.addCommand("mceBynder", handleOpenBynder);

              // Bynder button
              if (isBynderSessionValid) {
                editor.ui.registry.addButton("bynder", {
                  icon: "bynder",
                  tooltip: "Select media from your Bynder assets",
                  onAction: handleOpenBynder,
                });
              }
            },
          }}
        />
      </Box>
    </Box>
  );
});
