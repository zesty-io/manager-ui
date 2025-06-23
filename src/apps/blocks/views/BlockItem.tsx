import { Box, CircularProgress } from "@mui/material";
import { ItemEdit } from "../../content-editor/src/app/views/ItemEdit";
import { fetchModels } from "../../../shell/store/models";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ItemCreate } from "../../content-editor/src/app/views/ItemCreate";

export const BlockItem = ({ isCreate }: { isCreate?: boolean }) => {
  const dispatch = useDispatch();
  const { itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();

  useEffect(() => {
    //@ts-ignore
    dispatch(fetchModels());
  }, [itemZUID]);

  return (
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
  );
};
