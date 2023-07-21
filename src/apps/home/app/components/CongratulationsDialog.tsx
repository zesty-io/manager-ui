import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme as theme } from "@zesty-io/material";
import { ResourcesCard } from "./ResourcesCard";

interface Props {
  onClose: () => void;
}

export const CongratulationsDialog = ({ onClose }: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <Dialog open onClose={onClose} fullWidth maxWidth={"xs"}>
        <DialogTitle>
          🥳 Congratulations, you have successfully configured your instance!
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Please select the next step you’d like to take.
          </Typography>
          <ResourcesCard isMature={false} hideHeader hideFooter />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onClose}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};
