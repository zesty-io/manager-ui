import React from "react";
import { request } from "utility/request";
import { Bar } from "react-chartjs-2";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faEye,
  faUser,
  faUsers,
  faGlobe
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

import styles from "./ChartDashboard.less";

export function ChartDashboard({ totalUserEdits, totalEveryoneEdits } = props) {
  let today = moment().unix();
  // Get date from # days ago
  let DaysAgo = days =>
    moment()
      .subtract(days, "days")
      .unix();

  // Loop through updatedAt dates && filter recentedits 30 days ago
  const checkEdits = (total, days) => {
    return total.filter(user => {
      let userLatest = moment(user.updatedAt).unix();
      if (userLatest <= today && userLatest >= DaysAgo(days)) {
        return total;
      }
    });
  };
  const userNumber = checkEdits(totalUserEdits, 30);
  // const everyoneNumber = checkEdits(totalEveryoneEdits, 30);
  console.log(userNumber);

  const userData = userNumber.map(act => act.action);

  const lastThirtyDays = [...new Array(30)].map((i, idx) =>
    moment()
      .startOf("day")
      .subtract(idx, "days")
      .format("MM-DD-YY")
  );

  return (
    <div className={styles.ChartDashboard}>
      <Card>
        <CardHeader>Editing Trend Last 30 days Coming Soon</CardHeader>
        <CardContent>
          <Bar
            data={{
              labels: [...lastThirtyDays],
              datasets: [
                {
                  label: "Latest Actions Activity",
                  data: [...userData],
                  backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(255, 206, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(153, 102, 255, 0.2)"
                  ],
                  borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)"
                  ],
                  borderWidth: 2
                }
              ]
            }}
            height={200}
            width={400}
            options={{
              maintainAspectRatio: false,
              scales: {
                yAxes: [
                  {
                    ticks: {
                      beginAtZero: true
                    }
                  }
                ]
              },
              labels: {
                fontFamily: " Montserrat"
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
