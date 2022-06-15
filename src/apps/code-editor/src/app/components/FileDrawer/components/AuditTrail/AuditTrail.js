import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import HistoryIcon from "@mui/icons-material/History";

import { Notice } from "@zesty-io/core/Notice";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./AuditTrail.less";

export default function AuditTrail(props) {
  return (
    <Card
      className={styles.AuditTrail}
      sx={{
        m: 2,
        backgroundColor: "#292828", // overwrite material theme cardheader color for dark cards
        color: "#b1b1b3 ",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardHeader
        avatar={<HistoryIcon fontSize="small" />}
        title="AuditTrail™"
        sx={{ backgroundColor: "#272728" }}
      ></CardHeader>

      <CardContent>
        {props.logs.length === 0 && (
          <Notice className={styles.NoLogs}>
            When this file is saved or published you will be able to see logs of
            when and by whom.
          </Notice>
        )}

        <ul>
          {props.logs.map((log) => (
            <li key={log.ZUID} className={styles.Log}>
              {`${moment(log.createdAt).format("YYYY-MM-DD")} ${
                log.firstName
              } ${log.lastName}`}
              {log.firstName === "Unknown" && log.lastName === "User"
                ? `(${log.actionByUserZUID})`
                : null}
              {`: ${log.meta.message}`}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardActions sx={{ marginTop: "auto" }}>
        <AppLink className={styles.MoreLogs} to={`/reports/audit-trail`}>
          <FontAwesomeIcon icon={faLink} /> View all logs
        </AppLink>
      </CardActions>
    </Card>
  );
}
