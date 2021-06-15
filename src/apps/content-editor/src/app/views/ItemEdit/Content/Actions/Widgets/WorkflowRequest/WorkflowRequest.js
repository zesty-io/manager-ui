import React, { memo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faSpinner,
  faEnvelope
} from "@fortawesome/free-solid-svg-icons";
import useIsMounted from "ismounted";

import {
  CollapsibleCard,
  CardContent,
  CardFooter
} from "@zesty-io/core/CollapsibleCard";
import { Button } from "@zesty-io/core/Button";
import { Textarea } from "@zesty-io/core/Textarea";
import { request } from "utility/request";
import { notify } from "shell/store/notifications";
import styles from "./WorkflowRequests.less";

export default memo(function WorkflowRequest({ itemTitle, fields }) {
  const isMounted = useIsMounted();
  const user = useSelector(state => state.user);
  const users = useSelector(state => state.users);
  const instance = useSelector(state => state.instance);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFields, setSelectedFields] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  function handleSelectField(evt) {
    const { name, checked } = evt.target;
    // push name to state
    if (checked) {
      setSelectedFields([...selectedFields, name]);
    } else {
      setSelectedFields(selectedFields.filter(field => field !== name));
    }
  }

  function handleSelectUser(evt) {
    const { name, checked } = evt.target;
    // push email to state
    if (checked) {
      setSelectedMembers([...selectedMembers, name]);
    } else {
      setSelectedMembers(selectedMembers.filter(user => user !== name));
    }
  }

  function handleSend() {
    const body = `
<p><strong>${user.firstName +
      " " +
      user.lastName}</strong> has sent you a workflow request for <a href="${
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
  ${selectedFields.map(field => `<li>${field}</li>`).join("")}
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
        to
      }
    })
      .then(res => {
        if (res.status === 200) {
          dispatch(
            notify({
              message: `Sent workflow request on ${itemTitle} to ${selectedMembers.join(
                ", "
              )}`,
              kind: "save"
            })
          );
        } else {
          dispatch(
            notify({
              message: `Failed sending workflow request on ${itemTitle} to ${selectedMembers.join(
                ", "
              )}`,
              kind: "warn"
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
          {users.map(user => (
            <li className={styles.Checkboxes} key={user.ZUID}>
              <label onClick={handleSelectUser}>
                <input type="checkbox" name={user.email} />
                {user.firstName} {user.lastName}
              </label>
            </li>
          ))}
        </ul>

        <h3 className={styles.subheadline}>Select fields for review</h3>
        <ul>
          {fields.map(field => (
            <li className={styles.Checkboxes} key={field.ZUID}>
              <label onClick={handleSelectField}>
                <input type="checkbox" name={field.name} />
                {field.label}
              </label>
            </li>
          ))}
        </ul>
        <Textarea
          className={styles.TextArea}
          name="message"
          placeholder="Workflow request message"
          value={message}
          onChange={evt => setMessage(evt.target.value)}
        />
      </CardContent>
      <CardFooter>
        <Button
          id="WorkflowRequestSendButton"
          className={styles.Button}
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <FontAwesomeIcon icon={faSave} />
          )}
          Send Email
        </Button>
      </CardFooter>
    </CollapsibleCard>
  );
});
