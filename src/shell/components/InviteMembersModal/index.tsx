import { useRef, useState } from "react";
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
  Select,
  TextField,
  Typography,
} from "@mui/material";
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";
import { RoleAccessInfo } from "./RoleAccessInfo";
import { RoleSelectModal } from "./RoleSelectModal";
import {
  useCreateUserInviteMutation,
  useGetCurrentUserRolesQuery,
} from "../../services/accounts";
import { LoadingButton } from "@mui/lab";
import { NoPermission } from "./NoPermission";
import instanzeZUID from "../../../utility/instanceZUID";
import { ConfirmationModal } from "./ConfirmationDialog";

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
      let _emails = [...emails];
      // Check if aside from the email chips the user also left any other input
      if (
        inputValue &&
        !inputValue.match(emailAddressRegexp) &&
        !inputValue.match(/^\s+$/)
      ) {
        setEmailError(true);
        return;
      } else {
        _emails = [...new Set([..._emails, inputValue])];
      }

      setSendingEmails(true);
      const invites = _emails.map((email) =>
        createUserInvite({
          inviteeEmail: email,
          accessLevel: roleIndex,
        }).unwrap()
      );
      await Promise.allSettled(invites);
      setSentEmails([..._emails]);
      setEmails([]);
      setSendingEmails(false);
      setInputValue("");
    } else {
      // This is if the user just free types an email address instead of pressing "," "space" or "Enter"
      if (inputValue) {
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
          autocompleteRef.current?.querySelector("input")?.focus();
        }
      } else {
        setEmailError(true);
        autocompleteRef.current?.querySelector("input")?.focus();
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
          <Box sx={{ mt: 1.5, fontWeight: 700 }}>Invite Users</Box>
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
                  ".MuiOutlinedInput-root ": {
                    alignItems: "baseline",
                    minHeight: 93,
                  },
                }}
                ref={autocompleteRef}
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
                  onDelete={(evt) => {
                    if (evt.type === "click") {
                      setEmails(emails.filter((_, i) => i !== index));
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace") {
                      // HACK: Needed to override the default behavior of autocomplete where it automatically selects the next tag after deleting a diff tag via backspace
                      setTimeout(() => {
                        setEmails(emails.filter((_, i) => i !== index));
                        autocompleteRef.current
                          ?.querySelector("input")
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
      <ConfirmationModal
        roleName={roles[roleIndex].name}
        onClose={onClose}
        sentEmails={sentEmails}
        error={createUserInviteError}
        onResetSentEmails={() => setSentEmails([])}
      />
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
