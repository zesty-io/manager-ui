import { useState } from "react";
import { Box, TextField, Button, Stack } from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";

type InputFieldProps = {
  isFirstComment: boolean;
};
export const InputField = ({ isFirstComment }: InputFieldProps) => {
  const [inputValue, setInputValue] = useState("");
  const [maxHeight, setMaxHeight] = useState(40);

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
        component="div"
        contentEditable
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
        }}
      />
      <Stack direction="row" gap={1} justifyContent="end">
        <Button variant="outlined" color="inherit" size="small">
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
  //     <TextField
  //       fullWidth
  //       multiline
  //       autoFocus={isFirstComment}
  //       value={inputValue}
  //       onChange={(evt) => setInputValue(evt.currentTarget.value)}
  //       placeholder="Reply or add others with @"
  //       sx={{
  //         my: 1.5,
  //       }}
  //     />
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
};
