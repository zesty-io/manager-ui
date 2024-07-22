import { GridRenderCellParams } from "@mui/x-data-grid-pro";
import { Chip } from "@mui/material";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { searchItems } from "../../../../../../../shell/store/content";

export const SingleRelationshipCell = ({
  params,
}: {
  params: GridRenderCellParams;
}) => {
  const dispatch = useDispatch();
  useEffect(() => {
    // If value starts with '7-', that means it was unable to find the item in the store so we need to fetch it
    if (params.value?.startsWith("7-")) {
      dispatch(searchItems(params.value));
    }
  }, [params.value, dispatch]);
  return <Chip label={params.value} size="small" />;
};
