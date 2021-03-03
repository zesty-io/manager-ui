import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import moment from "moment";

import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

import styles from "./ChartDashboard.less";
export function ChartDashboard(props) {
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    const logs = Object.keys(props.logs)
      .filter(zuid => zuid.slice(0, 2) === "15")
      .map(zuid => props.logs[zuid]);

    const base = [...new Array(30)];
    const timestamps = base
      .map((_, idx) =>
        moment()
          .startOf("day")
          .subtract(idx, "days")
      )
      .reverse();

    const categories = timestamps.map(time => time.format("MM-DD-YY"));

    const timestampsMap = timestamps.reduce((acc, time) => {
      acc[time.format("MM-DD-YY")] = 0;
      return acc;
    }, {});

    logs.forEach(log => {
      const time = moment(log.createdAt).format("MM-DD-YY");
      timestampsMap[time] = timestampsMap[time] + 1;
    });

    const data = Object.values(timestampsMap);

    setCategories(categories);
    setData(data);
  }, [Object.keys(props.logs).length]);

  const color = new Array(30).fill("rgba(54, 162, 235, 0.2)");

  return (
    <div className={styles.ChartDashboard}>
      <Card>
        <CardHeader>Last 30 days of instance actions</CardHeader>
        <CardContent>
          <Bar
            data={{
              labels: [...categories],

              datasets: [
                {
                  // label: "Actions Per Day",
                  display: false,
                  data: data,
                  backgroundColor: color
                }
              ]
            }}
            height={200}
            width={400}
            options={{
              maintainAspectRatio: false,
              responsive: true,
              legend: {
                display: false
              },
              title: {
                text: "Create: 1 Update: 2 Delete: 3 Publish: 4 Unpublish: 5",
                display: false
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      autoSkip: true,
                      maxTicksLimit: 6,
                      beginAtZero: true
                    }
                  }
                ]
              },
              // title: { text: "Rolling 30 Day Aggregate", display: true },
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
