import { FC, useEffect, useState, Dispatch } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  DialogActions,
  Button,
  CircularProgress,
  InputLabel,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

interface Props {
  handleUpdateMutation: (renamedFilename: string) => void;
  onClose?: () => void;
  onSetNewFilename: Dispatch<string>;
  newFilename: string;
  isSuccessUpdate: boolean;
  isLoadingUpdate: boolean;
  resetUpdate: any;
}

export const RenameFileModal: FC<Props> = ({
  handleUpdateMutation,
  onClose,
  onSetNewFilename,
  newFilename,
  isSuccessUpdate,
  isLoadingUpdate,
  resetUpdate,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [renamedFilename, setRenamedFilename] = useState<string>(newFilename);

  useEffect(() => {
    if (!isLoadingUpdate && isSuccessUpdate) {
      resetUpdate();
      onClose();
    }
  }, [isLoadingUpdate, isSuccessUpdate]);

  return (
    <Dialog open={true} fullWidth maxWidth={"xs"}>
      <DialogTitle>
        <Typography variant="h5">Rename File</Typography>
      </DialogTitle>
      <DialogContent>
        <InputLabel>New File Name</InputLabel>
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
          }}
          disabled={isLoadingUpdate}
          startIcon={
            isLoadingUpdate && (
              <CircularProgress size="20px" sx={{ color: "text.primary" }} />
            )
          }
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenameFileModal;
