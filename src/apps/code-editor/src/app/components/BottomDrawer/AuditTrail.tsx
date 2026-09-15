import HistoryIcon from "@mui/icons-material/History";
import { Alert, List } from "@mui/material";
import { FileCard, FileCardListItem } from "./FileCard";
import { format, isValid } from "date-fns";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <FileCard
      title={t("shell.roleAccessActivityLog")}
      icon={HistoryIcon}
      link={`/reports/activity-log/resources/${logs?.[0]?.affectedZUID}`}
      linkLabel={t("shell.viewAllLogs")}
    >
      {logs === null && <Alert>{t("code.auditTrailLoadError")}</Alert>}
      {logs && logs.length === 0 && (
        <Alert variant="standard" severity="warning">
          {t("code.auditTrailEmptyHint")}
        </Alert>
      )}
      <List dense>
        {logs?.map((log) => {
          const d = new Date(log.createdAt);
          const dateStr = isValid(d) ? format(d, "yyyy-MM-dd") : log.createdAt;
          return (
            <FileCardListItem key={log.ZUID}>
              {`${dateStr} ${log.firstName} ${log.lastName}`}
              {log.firstName === "Unknown" && log.lastName === "User"
                ? `(${log.actionByUserZUID})`
                : null}
              {`: ${log.meta.message}`}
            </FileCardListItem>
          );
        })}
      </List>
    </FileCard>
  );
}
