import { Component } from "react";
import styles from "./RedirectImportTableRow.less";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import { Input } from "@zesty-io/core/Input";
import { ToggleButton } from "@zesty-io/core/ToggleButton";
import { Select, Option } from "@zesty-io/core/Select";

import { createRedirect } from "../../../../store/redirects";
import { importTarget } from "../../../../store/imports";
import { importQuery } from "../../../../store/imports";

export default class RedirectImportTableRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      code: 1,
    };

    this.handleCode = this.handleCode.bind(this);
    this.handlePageTarget = this.handlePageTarget.bind(this);
    this.handlePathTarget = this.handlePathTarget.bind(this);
    this.handleQuery = this.handleQuery.bind(this);
    this.handleAddRedirect = this.handleAddRedirect.bind(this);
  }
  render() {
    return (
      <div className={styles.RedirectImportTableRow}>
        <span className={styles.RowCell} style={{ flex: "1" }}>
          {this.props.path}
        </span>

        <span className={styles.RedirectCreatorCell}>
          <ToggleButton
            className={styles.code}
            name="redirectType"
            value={this.state.code}
            offValue="302"
            onValue="301"
            onChange={this.handleCode}
          />
        </span>

        <span className={styles.RedirectCreatorCell}>Page</span>

        <span className={styles.RowCell} style={{ flex: "1" }}>
          {this.props.target_type === "page" ? (
            <Select
              className={styles.selector}
              onSelect={this.handlePageTarget}
            >
              {Object.keys(this.props.paths).map((key) => {
                let path = this.props.paths[key];

                if (path.path_full !== this.props.target) {
                  return (
                    <Option key={key} value={path.path_full}>
                      {path.path_full}
                    </Option>
                  );
                } else {
                  return (
                    <Option selected="true" key={key} value={path.path_full}>
                      {path.path_full}
                    </Option>
                  );
                }
              })}
            </Select>
          ) : (
            <Input
              onChange={this.handlePathTarget}
              defaultValue={this.props.target}
            />
          )}
          <Input
            onChange={this.handleQuery}
            placeholder="Redirect query string"
            defaultValue={this.props.query_string}
          />
        </span>

        <span className={styles.RowCell}>
          <Button className="save" onClick={this.handleAddRedirect}>
            <FontAwesomeIcon icon={faPlus} />
            Redirect
          </Button>
        </span>
      </div>
    );
  }
  handleCode(value) {
    this.setState({
      code: value,
    });
  }
  handlePageTarget(evt) {
    const path = this.props.paths[evt.target.dataset.value];
    this.props.dispatch(
      importTarget(this.props.path, path.path_full, path.zuid)
    );
  }
  handlePathTarget(evt) {
    console.log("// TODO handlePathTarget", evt);
  }
  handleQuery(evt) {
    this.props.dispatch(importQuery(this.props.path, evt.target.value));
  }
  handleAddRedirect(evt) {
    this.props.dispatch(
      createRedirect({
        path: this.props.path,
        query_string: this.props.query_string,
        targetType: this.props.target_type,
        target: this.props.target_zuid || this.props.target,
        code: this.state.code === 1 ? 301 : 302,
      })
    );
  }
}
