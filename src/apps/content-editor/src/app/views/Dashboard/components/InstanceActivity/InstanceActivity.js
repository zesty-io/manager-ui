import { useEffect, useState } from "react";
import moment from "moment";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import styles from "./InstanceActivity.less";

export function InstanceActivity(props) {
  const [edits, setEdits] = useState(0);
  const [publishes, setPublishes] = useState(0);

  useEffect(() => {
    const since = moment().subtract(30, "days");
    const userLogs = Object.keys(props.logs)
      .filter(
        (logZUID) => props.logs[logZUID].actionByUserZUID === props.user.ZUID
      )
      .map((zuid) => props.logs[zuid])
      .filter((log) => moment(log.createdAt).isSameOrAfter(since));

    const edits = userLogs.filter((log) => log.action === 2);
    const publishes = userLogs.filter((log) => log.action === 4);

    setEdits(edits.length);
    setPublishes(publishes.length);
  }, [props.user, props.logs]);

  return (
    <>
      <Card sx={{ m: 2 }}>
        <CardHeader
          avatar={<CalendarMonthIcon fontSize="small" />}
          title="30 days of your actions"
        ></CardHeader>
        <CardContent>
          <div className={styles.WrapperActivity}>
            <div className={styles.Stats}>
              <div className={styles.Stat}>
                <h2 className={styles.headline}>{edits}</h2>
                <small className={styles.subheadline}>Edits</small>
              </div>

              <div className={styles.Stat}>
                <h2 className={styles.headline}>{publishes}</h2>
                <small className={styles.subheadline}>Publishes</small>
              </div>
            </div>

            <h1 className={styles.title}>
              {props.user.firstName} you had a total of{" "}
              <strong>{edits + publishes}</strong> actions in the last{" "}
              <strong>30 days</strong>
            </h1>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
