import { memo, useState } from "react";

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from "@mui/icons-material/Save";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import useIsMounted from "ismounted";
import { useDispatch, useSelector } from "react-redux";

import {
  CollapsibleCard,
  CardContent,
  CardFooter,
} from "@zesty-io/core/CollapsibleCard";

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
    <CollapsibleCard
      className={styles.WorkflowRequest}
      header={
        <span>
          <FontAwesomeIcon icon={faEnvelope} />
          &nbsp;Workflow Request
        </span>
      }
    >
      <CardContent>
        <h3 className={styles.subheadline}>Select team members</h3>
        <ul>
          {users.map((user) => (
            <li className={styles.Checkboxes} key={user.ZUID}>
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
            </li>
          ))}
        </ul>

        <h3 className={styles.subheadline}>Select fields for review</h3>
        <ul>
          {fields.map((field) => (
            <li className={styles.Checkboxes} key={field.ZUID}>
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
            </li>
          ))}
        </ul>
        <Textarea
          className={styles.TextArea}
          name="message"
          placeholder="Workflow request message"
          value={message}
          onChange={(evt) => setMessage(evt.target.value)}
        />
      </CardContent>
      <CardFooter>
        <Button
          variant="contained"
          id="WorkflowRequestSendButton"
          className={styles.Button}
          onClick={handleSend}
          disabled={sending}
          startIcon={sending ? <CircularProgress size="20px" /> : <SaveIcon />}
        >
          Send Email
        </Button>
      </CardFooter>
    </CollapsibleCard>
  );
});
