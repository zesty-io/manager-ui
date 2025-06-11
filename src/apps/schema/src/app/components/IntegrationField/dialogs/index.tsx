import React from "react";
import { Box } from "@mui/material";
import SelectDisplayType from "./SelectDisplayType";

type Props = {};

const ApiIntegrationDialog = (props: Props) => {
  return (
    <Box>
      <SelectDisplayType />
    </Box>
  );
};

export default ApiIntegrationDialog;
