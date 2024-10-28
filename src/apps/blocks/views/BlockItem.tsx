import { Box } from "@mui/material";
import { ItemEdit } from "../../content-editor/src/app/views/ItemEdit";
import { fetchModels } from "../../../shell/store/models";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
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

  useEffect(() => {
    dispatch(fetchModels());
  }, []);

  return (
    <ThemeProvider theme={customTheme}>
      <Box width="100%">{isCreate ? <ItemCreate /> : <ItemEdit />}</Box>
    </ThemeProvider>
  );
};
