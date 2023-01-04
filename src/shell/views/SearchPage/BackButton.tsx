import { FC } from "react";

import CloseIcon from "@mui/icons-material/Close";
import { useHistory } from "react-router";
import { IconButton } from "@mui/material";

export const BackButton: FC = () => {
  const history = useHistory();
  if (history.action === "POP") {
    return null;
  }
  return (
    <IconButton onClick={() => history.goBack()}>
      <CloseIcon fontSize="small" />
    </IconButton>
  );
};
