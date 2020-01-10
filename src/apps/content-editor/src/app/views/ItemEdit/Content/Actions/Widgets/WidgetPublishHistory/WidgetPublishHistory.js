import React from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";

import { fetchAuditTrailPublish } from "../../../../../../../store/contentLogs";

// import { Widget, WidgetHeader, WidgetContent } from "../Widget";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

export default connect(state => {
  return {
    logs: state.contentLogs,
    instanceZUID: state.instance.ZUID
  };
})(
  class WidgetPublishHistory extends React.PureComponent {
    state = {
      loading: true,
      ZUID: this.props.ZUID
    };

    componentDidMount() {
      this.props
        .dispatch(
          fetchAuditTrailPublish(this.props.instanceZUID, this.props.itemZUID)
        )
        .then(() => {
          this.setState({
            loading: false
          });
        });
    }
    componentDidUpdate() {
      if (this.state.ZUID !== this.props.ZUID) {
        this.setState({ loading: true, ZUID: this.props.ZUID }, () => {
          this.props
            .dispatch(
              fetchAuditTrailPublish(
                this.props.instanceZUID,
                this.props.itemZUID
              )
            )
            .then(() => {
              this.setState({
                loading: false
              });
            });
        });
      }
    }
    render() {
      const logs =
        this.props.logs[this.props.itemZUID] &&
        this.props.logs[this.props.itemZUID].auditTrailPublish;
      return (
        <Card id="WidgetPublishHistory" className="pageDetailWidget">
          <CardHeader>
            <span className="audit-title">
              <i className="fas fa-user-check" aria-hidden="true" />
              &nbsp;Publish History
            </span>
            <small>Audit Trail&trade;</small>
          </CardHeader>
          <CardContent className="setting-field audit-trail-content">
            {/* Show Loading, Show no logs available, or show logs */}
            {this.state.loading ? (
              <p>Loading Logs</p>
            ) : logs && logs.length ? (
              <ul className="logs">
                {logs.map(log => {
                  const dataformat = new Date(log.happenedAt)
                    .toISOString()
                    .slice(0, 10);
                  const { firstName, lastName } = log;
                  return (
                    <li className="log" key={log.ZUID}>
                      <strong>{`${firstName} ${lastName}`}</strong> published{" "}
                      {moment(log.happenedAt).fromNow()}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="noLogs">
                No Audit Trail&trade; publish logs for this content.
              </p>
            )}
          </CardContent>
        </Card>
      );
    }
  }
);
