import {
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  SvgIcon,
} from "@mui/material";
import { ErrorRounded, CheckRounded } from "@mui/icons-material";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import MailIcon from "@mui/icons-material/Mail";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

type ConfirmationModalProps = {
  sentEmails: string[];
  onClose: () => void;
  onResetSentEmails: () => void;
  roleName: string;
  failedInvites: Record<string, string>;
};
export const ConfirmationModal = ({
  sentEmails,
  onClose,
  onResetSentEmails,
  roleName,
  failedInvites,
}: ConfirmationModalProps) => {
  const hasFailedInvites = !!Object.keys(failedInvites).length;
  const hasSuccessfulInvites = !!sentEmails.length;

  const generateHeaderText = () => {
    if (hasFailedInvites && hasSuccessfulInvites) {
      return `Invites set to ${Object.keys(failedInvites).length} out of ${
        Object.keys(failedInvites).length + sentEmails.length
      } users (via email)`;
    }

    if (hasFailedInvites && !hasSuccessfulInvites) {
      return `Unable to invite ${Object.keys(failedInvites).length} users`;
    }

    if (!hasFailedInvites && hasSuccessfulInvites) {
      return `Invite sent to ${sentEmails.length} users (via email)`;
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth={"xs"}>
      <DialogTitle>
        <SvgIcon
          component={hasFailedInvites ? ErrorRounded : CheckRounded}
          color={hasFailedInvites ? "error" : "success"}
          sx={{
            padding: 1,
            borderRadius: "20px",
            backgroundColor: hasFailedInvites ? "red.100" : "green.100",
            display: "block",
          }}
        />
        <Box sx={{ mt: 1.5 }}>{generateHeaderText()}</Box>

        <Typography sx={{ mt: 1 }} variant="body2" color="text.secondary">
          See list below
        </Typography>
      </DialogTitle>
      <DialogContent>
        {sentEmails.map((email) => (
          <ListItem divider dense disableGutters sx={{ borderColor: "border" }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CheckCircleRoundedIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText
              sx={{
                "& .MuiListItemText-primary": {
                  display: "flex",
                  justifyContent: "space-between",
                },
              }}
            >
              <Typography variant="body2" color="text.primary">
                {email}
              </Typography>
              <Typography variant="body2">Invite sent</Typography>
            </ListItemText>
          </ListItem>
        ))}
        {Object.entries(failedInvites)?.map(([email, reason]) => (
          <ListItem divider dense disableGutters sx={{ borderColor: "border" }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <ErrorRoundedIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText
              sx={{
                "& .MuiListItemText-primary": {
                  display: "flex",
                  justifyContent: "space-between",
                },
              }}
            >
              <Typography variant="body2" color="text.primary">
                {email}
              </Typography>
              <Typography variant="body2">{reason}</Typography>
            </ListItemText>
          </ListItem>
        ))}
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={onResetSentEmails}>
          Invite More People
        </Button>
        <Button color="primary" variant="contained" onClick={() => onClose()}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};
