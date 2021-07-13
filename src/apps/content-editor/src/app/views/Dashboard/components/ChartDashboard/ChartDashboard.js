import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import moment from "moment";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";

import styles from "./ChartDashboard.less";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
export function ChartDashboard(props) {
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const logs = Object.keys(props.logs)
      .filter((zuid) => zuid.slice(0, 2) === "15")
      .map((zuid) => props.logs[zuid]);

    if (logs.length) {
      const base = [...new Array(30)];

      // moment ascending date
      const timestamps = base
        .map((_, idx) => moment().startOf("day").subtract(idx, "days"))
        .reverse();

      // format moment ascending date
      const categories = timestamps.map((time) => time.format("MM-DD-YY"));

      const timestampsMap = timestamps.reduce((acc, time) => {
        acc[time.format("MM-DD-YY")] = 0;
        return acc;
      }, {});

      logs.forEach((log) => {
        const time = moment(log.createdAt).format("MM-DD-YY");
        if (timestampsMap[time] !== undefined) {
          timestampsMap[time] = timestampsMap[time] + 1;
        }
      });

      const data = Object.values(timestampsMap);
      const total = data.reduce((acc, num) => acc + num, 0);

      setCategories(categories);
      setData(data);
      setTotal(total);
    }
  }, [Object.keys(props.logs).length]);

  const color = new Array(30).fill("rgba(54, 162, 235, 0.2)");

  return (
    <div className={styles.ChartDashboard}>
      <Card>
        <CardHeader>
          <FontAwesomeIcon icon={faCalendar} />
          30 days of team actions
        </CardHeader>
        <CardContent>
          <Bar
            data={{
              labels: [...categories],

              datasets: [
                {
                  display: false,
                  data: data,
                  backgroundColor: color,
                },
              ],
            }}
            height={200}
            width={400}
            options={{
              maintainAspectRatio: false,
              responsive: true,
              legend: {
                display: false,
              },
              title: {
                text: "Create: 1 Update: 2 Delete: 3 Publish: 4 Unpublish: 5",
                display: false,
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      autoSkip: true,
                      maxTicksLimit: 6,
                      beginAtZero: true,
                    },
                  },
                ],
              },

              labels: {
                fontFamily: " Montserrat",
              },
            }}
          />
        </CardContent>
        <CardFooter>
          There were <strong>{total} actions</strong> in the past{" "}
          <strong>30 days</strong>
        </CardFooter>
      </Card>
    </div>
  );
}
