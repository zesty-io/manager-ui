import React, { PureComponent } from "react";
import { connect } from "react-redux";

import { request } from "utility/request";
import { notify } from "shell/store/notifications";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faSpinner,
  faEnvelope
} from "@fortawesome/free-solid-svg-icons";
import {
  CollapsibleCard,
  CardContent,
  CardFooter
} from "@zesty-io/core/CollapsibleCard";
import { Button } from "@zesty-io/core/Button";
import { Textarea } from "@zesty-io/core/Textarea";

import styles from "./WorkflowRequests.less";
export default connect(state => {
  return {
    user: state.user,
    instance: state.instance,
    users: state.users
  };
})(
  class WorkflowRequest extends PureComponent {
    state = {
      sending: false,
      message: "",
      selectedFields: [],
      selectedMembers: []
    };

    handleSelectField = evt => {
      const { name, checked } = evt.target;
      // push name to state
      if (checked) {
        this.setState({ selectedFields: [...this.state.selectedFields, name] });
      } else {
        this.setState({
          selectedFields: this.state.selectedFields.filter(
            user => user !== name
          )
        });
      }
    };

    handleSelectUser = evt => {
      const { name, checked } = evt.target;
      // push email to state
      if (checked) {
        this.setState({
          selectedMembers: [...this.state.selectedMembers, name]
        });
      } else {
        this.setState({
          selectedMembers: this.state.selectedMembers.filter(
            user => user !== name
          )
        });
      }
    };

    handleSend = () => {
      const body = `
<p><strong>${this.props.user.firstName +
        " " +
        this.props.user
          .lastName}</strong> has sent you a workflow request for <a href="${
        window.location.href
      }">${this.props.itemTitle}</a> on ${this.props.instance.name}.</p>

${
  this.state.message
    ? `<blockquote style="border-left: 3px solid #444;padding: 0 12px;">${this.state.message}</blockquote>`
    : ""
}

${
  this.state.selectedFields.length
    ? `<p>Fields to review:</p>
  <ul>
  ${this.state.selectedFields.map(field => `<li>${field}</li>`).join("")}
  </ul>`
    : ""
}

<p><small>Direct Link: <a href="${window.location.href}">${
        window.location.href
      }</a></small></p>
      `;

      const subject = `Workflow Request on ${this.props.instance.name} from ${this.props.user.firstName}`;
      const to = this.state.selectedMembers.join(", ");

      this.setState({
        sending: true
      });

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
            this.props.dispatch(
              notify({
                message: "Sent workflow request",
                kind: "save"
              })
            );
          } else {
            this.props.dispatch(
              notify({
                message: "Failed sending workflow request",
                kind: "warn"
              })
            );
          }
        })
        .finally(() => {
          this.setState({
            sending: false
          });
        });
    };

    render() {
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
              {this.props.users.map(user => (
                <li className={styles.Checkboxes} key={user.ZUID}>
                  <label onClick={this.handleSelectUser}>
                    <input type="checkbox" name={user.email} />
                    {user.firstName} {user.lastName}
                  </label>
                </li>
              ))}
            </ul>

            <h3 className={styles.subheadline}>Select fields for review</h3>
            <ul>
              {this.props.fields.map(field => (
                <li className={styles.Checkboxes} key={field.ZUID}>
                  <label onClick={this.handleSelectField}>
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
              value={this.state.message}
              onChange={evt =>
                this.setState({
                  [evt.target.name]: evt.target.value
                })
              }
            />
          </CardContent>
          <CardFooter>
            <Button
              id="WorkflowRequestSendButton"
              className={styles.Button}
              onClick={this.handleSend}
              disabled={this.state.sending}
            >
              {this.state.sending ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faSave} />
              )}
              Send Email
            </Button>
          </CardFooter>
        </CollapsibleCard>
      );
    }
  }
);
