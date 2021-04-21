import React, { useEffect, useState } from "react";

import { Doughnut } from "react-chartjs-2";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { request } from "utility/request";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie } from "@fortawesome/free-solid-svg-icons";

import { useDomain } from "shell/hooks/use-domain";

import styles from "./InboundTraffic.less";

export function InboundTraffic(props) {
  const [chartData, setChartData] = useState(props.data);

  const domain = useDomain();

  useEffect(() => {
    if (domain) {
      getInboundTraffic().then(json => {
        if (json && json.chartJSData) {
          setChartData(json.chartJSData);
        } else if (json && json.status === 400) {
          props.setGALegacyStatus(true);
        }
      });
    }
  }, [domain]);

  function getInboundTraffic() {
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
  return (
    <Card>
      <CardHeader>
        <h2 className={styles.columns}>
          <div className={styles.column}>
            <FontAwesomeIcon className={styles.muted} icon={faChartPie} />
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
          data={chartData}
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
