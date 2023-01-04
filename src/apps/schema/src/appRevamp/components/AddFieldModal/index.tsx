import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";

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
      <DialogTitle>Select a Field Type</DialogTitle>
      <DialogContent>
        <DialogContentText>Search</DialogContentText>
      </DialogContent>
    </Dialog>
  );
};
