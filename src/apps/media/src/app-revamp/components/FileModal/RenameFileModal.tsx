import { FC, useEffect, useState, Dispatch } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

interface Props {
  handleUpdateMutation: (renamedFilename: string) => void;
  onClose?: () => void;
  onSetNewFilename: Dispatch<string>;
  newFilename: string;
}

export const RenameFileModal: FC<Props> = ({
  handleUpdateMutation,
  onClose,
  onSetNewFilename,
  newFilename,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [renamedFilename, setRenamedFilename] = useState<string>(
    newFilename.substring(0, newFilename.lastIndexOf("."))
  );

  return (
    <Dialog open={true} fullWidth maxWidth={"xs"}>
      <DialogTitle>
        <Typography variant="h5">Rename File</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>New File Name</Typography>
        <TextField
          sx={{
            mt: 1,
            width: "100%",
            "& .MuiInputBase-input": {
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
          value={renamedFilename}
          onChange={(evt) => {
            setRenamedFilename(evt.target.value);
          }}
          InputProps={{
            disableUnderline: true,
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button color="inherit" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onSetNewFilename(renamedFilename);
            handleUpdateMutation(renamedFilename);
            onClose();
          }}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenameFileModal;
