import { Box, CircularProgress } from "@mui/material";
import { ItemEdit } from "../../content-editor/src/app/views/ItemEdit";
import { fetchModels } from "../../../shell/store/models";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ItemCreate } from "../../content-editor/src/app/views/ItemCreate";
import { customTheme } from "../../content-editor/src/app/ContentEditor";
import { ThemeProvider } from "@mui/material/styles";

export const BlockItem = ({ isCreate }: { isCreate?: boolean }) => {
  const dispatch = useDispatch();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    //@ts-ignore
    dispatch(fetchModels()).then(() => setIsFetching(false));
  }, []);

  if (isFetching) {
    return (
      <Box
        display="flex"
        justifyContent={"center"}
        alignItems={"center"}
        height="100%"
        width="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        width="100%"
        sx={{
          "*": {
            boxSizing: "unset",
          },
        }}
      >
        {isCreate ? <ItemCreate /> : <ItemEdit />}
      </Box>
    </ThemeProvider>
  );
};
