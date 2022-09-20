import { Box, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { EmptyState } from "./components/EmptyState";
import { Redirect, Route, Switch } from "react-router";
import { Sidebar } from "./components/Sidebar";
import { AllMedia } from "./views/AllMedia";
import { Media } from "./views/Media";
import { SearchMedia } from "./views/SearchMedia";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { uploadFile } from "../../../../shell/store/media-revamp";
import { useDispatch } from "react-redux";

export const MediaApp = () => {
  const dispatch = useDispatch();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log({ acceptedFiles });
    acceptedFiles.forEach((f) => dispatch(uploadFile(f)));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          color: "text.primary",
          backgroundColor: "background.paper",
          height: "100%",
          display: "flex",
        }}
        {...getRootProps()}
      >
        <Sidebar />
        <Switch>
          <Route exact path="/media" component={AllMedia} />
          <Route exact path="/media/:id" component={Media} />
          <Route exact path="/media/search" component={SearchMedia} />
          <Redirect to="/media" />
        </Switch>
        <input {...getInputProps()} />
      </Box>
    </ThemeProvider>
  );
};
