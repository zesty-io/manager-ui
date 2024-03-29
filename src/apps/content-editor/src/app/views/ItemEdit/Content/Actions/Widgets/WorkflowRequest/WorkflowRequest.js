import { memo, useState } from "react";

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from "@mui/icons-material/Save";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionActions from "@mui/material/AccordionActions";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EmailIcon from "@mui/icons-material/Email";
import Box from "@mui/material/Box";

import useIsMounted from "ismounted";
import { useDispatch, useSelector } from "react-redux";

import { Textarea } from "@zesty-io/core/Textarea";
import { request } from "utility/request";
import { notify } from "shell/store/notifications";
import styles from "./WorkflowRequests.less";

export default memo(function WorkflowRequest({ itemTitle, fields }) {
  const dispatch = useDispatch();
  const isMounted = useIsMounted();
  const user = useSelector((state) => state.user);
  const users = useSelector((state) => state.users);
  const instance = useSelector((state) => state.instance);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFields, setSelectedFields] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  function handleSelectField(evt, val) {
    const { name } = evt.target;
    // push name to state
    if (val) {
      setSelectedFields([...selectedFields, name]);
    } else {
      setSelectedFields(selectedFields.filter((field) => field !== name));
    }
  }

  function handleSelectUser(evt, val) {
    // push name to state
    const { name } = evt.target;
    if (val) {
      setSelectedMembers([...selectedMembers, name]);
    } else {
      setSelectedMembers(selectedMembers.filter((user) => user !== name));
    }
  }

  function handleSend() {
    const body = `
<p><strong>${
      user.firstName + " " + user.lastName
    }</strong> has sent you a workflow request for <a href="${
      window.location.href
    }">${itemTitle}</a> on ${instance.name}.</p>

${
  message
    ? `<blockquote style="border-left: 3px solid #444;padding: 0 12px;">${message}</blockquote>`
    : ""
}

${
  selectedFields.length
    ? `<p>Fields to review:</p>
  <ul>
  ${selectedFields.map((field) => `<li>${field}</li>`).join("")}
  </ul>`
    : ""
}

<p><small>Direct Link: <a href="${window.location.href}">${
      window.location.href
    }</a></small></p>
      `;

    const subject = `Workflow Request on ${instance.name} from ${user.firstName}`;
    const to = selectedMembers.join(", ");

    setSending(true);

    request(`${CONFIG.CLOUD_FUNCTIONS_DOMAIN}/sendEmail`, {
      json: true,
      body: {
        body,
        subject,
        to,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          dispatch(
            notify({
              message: `Sent workflow request on ${itemTitle} to ${selectedMembers.join(
                ", "
              )}`,
              kind: "save",
            })
          );
        } else {
          dispatch(
            notify({
              message: `Failed sending workflow request on ${itemTitle} to ${selectedMembers.join(
                ", "
              )}`,
              kind: "warn",
            })
          );
        }
      })
      .finally(() => {
        if (isMounted.current) {
          setSending(false);
        }
      });
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Accordion elevation={0} sx={{ backgroundColor: "transparent" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: "transparent",
            p: 0,
            borderBottom: 1,
            borderColor: "grey.200",
            minHeight: "0px",
            height: "32px",
            ".MuiAccordionSummary-content": {
              m: 0,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: "16px",
              color: "#10182866",
              ".MuiSvgIcon-root": {
                mr: 1,
              },
            }}
          >
            <Typography
              sx={{
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "32px",
                color: "#101828",
              }}
              textTransform="uppercase"
            >
              Workflow Request
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails
          sx={{ display: "flex", flexDirection: "column", gap: 2, p: 0, mt: 2 }}
        >
          <Box component="div">
            <Typography component="h3" variant="h6">
              Select team members
            </Typography>
            <Box component="ul">
              {users.map((user) => (
                <Box component="li" key={user.ZUID} sx={{ listStyle: "none" }}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="secondary"
                          size="small"
                          name={user.email}
                          onChange={(evt, val) => handleSelectUser(evt, val)}
                        />
                      }
                      label={`${user.firstName} ${user.lastName}`}
                    />
                  </FormGroup>
                </Box>
              ))}
            </Box>

            <Typography component="h3" variant="h6" sx={{ my: 2 }}>
              Select fields for review
            </Typography>
            <Box component="ul">
              {fields.map((field) => (
                <Box component="li" key={field.ZUID} sx={{ listStyle: "none" }}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="secondary"
                          size="small"
                          name={field.name}
                          onChange={(evt, val) => handleSelectField(evt, val)}
                        />
                      }
                      label={field.label}
                    />
                  </FormGroup>
                </Box>
              ))}
            </Box>

            <Textarea
              className={styles.TextArea}
              name="message"
              placeholder="Workflow request message"
              value={message}
              onChange={(evt) => setMessage(evt.target.value)}
            />
          </Box>
        </AccordionDetails>
        <AccordionActions>
          <Button
            variant="contained"
            id="WorkflowRequestSendButton"
            onClick={handleSend}
            disabled={sending}
            startIcon={
              sending ? <CircularProgress size="20px" /> : <SaveIcon />
            }
          >
            Send Email
          </Button>
        </AccordionActions>
      </Accordion>
    </Box>
  );
});
