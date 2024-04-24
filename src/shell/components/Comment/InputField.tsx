import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Box, TextField, Button, Stack } from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import { theme } from "@zesty-io/material";
import sanitizeHtml from "sanitize-html";

import { MentionList } from "./MentionList";
import tinymce from "tinymce";

const PLACEHOLDER = '<p class="placeholder">Reply or add others with @</p>';

type InputFieldProps = {
  isFirstComment: boolean;
  onCancel: () => void;
};
export const InputField = ({ isFirstComment, onCancel }: InputFieldProps) => {
  const buttonsContainerRef = useRef<HTMLDivElement>();
  const inputRef = useRef<HTMLDivElement>();
  const [inputValue, setInputValue] = useState("");
  const [initialValue, setInitialValue] = useState(PLACEHOLDER);
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [mentionListAnchorEl, setMentionListAnchorEl] =
    useState<HTMLDivElement>(null);

  useEffect(() => {
    const lastWord = inputRef.current?.textContent?.split(" ")?.pop();

    if (lastWord?.startsWith("@")) {
      setMentionListAnchorEl(inputRef.current);
    } else {
      setMentionListAnchorEl(null);
    }
  }, [inputValue]);

  return (
    <>
      <Box sx={{ my: 1.5 }}>
        <Box height={100} display={isEditorInitialized ? "none" : "block"} />
        <Box display={isEditorInitialized ? "block" : "none"}>
          <Editor
            id="commentInputField"
            initialValue={PLACEHOLDER}
            init={{
              plugins: ["autoresize"],
              toolbar: false,
              menubar: false,
              branding: false,
              statusbar: false,
              resize: false,
              autoresize_bottom_margin: 0,
              content_style: `
              body { font-family: 'Mulish', Arial, sans-serif; color: #101828; font-size: 14px; line-height: 20px; font-weight: 400; margin: 6px 8px; }\
              p, span { margin-top: 0px; margin-bottom: 16px; }\
              p.placeholder { color: ${theme.palette.text.disabled}; }\
            `,

              setup: (editor) => {
                editor.on("ResizeEditor", () => {
                  if (!editor.isNotDirty) {
                    buttonsContainerRef.current?.scrollIntoView();
                  }
                });
              },
            }}
            onClick={() => {
              // Removes the placeholder
              console.log(tinymce?.activeEditor.getContent(), PLACEHOLDER);
              if (tinymce?.activeEditor.getContent() === PLACEHOLDER) {
                tinymce?.activeEditor.setContent("");
              }
              setIsEditorActive(true);
            }}
            onBlur={() => {
              // Re-adds the placeholder when user clicks out and there's no value
              if (!tinymce?.activeEditor.getContent()) {
                tinymce?.activeEditor.setContent(PLACEHOLDER);
              }
              setIsEditorActive(false);
            }}
            onInit={() => {
              setIsEditorInitialized(true);
            }}
          />
        </Box>
      </Box>
      <Stack
        ref={buttonsContainerRef}
        direction="row"
        gap={1}
        justifyContent="end"
      >
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button variant="contained" color="primary" size="small">
          {isFirstComment ? "Comment" : "Reply"}
        </Button>
      </Stack>
    </>
  );

  // return (
  //   <>
  //     <Box
  //       ref={inputRef}
  //       component="div"
  //       contentEditable
  //       // dangerouslySetInnerHTML={{ __html: inputValue }}
  //       sx={{
  //         my: 1.5,
  //         py: 0.75,
  //         px: 1,
  //         minHeight: 40,
  //         borderRadius: 2,
  //         boxSizing: "border-box",
  //         fontSize: "14px",
  //         fontWeight: 400,
  //         lineHeight: "20px",
  //         border: (theme) => `1px solid ${theme.palette.border}`,

  //         "&:focus-visible": {
  //           outline: (theme) => `${theme.palette.primary.light} solid 1px`,
  //         },

  //         "&:empty:before": {
  //           content: '"Reply or add others with @"',
  //           color: "text.disabled",
  //         },
  //       }}
  //       onInput={(evt: FormEvent) => {
  //         buttonsContainerRef.current?.scrollIntoView();
  //         const value = evt.currentTarget.innerHTML;

  //         if (value === "<br>") {
  //           setInputValue("");
  //         } else {
  //           setInputValue(
  //             sanitizeHtml(value, {
  //               allowedTags: ["b", "i", "em", "strong", "a"],
  //               allowedAttributes: {
  //                 a: ["href", "rel", "target", "alt"],
  //               },
  //             })
  //           );
  //         }
  //       }}
  //       // onKeyDown={(evt: React.KeyboardEvent<HTMLDivElement>) => {
  //       //   if (evt.key === "@") {
  //       //     console.log("show users dropdown");
  //       //     // setIsMentionListOpen(true)
  //       //     setMentionListAnchorEl(evt.target as HTMLDivElement);
  //       //   }
  //       // }}
  //     />
  //     {!!mentionListAnchorEl && (
  //       <MentionList
  //         anchorEl={mentionListAnchorEl}
  //         onClose={() => {}}
  //         onSelect={() => {}}
  //       />
  //     )}
  //     <Stack
  //       ref={buttonsContainerRef}
  //       direction="row"
  //       gap={1}
  //       justifyContent="end"
  //     >
  //       <Button
  //         variant="outlined"
  //         color="inherit"
  //         size="small"
  //         onClick={onCancel}
  //       >
  //         Cancel
  //       </Button>
  //       <Button variant="contained" color="primary" size="small">
  //         {isFirstComment ? "Comment" : "Reply"}
  //       </Button>
  //     </Stack>
  //   </>
  // );
};
