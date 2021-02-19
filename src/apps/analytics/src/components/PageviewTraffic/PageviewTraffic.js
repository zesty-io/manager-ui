import React from "react";
import { Line } from "react-chartjs-2";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { request } from "utility/request";

import styles from "./PageviewTraffic.less";
export class PageviewTraffic extends React.PureComponent {
  state = {
    data: this.props.data
  };
  componentDidMount() {
    if (this.props.domainSet) {
      this.getBarChartData().then(json => {
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
  getBarChartData() {
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
                dateRanges: [
                  {
                    startDate: "14daysAgo",
                    endDate: "today"
                  }
                ],
                metrics: [
                  { expression: "ga:sessions" },
                  { expression: "ga:pageviews" }
                ],
                dimensions: [
                  { name: "ga:date" },
                  { name: "ga:dayOfWeekName" },
                  { name: "ga:month" },
                  { name: "ga:day" },
                  { name: "ga:year" }
                ],
                orderBys: [
                  {
                    fieldName: "ga:date",
                    orderType: "VALUE",
                    sortOrder: "ASCENDING"
                  }
                ]
              }
            ]
          },
          type: "bar",
          excludeLabelDimensions: [0]
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
                className={`${styles.icon} fa fa-area-chart ${styles.muted}`}
              />
              Pageview/Traffic
            </div>
            <div
              className={`${styles.column} ${styles.muted} ${styles.isAlignedRight}`}
            >
              Last 14 Days
            </div>
          </h2>
        </CardHeader>
        <CardContent>
          <Line
            data={this.state.data}
            // width={500}
            height={575}
            options={{
              maintainAspectRatio: false,
              bezierCurve: false,
              scales: {
                yAxes: [
                  {
                    display: true
                  }
                ],
                xAxes: [
                  {
                    display: false
                  }
                ]
              },
              options: {
                legend: {
                  display: true,
                  position: "bottom"
                }
              }
            }}
          />
        </CardContent>
      </Card>
    );
  }
}
