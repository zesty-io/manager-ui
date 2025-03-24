import moment from "moment";
import HistoryIcon from "@mui/icons-material/History";
import { Alert } from "@mui/lab";
import { List } from "@mui/material";
import { FileCard, FileCardListItem } from "./FileCard";

export type LogEntry = {
  ZUID: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  actionByUserZUID: string;
  meta: {
    message: string;
  };
  affectedZUID?: string;
};

export type AuditTrailProps = {
  logs: LogEntry[] | null;
};

export default function AuditTrail({ logs }: AuditTrailProps) {
  return (
    <FileCard
      title="Activity Log"
      icon={HistoryIcon}
      link={`/reports/activity-log/resources/${logs?.[0]?.affectedZUID}`}
      linkLabel="View all logs"
    >
      {logs === null && <Alert>Unable to load activity log</Alert>}
      {logs && logs.length === 0 && (
        <Alert variant="standard" severity="warning">
          When this file is saved or published you will be able to see logs of
          when and by whom.
        </Alert>
      )}
      <List dense>
        {logs?.map((log) => (
          <FileCardListItem key={log.ZUID}>
            {`${moment(log.createdAt).format("YYYY-MM-DD")} ${log.firstName} ${
              log.lastName
            }`}
            {log.firstName === "Unknown" && log.lastName === "User"
              ? `(${log.actionByUserZUID})`
              : null}
            {`: ${log.meta.message}`}
          </FileCardListItem>
        ))}
      </List>
    </FileCard>
  );
}
