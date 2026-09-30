import { useMemo, FC, CSSProperties } from "react";
import { List, type RowComponentProps } from "react-window";
import { Typography, Skeleton, Box } from "@mui/material";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import { formatLocalized } from "shell/i18n/dates";
import { format, subDays } from "date-fns";
import { useTranslation } from "react-i18next";

import { ActionTimelineItem } from "./ActionTimelineItem";
import { TimelineItem } from "./ActionTimelineItem/TimelineItem";
import { Audit } from "../../../../../../../shell/services/types";

const skeletonDataset = ["-", {}, {}, {}, "-", {}, {}, {}];

type ActionsWithHeaders = (string | Audit)[];
interface ListRowProps {
  index: number;
  data: ActionsWithHeaders;
  style: CSSProperties;
}
interface ActionsTimelineProps {
  showSkeletons: boolean;
  actions: Audit[];
}
export const ActionsTimeline: FC<ActionsTimelineProps> = ({
  showSkeletons,
  actions,
}) => {
  const { t } = useTranslation();

  const actionsWithHeaders = useMemo(() => {
    const arr: ActionsWithHeaders = [];
    const seen = new Set<string>();

    actions?.forEach((action) => {
      const d = new Date(action.happenedAt);
      const dateKey = format(d, "yyyy-MM-dd");

      if (!seen.has(dateKey)) {
        arr.push(dateKey);
        seen.add(dateKey);
      }

      arr.push(action);
    });

    return arr;
  }, [actions]);

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const yesterdayKey = format(subDays(new Date(), 1), "yyyy-MM-dd");

  const Row = ({ index, data, style }: any) => {
    const action = data[index];

    if (typeof action === "string") {
      const headerText = showSkeletons
        ? null
        : action === todayKey
        ? t("common.today")
        : action === yesterdayKey
        ? t("common.yesterday")
        : formatLocalized(new Date(action), "MMMM d, yyyy");

      return (
        <Box sx={style}>
          <Typography variant="h5" fontWeight={600}>
            {showSkeletons ? (
              <Skeleton variant="rectangular" width={120} />
            ) : (
              headerText
            )}
          </Typography>
        </Box>
      );
    }

    if (showSkeletons) {
      return (
        <Box sx={style}>
          <TimelineItem
            showSkeletons
            divider
            renderConnector={
              skeletonDataset[index + 1] &&
              typeof skeletonDataset[index + 1] !== "string"
            }
          />
        </Box>
      );
    }

    return (
      <Box sx={style} key={action.ZUID}>
        <ActionTimelineItem
          action={action}
          renderConnector={
            actionsWithHeaders[index + 1] &&
            typeof actionsWithHeaders[index + 1] !== "string"
          }
        />
      </Box>
    );
  };

  return (
    <Box data-cy="resource_list" flex={1}>
      <List
        rowCount={showSkeletons ? 10 : actionsWithHeaders.length}
        rowHeight={79}
        rowProps={{
          data: showSkeletons ? skeletonDataset : actionsWithHeaders,
        }}
        rowComponent={Row}
      />
    </Box>
  );
};
