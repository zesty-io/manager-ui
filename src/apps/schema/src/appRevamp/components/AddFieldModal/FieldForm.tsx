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
import { stringStartsWithVowel } from "../utils";

interface Props {
  type: string;
  name: string;
  onModalClose: () => void;
  onBackClick: Dispatch<SetStateAction<ViewMode>>;
}
export const FieldForm = ({ type, name, onModalClose, onBackClick }: Props) => {
  const headerText = stringStartsWithVowel(name)
    ? `Add an ${name} Field`
    : `Add a ${name} Field`;

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
          <Box px={1.5}>
            <FieldIcon type={type} height="28px" width="28px" fontSize="16px" />
          </Box>
          {headerText}
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
