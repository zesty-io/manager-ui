import React from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";
import styles from "./RedirectImportTable.less";

import RedirectImportTableRow from "./RedirectImportTableRow";
import ImportTableRowDisabled from "./ImportTableRowDisabled";

import { createRedirect } from "../../../store/redirects";
import { cancelImports } from "../../../store/imports";

export default class RedirectImportTable extends React.Component {
  constructor(props) {
    super(props);

    this.handleCancelImport = this.handleCancelImport.bind(this);
    this.handleAddAllRedirects = this.handleAddAllRedirects.bind(this);
  }
  render() {
    return (
      <section className={styles.RedirectImportTable}>
        <div className={styles.Actions}>
          <Button
            className={cx("save", styles.addAll)}
            onClick={this.handleAddAllRedirects}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add All Redirects
          </Button>

          <Button onClick={this.handleCancelImport}>
            <FontAwesomeIcon icon={faTimes} />
            Close Import
          </Button>
        </div>
        <div className={styles.Header}>
          <span className={styles.Cell} style={{ flex: "1" }}>
            From
          </span>
          <span className={styles.Cell} style={{ flexBasis: "6rem" }}>
            Type
          </span>
          <span className={styles.Cell} style={{ flex: "1" }}>
            To
          </span>
          <span className={styles.Cell} style={{ flexBasis: "6rem" }}></span>
        </div>
        <main className={styles.TableBody}>
          {Object.keys(this.props.imports).map((key) => {
            if (this.props.imports[key].canImport) {
              return (
                <RedirectImportTableRow
                  key={key}
                  paths={this.props.paths}
                  dispatch={this.props.dispatch}
                  siteZuid={this.props.siteZuid}
                  {...this.props.imports[key]}
                />
              );
            } else {
              return (
                <ImportTableRowDisabled
                  key={key}
                  {...this.props.imports[key]}
                />
              );
            }
          })}
        </main>
      </section>
    );
  }
  handleCancelImport() {
    this.props.dispatch(cancelImports());
  }
  handleAddAllRedirects() {
    Object.keys(this.props.imports).forEach((path) => {
      const redirect = this.props.imports[path];
      if (redirect.canImport) {
        this.props.dispatch(
          createRedirect({
            path: redirect.path,
            query_string: redirect.query_string,
            targetType: redirect.target_type,
            target: redirect.target_zuid || redirect.target,
            code: +redirect.code,
          })
        );
      }
    });
  }
}
