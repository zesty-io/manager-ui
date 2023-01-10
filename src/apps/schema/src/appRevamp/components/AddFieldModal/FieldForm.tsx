import { Dispatch, SetStateAction } from "react";
import {
  Typography,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { ViewMode } from "./index";
import { FieldIcon } from "../Field/FieldIcon";

interface Props {
  type: string;
  name: string;
  onModalClose: () => void;
  onBackClick: Dispatch<SetStateAction<ViewMode>>;
}
export const FieldForm = ({ type, name, onModalClose, onBackClick }: Props) => {
  return (
    <>
      <DialogTitle
        display="flex"
        sx={{
          justifyContent: "space-between",
          padding: 3,
        }}
      >
        <Box display="flex" alignItems="center">
          <IconButton size="small" onClick={() => onBackClick("fields_list")}>
            <ArrowBackIcon />
          </IconButton>
          <FieldIcon type={type} height="28px" width="28px" fontSize="16px" />
          Add a {name} Field
        </Box>
        <IconButton size="small" onClick={onModalClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        <Typography>Field form page</Typography>
      </DialogContent>
    </>
  );
};
