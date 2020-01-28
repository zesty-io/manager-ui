import React, { Component } from "react";

import { Button } from "@zesty-io/core/Button";
import { Input } from "@zesty-io/core/Input";
import { ToggleButton } from "@zesty-io/core/ToggleButton";
import { Select, Option } from "@zesty-io/core/Select";

import { createRedirect } from "../../../../store/redirects";
import { pathsFetch } from "../../../../store/paths";

import styles from "./RedirectCreator.less";
export default class RedirectCreator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      toOptions: [],
      path: "",
      query_string: "",
      target_type: "page",
      target: "",
      code: "301"
    };
  }
  componentWillMount() {
    this.props.dispatch(pathsFetch());
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.options) {
      this.setState({
        toOptions: Object.keys(nextProps.options).map(key => {
          return {
            html: nextProps.options[key].path_full,
            value: nextProps.options[key].zuid
          };
        })
      });
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    // We only update if our toOptions state changed.
    const toOptionsChange = nextState.toOptions.find((child, i) => {
      return child !== this.state.toOptions[i];
    });
    return toOptionsChange ? true : false;
  }
  handleFrom(evt) {
    console.log("TODO// validate from url", evt);
    this.setState({
      path: evt.currentTarget.value
    });
  }
  handleCode(name, value) {
    this.setState({
      code: value
    });
  }
  handleTarget(evt) {
    this.setState({
      target: evt.target.dataset.value
    });
  }
  handleCreateRedirect() {
    this.props.dispatch(
      createRedirect({
        path: this.state.path,
        query_string: this.state.query_string,
        target_type: this.state.target_type,
        target: this.state.target,
        code: this.state.code
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
          <Select
            className={styles.to}
            name="redirectTo"
            onSelect={this.handleTarget.bind(this)}
          >
            {this.state.toOptions.map((opt, i) => {
              if (i !== 0) {
                return (
                  <Option key={opt.value} value={opt.value}>
                    {opt.html}
                  </Option>
                );
              } else {
                return (
                  <Option selected="true" key={opt.value} value={opt.value}>
                    {opt.html}
                  </Option>
                );
              }
            })}
          </Select>
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
