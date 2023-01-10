import {
  Typography,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

interface Props {
  onModalClose: () => void;
}
export const FieldForm = ({ onModalClose }: Props) => {
  return (
    <>
      <DialogTitle
        display="flex"
        sx={{
          justifyContent: "space-between",
          padding: 3,
        }}
      >
        Select a Field Type
        <IconButton onClick={onModalClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography>Field form page</Typography>
      </DialogContent>
    </>
  );
};
