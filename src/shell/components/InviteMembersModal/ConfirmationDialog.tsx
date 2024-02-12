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
} from "@mui/material";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import MailIcon from "@mui/icons-material/Mail";

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
  return (
    <Dialog
      open={!!sentEmails.length && !Object.keys(failedInvites)?.length}
      onClose={onClose}
      fullWidth
      maxWidth={"xs"}
    >
      <DialogTitle>
        <PersonAddRoundedIcon
          color="primary"
          sx={{
            padding: 1,
            borderRadius: "20px",
            backgroundColor: "deepOrange.50",
            display: "block",
          }}
        />
        <Box sx={{ mt: 1.5 }}>
          You've invited {sentEmails?.length} people to be {roleName}
        </Box>
        <Typography sx={{ mt: 1 }} variant="body2" color="text.secondary">
          These invites have been sent to their emails
        </Typography>
      </DialogTitle>
      <DialogContent>
        {sentEmails.map((email) => (
          <ListItem divider>
            <ListItemIcon sx={{ minWidth: "36px" }}>
              <MailIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary={email}
              primaryTypographyProps={{
                variant: "body1",
              }}
            />
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
