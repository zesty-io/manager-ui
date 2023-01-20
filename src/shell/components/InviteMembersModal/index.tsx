import { useState } from "react";
import {
  Autocomplete,
  Button,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  ListItem,
  ListItemIcon,
  ListItemText,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import MailIcon from "@mui/icons-material/Mail";
import { RoleAccessInfo } from "./RoleAccessInfo";
import { RoleSelectModal } from "./RoleSelectModal";
import { useCreateUserInviteMutation } from "../../services/accounts";
import { LoadingButton } from "@mui/lab";

interface Props {
  onClose: () => void;
}

const roles = [
  {
    name: "Owner",
  },
  {
    name: "Admin",
  },
  {
    name: "Developer",
  },
  {
    name: "SEO",
  },
  {
    name: "Publisher",
  },
  {
    name: "Contributor",
  },
];

const InviteMembersModal = ({ onClose }: Props) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [emailError, setEmailError] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [roleIndex, setRoleIndex] = useState(1);
  const [showRoleSelectModal, setShowRoleSelectModal] = useState(false);
  const [sentEmails, setSentEmails] = useState([]);
  const [sendingEmails, setSendingEmails] = useState(false);

  const [createUserInvite] = useCreateUserInviteMutation();

  const handleInvites = async () => {
    setSendingEmails(true);
    const invites = emails.map((email) =>
      createUserInvite({
        inviteeEmail: email,
        accessLevel: roleIndex,
      }).unwrap()
    );
    await Promise.allSettled(invites);
    setSentEmails([...emails]);
    setEmails([]);
    setSendingEmails(false);
  };

  return (
    <>
      <Dialog
        open={!sentEmails.length}
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
          <Box sx={{ mt: 1.5 }}>Invite Members </Box>
          <Typography sx={{ mt: 1 }} variant="body2" color="text.secondary">
            These invites will be sent as emails
          </Typography>
        </DialogTitle>
        <DialogContent>
          <InputLabel>Invite</InputLabel>
          <Autocomplete
            multiple
            value={emails}
            options={[]}
            freeSolo
            inputValue={inputValue}
            disableClearable
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{ ".MuiOutlinedInput-root ": { alignItems: "baseline" } }}
                multiline
                rows={3}
                error={emailError}
                placeholder="e.g. name@zesty.io"
                helperText={emailError ? "Invalid email format" : " "}
                onKeyDown={(event) => {
                  setEmailError(false);
                  if (event.key === "Enter" || event.key === ",") {
                    if (
                      inputValue &&
                      inputValue.match(/^[^@]+@[^@]+\.[^@]+$/)
                    ) {
                      setEmails([...new Set([...emails, inputValue])]);
                      setInputValue("");
                    } else {
                      setEmailError(true);
                    }
                  }
                }}
                onChange={(event) => {
                  if (event.target.value?.split("").pop() === ",") return;
                  setInputValue(event.target.value);
                }}
                value={inputValue}
              />
            )}
            renderTags={(tagValue, getTagProps) =>
              emails.map((email, index) => (
                <Chip
                  {...getTagProps({ index })}
                  size="small"
                  color="default"
                  clickable={false}
                  sx={{
                    backgroundColor: "common.white",
                    borderColor: "grey.300",
                    borderWidth: 1,
                    borderStyle: "solid",
                  }}
                  label={email}
                  onDelete={() =>
                    setEmails(emails.filter((_, i) => i !== index))
                  }
                />
              ))
            }
          />
          <InputLabel>Invite as</InputLabel>
          <Select
            fullWidth
            value={roleIndex}
            renderValue={(value) => roles[value as number].name}
            open={false}
            onOpen={() => setShowRoleSelectModal(true)}
          ></Select>
          <Box>
            <RoleAccessInfo role={roleIndex} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => onClose()}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleInvites}
            disabled={!emails?.length}
            loading={sendingEmails}
          >
            Invite
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={!!sentEmails.length}
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
            You've invited {sentEmails?.length} people to be{" "}
            {roles[roleIndex].name}
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
          <Button
            color="inherit"
            variant="outlined"
            onClick={() => setSentEmails([])}
          >
            Invite More People
          </Button>
          <Button color="primary" variant="contained" onClick={() => onClose()}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
      {showRoleSelectModal && (
        <RoleSelectModal
          role={roleIndex}
          onSelect={(roleIndex) => {
            setRoleIndex(roleIndex);
            setShowRoleSelectModal(false);
          }}
          onClose={() => setShowRoleSelectModal(false)}
        />
      )}
    </>
  );
};

export default InviteMembersModal;
