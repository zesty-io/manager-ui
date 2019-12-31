import React, { PureComponent, Fragment } from "react";

import { request } from "utility/request";
import { notify } from "shell/store/notifications";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Button } from "@zesty-io/core/Button";
import { Textarea } from "@zesty-io/core/Textarea";

import styles from "./WorkflowRequests.less";
export class WorkflowRequest extends PureComponent {
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
      `${CONFIG.service.accounts_api}/instances/${zesty.site.zuid}/users`
    ).then(data => {
      this.setState({ loaded: true });
      if (data.status === 400) {
        notify({
          message: `Failure fetching users: ${data.error}`,
          kind: "error"
        });
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
        selectedFields: this.state.selectedFields.filter(user => user !== name)
      });
    }
  };

  handleSelectUser = evt => {
    const { name, checked } = evt.target;
    // push email to state
    if (checked) {
      this.setState({ selectedMembers: [...this.state.selectedMembers, name] });
    } else {
      this.setState({
        selectedMembers: this.state.selectedMembers.filter(
          user => user !== name
        )
      });
    }
  };

  handleSend = () => {
    const body = {};
    body.url = window.location.href;
    body.page = this.props.itemTitle;
    body.message = this.state.message;
    this.state.selectedFields.forEach(field => {
      body[`sections[${field}]`] = "on";
    });
    this.state.selectedMembers.forEach(user => {
      body[`email[${user}]`] = "on";
    });
    this.setState({ sending: true });
    request(`${CONFIG.service.manager}/ajax/request_content.ajax.php`, {
      method: "POST",
      body
    }).then(res => {
      notify({
        message: "Successfully sent workflow request",
        kind: "save"
      });
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
                  <i className="fa fa-spin fa-spinner" aria-hidden="true" />
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
