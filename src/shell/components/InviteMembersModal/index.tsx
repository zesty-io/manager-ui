import { useEffect, useMemo, useRef, useState } from "react";
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
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";
import MailIcon from "@mui/icons-material/Mail";
import { RoleAccessInfo } from "./RoleAccessInfo";
import { RoleSelectModal } from "./RoleSelectModal";
import {
  useCreateUserInviteMutation,
  useGetCurrentUserRolesQuery,
} from "../../services/accounts";
import { LoadingButton } from "@mui/lab";
import { NoPermission } from "./NoPermission";
import instanzeZUID from "../../../utility/instanceZUID";

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

const emailAddressRegexp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const InviteMembersModal = ({ onClose }: Props) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [emailError, setEmailError] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [roleIndex, setRoleIndex] = useState(1);
  const [showRoleSelectModal, setShowRoleSelectModal] = useState(false);
  const [sentEmails, setSentEmails] = useState([]);
  const [sendingEmails, setSendingEmails] = useState(false);
  const emailChipsRef = useRef([]);
  const autocompleteRef = useRef(null);

  const [createUserInvite, { isError: createUserInviteError }] =
    useCreateUserInviteMutation();
  const { data: currentUserRoles } = useGetCurrentUserRolesQuery();

  const canInvite = currentUserRoles
    ?.filter((role) => role.entityZUID === instanzeZUID)
    ?.some((role) => ["admin", "owner"].includes(role.name?.toLowerCase()));

  const handleInvites = async () => {
    if (emails?.length) {
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
    } else {
      // This is if the user just free types an email address instead of pressing "," or "Enter"
      if (inputValue) {
        // TODO: Confirm with Zosh if pressing space should just add this email as a chip instead
        const inputAsEmails = [...new Set(inputValue.split(" "))];

        if (inputAsEmails.every((email) => email.match(emailAddressRegexp))) {
          setSendingEmails(true);
          const invites = inputAsEmails.map((email) =>
            createUserInvite({
              inviteeEmail: email,
              accessLevel: roleIndex,
            }).unwrap()
          );
          await Promise.allSettled(invites);
          setSentEmails([...inputAsEmails]);
          setEmails([]);
          setInputValue("");
          setSendingEmails(false);
        } else {
          setEmailError(true);
          autocompleteRef.current?.querySelector("textarea")?.focus();
        }
      } else {
        setEmailError(true);
        autocompleteRef.current?.querySelector("textarea")?.focus();
      }
    }
  };

  if (!canInvite) {
    return <NoPermission onClose={onClose} />;
  }

  return (
    <>
      <Dialog
        open={!sentEmails.length}
        onClose={onClose}
        fullWidth
        maxWidth={"xs"}
      >
        <DialogTitle>
          <GroupAddRoundedIcon
            color="primary"
            sx={{
              padding: 1,
              borderRadius: "20px",
              backgroundColor: "deepOrange.50",
              display: "block",
            }}
          />
          <Box sx={{ mt: 1.5, fontWeight: 700 }}>Invite Members </Box>
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
                sx={{
                  ".MuiOutlinedInput-root ": { alignItems: "baseline" },
                }}
                ref={autocompleteRef}
                multiline
                rows={3}
                error={emailError}
                placeholder={
                  emails.length ? "" : "Email, comma or space separated"
                }
                helperText={
                  emailError ? "Please enter a valid email address." : " "
                }
                onKeyDown={(event) => {
                  setEmailError(false);
                  if (
                    event.key === "Enter" ||
                    event.key === "," ||
                    event.key === " "
                  ) {
                    if (inputValue && !inputValue.match(/^\s+$/)) {
                      if (inputValue.trim().match(emailAddressRegexp)) {
                        event.preventDefault();
                        setEmails([...new Set([...emails, inputValue.trim()])]);
                        setInputValue("");
                      } else {
                        setEmailError(true);
                      }
                    } else {
                      setEmailError(false);
                    }
                  }

                  if (event.key === "Backspace" && !inputValue) {
                    event.stopPropagation();

                    // HACK: Needed to prevent the default behavior of autocomplete which autodeletes the right most tag on backspace
                    setTimeout(() => {
                      emailChipsRef.current?.[
                        emailChipsRef.current?.filter((ref) => !!ref)?.length -
                          1
                      ]?.focus({ visible: true });
                    }, 100);
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
                  ref={(el) => (emailChipsRef.current[index] = el)}
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
                  onKeyDown={(event) => {
                    if (event.key === "Backspace") {
                      // HACK: Needed to override the default behavior of autocomplete where it automatically selects the next tag after deleting a diff tag via backspace
                      setTimeout(() => {
                        setEmails(emails.filter((_, i) => i !== index));
                        autocompleteRef.current
                          ?.querySelector("textarea")
                          ?.focus();
                      }, 150);
                    }
                  }}
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
            loading={sendingEmails}
          >
            Invite
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={!!sentEmails.length && !createUserInviteError}
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
