import React from "react";
import styles from "./RedirectImportTableRow.less";

import { createRedirect } from "../../../../store/redirects";
import { importCode } from "../../../../store/imports";
import { importTarget } from "../../../../store/imports";
import { importQuery } from "../../../../store/imports";

export default class RedirectImportTableRow extends React.Component {
  constructor(props) {
    super(props);

    this.handleToggle = this.handleToggle.bind(this);
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

        <span className={styles.RowCell}>
          <Toggle className={styles.code} onClick={this.handleToggle}>
            <ToggleOption
              value="301"
              selected={this.props.code == "301" ? "true" : ""}
            >
              301
            </ToggleOption>
            <ToggleOption
              value="302"
              selected={this.props.code == "302" ? "true" : ""}
            >
              302
            </ToggleOption>
          </Toggle>
        </span>

        <span className={styles.RowCell} style={{ flex: "1" }}>
          {this.props.target_type === "page" ? (
            <Select
              className={styles.selector}
              onSelect={this.handlePageTarget}
            >
              {Object.keys(this.props.paths).map(key => {
                let path = this.props.paths[key];

                if (path.path_full !== this.props.target) {
                  return (
                    <SelectOption key={key} value={path.path_full}>
                      {path.path_full}
                    </SelectOption>
                  );
                } else {
                  return (
                    <SelectOption
                      selected="true"
                      key={key}
                      value={path.path_full}
                    >
                      {path.path_full}
                    </SelectOption>
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
            <i className="fa fa-plus" aria-hidden="true"></i>Redirect
          </Button>
        </span>
      </div>
    );
  }
  handleToggle(evt, code) {
    this.props.dispatch(importCode(this.props.path, code));
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
        target_type: this.props.target_type,
        target: this.props.target_zuid || this.props.target,
        code: this.props.code
      })
    );
  }
}
