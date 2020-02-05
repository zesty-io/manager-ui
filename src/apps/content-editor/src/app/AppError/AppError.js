import * as Sentry from "@sentry/browser";
import React, { Component } from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBug, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";

import styles from "./AppError.less";
export default connect((state, props) => {
  return { ...props, user: state.user };
})(
  class AppError extends Component {
    constructor(props) {
      super(props);
      this.state = {
        error: null
      };
    }

    componentDidCatch(error, errorInfo) {
      this.setState({ error });
      Sentry.withScope(scope => {
        Object.keys(errorInfo).forEach(key => {
          scope.setExtra(key, errorInfo[key]);
        });
        Sentry.captureException(error);
      });
    }

    render() {
      if (this.state.error) {
        return (
          <section className={styles.AppCrash}>
            <h1 className={styles.Display}>
              <FontAwesomeIcon icon={faBug} />
              &nbsp;We apologize but something went wrong
            </h1>
            <h3 className={styles.SubHead}>
              Try reloading the application (CMD + R).&nbsp;
              {/*<a
                      href={`mailto:support@zesty.io?subject=Accounts App Crash&body=REPLACE WITH EXTRA INFORMATION ---- ${
                        this.state.err
                      }`}
                      target="_blank"
                    >
                      Report to support@zesty.io
                    </a>*/}
              <a onClick={() => Sentry.showReportDialog()}>
                Report to support@zesty.io
              </a>
            </h3>
            <p>
              <Button kind="save" onClick={() => Sentry.showReportDialog()}>
                <FontAwesomeIcon icon={faEnvelope} /> &nbsp;Click Here to Report
              </Button>
            </p>
          </section>
        );
      } else {
        return this.props.children;
      }
    }
  }
);
