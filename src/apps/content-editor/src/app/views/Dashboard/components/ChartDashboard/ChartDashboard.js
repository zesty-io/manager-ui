import React from "react";
import { request } from "utility/request";
import { Bar } from "react-chartjs-2";

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

export function ChartDashboard() {
  return (
    <div className={styles.ChartDashboard}>
      <Card>
        <CardHeader>Editing Trend Last 30 days Coming Soon</CardHeader>
        <CardContent>
          <Bar
            data={{
              labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              datasets: [
                {
                  label: "Latest Actions Activity",
                  data: [12, 19, 3, 5, 15],
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
