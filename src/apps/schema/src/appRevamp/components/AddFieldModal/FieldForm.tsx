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
          <IconButton onClick={() => onBackClick("fields_list")}>
            <ArrowBackIcon />
          </IconButton>
          Add a {name} Field
        </Box>
        <IconButton onClick={onModalClose}>
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
