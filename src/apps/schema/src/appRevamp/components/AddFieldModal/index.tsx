import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  IconButton,
  TextField,
  InputAdornment,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";

// TODO: add static flag to field.tsx, if true, set primary and secondary text manually
const fields: { [key: string]: [] } = {
  text: [],
  media: [],
  relationship: [],
  number: [],
  number2: [],
  date: [],
  other: [],
};

interface Props {
  open: boolean;
  handleCloseModal: Dispatch<SetStateAction<boolean>>;
}
export const AddFieldModal = ({ open, handleCloseModal }: Props) => {
  return (
    <Dialog
      open={open}
      onClose={() => handleCloseModal(false)}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle
        display="flex"
        sx={{
          justifyContent: "space-between",
          padding: 3,
        }}
      >
        Select a Field Type
        <IconButton onClick={() => handleCloseModal(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          "&.MuiDialogContent-dividers": {
            borderColor: "grey.100",
          },
        }}
      >
        <DialogContentText>
          <Box py={2} width="349px">
            <TextField
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
};
