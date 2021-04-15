import React, { useEffect, useState } from "react";

import { Line } from "react-chartjs-2";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { request } from "utility/request";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartArea } from "@fortawesome/free-solid-svg-icons";

import { useDomain } from "shell/hooks/use-domain";

import styles from "./PageviewTraffic.less";

export function PageviewTraffic(props) {
  const [chartData, setChartData] = useState(props.data);

  const domain = useDomain();

  useEffect(() => {
    if (domain) {
      getBarChartData().then(json => {
        if (json && json.chartJSData) {
          setChartData(json.chartJSData);
        } else if (json && json.status === 400) {
          props.setGALegacyStatus(true);
        }
      });
    }
  }, [domain]);

  function getBarChartData() {
    return request(
      `${CONFIG.SERVICE_GOOGLE_ANALYTICS_READ}/?zuid=${props.instanceZUID}`,
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
                viewId: props.profileID,
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
  return (
    <Card>
      <CardHeader>
        <h2 className={styles.columns}>
          <div className={styles.column}>
            <FontAwesomeIcon className={styles.muted} icon={faChartArea} />
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
          data={chartData}
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
