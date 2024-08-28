import { GridRenderCellParams } from "@mui/x-data-grid-pro";
import { Chip } from "@mui/material";

export const SingleRelationshipCell = ({
  params,
}: {
  params: GridRenderCellParams;
}) => {
  return <Chip label={params.value} size="small" />;
};
