import React, { PureComponent, Fragment } from "react";
import { connect } from "react-redux";

import { request } from "utility/request";
import { notify } from "shell/store/notifications";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Button } from "@zesty-io/core/Button";
import { Textarea } from "@zesty-io/core/Textarea";

import styles from "./WorkflowRequests.less";
export default connect(state => {
  return {
    user: state.user,
    instance: state.instance
  };
})(
  class WorkflowRequest extends PureComponent {
    state = {
      users: [],
      loaded: false,
      sending: false,
      fields: this.props.fields,
      message: "",
      selectedFields: [],
      selectedMembers: []
    };

    componentDidMount() {
      //fetch team members and fields
      request(
        `${CONFIG.API_ACCOUNTS}/instances/${zesty.instance.ZUID}/users`
      ).then(data => {
        this.setState({ loaded: true });
        if (data.status === 400) {
          this.props.dispatch(
            notify({
              message: `Failure fetching users: ${data.error}`,
              kind: "error"
            })
          );
        } else {
          this.setState({ users: data.data });
        }
      });
    }

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
      const header = `<h3>Workflow Request on the ${this.props.itemTitle} page from ${this.props.user.firstName}</h3>`;
      const message = this.state.message
        ? `<p>${this.state.message}</p>`
        : `<p>${this.props.user.firstName} is requesting content for the "${this.props.itemTitle}" page.</p>`;
      const reviewMessage = `<p>Areas to review or edit: ${this.state.selectedFields.join(
        ", "
      )}</p>`;
      const reviewLink = `<p>Please click <a href="${window.location.href}">this link</a> to view this page in Zesty.</p>`;
      const reviewLinkRaw = `<p><a href="${window.location.href}">${window.location.href}</a></p>`;
      const thankYou = `<p>Thank you!</p>`;
      const body = `${header}${message}${reviewMessage}${reviewLink}${reviewLinkRaw}${thankYou}`;
      const subject = `${this.props.instance.name} Workflow Request from ${this.props.user.firstName}`;
      const to = this.state.selectedMembers.join(", ");
      this.setState({ sending: true });
      request(`${CONFIG.CLOUD_FUNCTIONS_DOMAIN}/sendEmail`, {
        json: true,
        body: {
          body,
          subject,
          to
        }
      }).then(res => {
        this.props.dispatch(
          notify({
            message: "Successfully sent workflow request",
            kind: "save"
          })
        );
        this.setState({ sending: false }, () => this.props.handleClose());
      });
    };

    render() {
      const { handleClose } = this.props;
      return (
        <Card className={styles.WorkflowRequest}>
          <CardHeader>Workflow Request</CardHeader>
          <CardContent>
            <h3>Select team members to contact</h3>
            <WithLoader condition={this.state.loaded}>
              <div className={styles.ScrollContainer}>
                <ul>
                  {this.state.users.map(user => (
                    <li key={user.ZUID}>
                      <input
                        type="checkbox"
                        onClick={this.handleSelectUser}
                        name={user.email}
                      />
                      {user.firstName} {user.lastName}
                    </li>
                  ))}
                </ul>
              </div>
            </WithLoader>

            <h3>Select fields to be reviewed or edited</h3>
            <div className={styles.ScrollContainer}>
              <ul>
                {this.state.fields.map(field => (
                  <li key={field.ZUID}>
                    <input
                      type="checkbox"
                      onClick={this.handleSelectField}
                      name={field.name}
                    />
                    {field.label}
                  </li>
                ))}
              </ul>
            </div>
            <Textarea
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
            <ButtonGroup>
              <Button
                onClick={this.handleSend}
                id="WorkflowRequestSendButton"
                disabled={this.state.sending}
              >
                {this.state.sending ? (
                  <Fragment>
                    <FontAwesomeIcon icon={faSpinner} />
                    &nbsp;Sending
                  </Fragment>
                ) : (
                  "Send"
                )}
              </Button>
              <Button onClick={handleClose}>Cancel</Button>
            </ButtonGroup>
          </CardFooter>
        </Card>
      );
    }
  }
);
