import { FC, useEffect, useState, Dispatch } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  DialogActions,
  Button,
  CircularProgress,
  InputLabel,
  Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import { withCursorPosition } from "../../../../../../shell/components/withCursorPosition";

const TextFieldWithCursorPosition = withCursorPosition(TextField);

interface Props {
  handleUpdateMutation: (renamedFilename: string) => void;
  onClose?: () => void;
  onSetNewFilename: Dispatch<string>;
  newFilename: string;
  isSuccessUpdate: boolean;
  isLoadingUpdate: boolean;
  resetUpdate: any;
  extension: string;
  src: string;
}

export const RenameFileModal: FC<Props> = ({
  handleUpdateMutation,
  onClose,
  onSetNewFilename,
  newFilename,
  isSuccessUpdate,
  isLoadingUpdate,
  resetUpdate,
  extension,
  src,
}) => {
  const [renamedFilename, setRenamedFilename] = useState<string>(newFilename);

  useEffect(() => {
    if (!isLoadingUpdate && isSuccessUpdate) {
      resetUpdate();
      onClose();
    }
  }, [isLoadingUpdate, isSuccessUpdate]);

  const handleUpdate = () => {
    onSetNewFilename(renamedFilename);
    handleUpdateMutation(renamedFilename);
  };

  return (
    <Dialog open={true} fullWidth maxWidth={"xs"} onClose={onClose}>
      <DialogTitle>
        <Box
          component="img"
          src={`${src}?height=120&width=120&fit=bounds`}
          width="120px"
          height="120px"
          bgcolor="grey.100"
          sx={{
            objectFit: "contain",
            borderRadius: "8px",
          }}
          mb={1.5}
        />
        <Typography variant="h5" fontWeight="700">
          Rename File
        </Typography>
      </DialogTitle>
      <DialogContent>
        <InputLabel>New File Name</InputLabel>
        <TextFieldWithCursorPosition
          sx={{
            mt: 1,
            width: "100%",
            "& .MuiInputBase-input": {
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
          autoFocus
          onFocus={(evt: React.FocusEvent<HTMLInputElement>) =>
            evt.target.select()
          }
          value={renamedFilename}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
            setRenamedFilename(evt.target.value.replace(" ", "-"));
          }}
          onKeyPress={(event: React.KeyboardEvent<HTMLDivElement>) =>
            event.key === "Enter" && handleUpdate()
          }
          InputProps={{
            disableUnderline: true,
            endAdornment: (
              <Typography variant="body2" color="text.secondary">
                .{extension}
              </Typography>
            ),
          }}
        />
        <Alert
          severity="warning"
          sx={{
            mt: 2.5,
            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
            color: "#643a03",
            ".MuiAlert-icon": {
              color: "#643a03",
            },
          }}
        >
          This will change the URL path and could break existing links
          referenced in production after a period of time.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpdate}
          disabled={isLoadingUpdate}
        >
          {isLoadingUpdate ? (
            <CircularProgress size="24px" color="inherit" />
          ) : (
            "Update"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenameFileModal;
