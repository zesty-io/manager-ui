import React, { Component } from "react";

import RedirectActions from "./RedirectActions";
import RedirectsTable from "./RedirectsTable";
import RedirectImportTable from "./RedirectImportTable";
import RedirectLoader from "./RedirectLoader";

import { fetchRedirects } from "../../store/redirects";

import styles from "./RedirectsManager.less";
export default class RedirectsManager extends Component {
  componentWillMount() {
    this.props.dispatch(fetchRedirects());
  }
  render() {
    return (
      <div className={styles.RedirectsManager}>
        <RedirectActions
          dispatch={this.props.dispatch}
          redirectsTotal={this.props.redirectsTotal}
        />
        {this.props.redirectsLoading ? (
          <RedirectLoader />
        ) : Object.keys(this.props.imports).length ? (
          <RedirectImportTable {...this.props} />
        ) : (
          <RedirectsTable {...this.props} />
        )}
      </div>
    );
  }
}
