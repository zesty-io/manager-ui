import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Alert,
  Button,
  Box,
} from "@mui/material";
import { File } from "../../../../../../shell/services/types";

type ReplaceFileModalProps = {
  data: File;
  onClose: () => void;
};
export const ReplaceFileModal = ({ onClose, data }: ReplaceFileModalProps) => {
  return (
    <Dialog open onClose={onClose} maxWidth="xs">
      <DialogTitle>
        <Box
          component="img"
          src={`${data?.url}?width=120&optimize=high`}
          sx={{
            width: 120,
            height: 120,
            objectFit: "contain",
            borderRadius: 2,
            mb: 1.5,
          }}
        />
        <Typography variant="h5" sx={{ wordBreak: "break-all" }}>
          <Box component="span" fontWeight={700}>
            Replace File:
          </Box>
          &nbsp;
          {data?.filename}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning">
          The original file will be deleted and replaced by it’s new file. This
          action cannot be undone and the file cannot be recovered. The file
          will retain its URL and ZUID.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary">
          Replace
        </Button>
      </DialogActions>
    </Dialog>
  );
};
