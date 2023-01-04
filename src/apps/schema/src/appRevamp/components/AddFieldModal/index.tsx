import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";

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
      <DialogContent dividers>
        <DialogContentText>
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
};
