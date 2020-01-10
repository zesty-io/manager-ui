import * as Sentry from "@sentry/browser";
import React, { Component } from "react";
import { connect } from "react-redux";
import styles from "./AppError.less";
import { Button } from "@zesty-io/core/Button";

export default connect((state, props) => {
  return { ...props, user: state.user };
})(
  class AppError extends Component {
    constructor(props) {
      super(props);
      this.state = { error: null };
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

    componentDidUpdate() {
      if (this.props.user.permissionsError && this.state.error === null) {
        this.setState({ error: true });
      }
    }

    render() {
      if (this.state.error) {
        return (
          <section className={styles.AppCrash}>
            <h1 className={styles.Display}>
              <i className="fas fa-bug" aria-hidden="true" />
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
                <i className="fas fa-envelope" aria-hidden="true" />
                &nbsp;Click Here to Report
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
