import { FormEvent, useCallback, useRef, useState } from "react";
import { Box, TextField, Button, Stack } from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import sanitizeHtml from "sanitize-html";

type InputFieldProps = {
  isFirstComment: boolean;
  onCancel: () => void;
};
export const InputField = ({ isFirstComment, onCancel }: InputFieldProps) => {
  const buttonsContainerRef = useRef<HTMLDivElement>();
  const inputRef = useRef<HTMLDivElement>();
  const [inputValue, setInputValue] = useState("");

  // return (
  //   <>
  //     <Box sx={{ my: 1.5 }}>
  //       <Editor
  //         id="commentInputField"
  //         onKeyDown={(evt) => {
  //           if (evt.code === "Enter") {
  //             setMaxHeight(maxHeight + 40);
  //           }
  //         }}
  //         init={{
  //           plugins: ["autoresize"],
  //           toolbar: false,
  //           menubar: false,
  //           branding: false,
  //           statusbar: false,
  //           resize: false,
  //           min_height: 40,
  //           height: 40,
  //           max_height: maxHeight,
  //         }}
  //       />
  //     </Box>
  //     <Stack direction="row" gap={1} justifyContent="end">
  //       <Button variant="outlined" color="inherit" size="small">
  //         Cancel
  //       </Button>
  //       <Button variant="contained" color="primary" size="small">
  //         {isFirstComment ? "Comment" : "Reply"}
  //       </Button>
  //     </Stack>
  //   </>
  // );
  return (
    <>
      <Box
        ref={inputRef}
        component="div"
        contentEditable
        // dangerouslySetInnerHTML={{ __html: inputValue }}
        sx={{
          my: 1.5,
          py: 0.75,
          px: 1,
          minHeight: 40,
          borderRadius: 2,
          boxSizing: "border-box",
          fontSize: "14px",
          fontWeight: 400,
          lineHeight: "20px",
          border: (theme) => `1px solid ${theme.palette.border}`,

          "&:focus-visible": {
            outline: (theme) => `${theme.palette.primary.light} solid 1px`,
          },

          "&:empty:before": {
            content: '"Reply or add others with @"',
            color: "text.disabled",
          },
        }}
        onInput={(evt: FormEvent) => {
          buttonsContainerRef.current?.scrollIntoView();
          const value = evt.currentTarget.innerHTML;

          if (value === "<br>") {
            setInputValue("");
          } else {
            setInputValue(
              sanitizeHtml(value, {
                allowedTags: ["b", "i", "em", "strong", "a"],
                allowedAttributes: {
                  a: ["href", "rel", "target", "alt"],
                },
              })
            );
          }
        }}
        onKeyDown={(evt: React.KeyboardEvent<HTMLDivElement>) => {
          if (evt.key === "@") {
            console.log("show users dropdown");
          }
        }}
      />
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
};
