import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";

import styles from "./InboundTraffic.less";
export class InboundTraffic extends React.PureComponent {
  state = {
    data: this.props.data
  };
  componentDidMount() {
    if (this.props.domainSet) {
      this.getInboundTraffic().then(json => {
        if (json && json.chartJSData) {
          this.setState({
            data: json.chartJSData
          });
        } else if (json && json.status === 400) {
          this.props.setGALegacyStatus(true);
        }
      });
    }
  }
  getInboundTraffic() {
    return request(
      `${CONFIG.SERVICE_GOOGLE_ANALYTICS_READ}/?zuid=${this.props.instanceZUID}`,
      {
        method: "POST",
        credentials: "omit",
        headers: {
          "Content-Type": "plain/text"
        },
        body: JSON.stringify({
          gaRequest: {
            reportRequests: [
              {
                viewId: this.props.profileID,
                dateRanges: [{ startDate: "14daysAgo", endDate: "yesterday" }],
                metrics: [{ expression: "ga:sessions" }],
                dimensions: [{ name: "ga:medium" }],
                dimensionFilterClauses: [
                  {
                    filters: [
                      {
                        dimensionName: "ga:medium",
                        not: true,
                        expressions: ["(not set)"]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          type: "pie"
        })
      }
    );
  }

  render() {
    return (
      <Card>
        <CardHeader>
          <h2 className={styles.columns}>
            <div className={styles.column}>
              <span
                className={`${styles.icon} fa fa-pie-chart ${styles.muted}`}
              />
              Inbound Traffic
            </div>
            <div
              className={`${styles.column} ${styles.muted} ${styles.isAlignedRight}`}
            >
              Last 14 Days
            </div>
          </h2>
        </CardHeader>
        <CardContent>
          <Doughnut
            data={this.state.data}
            // width={250}
            height={250}
            options={{
              maintainAspectRatio: false,
              legend: {
                display: true,
                position: "left"
              }
            }}
          />
        </CardContent>
      </Card>
    );
  }
}
