import React, { Component } from "react";

import { Button } from "@zesty-io/core/Button";
import { Input } from "@zesty-io/core/Input";
import { ToggleButton } from "@zesty-io/core/ToggleButton";

import { createRedirect } from "../../../../store/redirects";

import styles from "./RedirectCreator.less";
import ContentSearch from "shell/components/ContentSearch";
export default class RedirectCreator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      path: "",
      targetType: "path",
      target: "",
      code: 1
    };
  }
  handleFrom(evt) {
    console.log("TODO// validate from url", evt);
    this.setState({
      path: evt.currentTarget.value
    });
  }
  handleCode(value) {
    this.setState({
      code: value
    });
  }
  handleTarget(value) {
    this.setState({
      target: value
    });
  }
  handleCreateRedirect() {
    this.props.dispatch(
      createRedirect({
        path: this.state.path,
        targetType: this.state.targetType,
        target: this.state.target,
        code: this.state.code === 1 ? 301 : 302
      })
    );
  }
  render() {
    return (
      <div className={styles.RedirectCreator}>
        <span className={styles.RedirectCreatorCell} style={{ flex: "1" }}>
          <Input
            className={styles.from}
            name="redirectFrom"
            type="text"
            placeholder="Enter the old url you want to create a redirect with."
            onChange={this.handleFrom.bind(this)}
          />
        </span>
        <span className={styles.RedirectCreatorCell}>
          <ToggleButton
            className={styles.code}
            name="redirectType"
            value={this.state.code}
            offValue="302"
            onValue="301"
            onChange={this.handleCode.bind(this)}
          />
        </span>
        <span className={styles.RedirectCreatorCell} style={{ flex: "1" }}>
          <ContentSearch
            className={styles.SearchBar}
            onSelect={(item, setSearchTerm) => {
              setSearchTerm(item.web.path);
              this.handleTarget(item.web.path);
            }}
            filterResults={results =>
              results.filter(result => result.web.path !== null)
            }
          />
        </span>
        <span className={styles.RedirectCreatorCell}>
          <Button
            className="save"
            onClick={this.handleCreateRedirect.bind(this)}
          >
            <i className="fa fa-plus" aria-hidden="true"></i>Redirect
          </Button>
        </span>
      </div>
    );
  }
}
