import moment, { Moment } from "moment-timezone";
import {
  useGetAuditsQuery,
  useGetContentItemsQuery,
} from "../../../../../../../../../shell/services/instance";
import { uniqBy } from "lodash";
import { ContentItem } from "../../../../../../../../../shell/services/types";
import { ItemsTableContent } from "./ItemsTable";

type Props = {
  propertyId: string;
  startDate: Moment;
  endDate: Moment;
};

export const RecentEditsWrapper = ({
  propertyId,
  startDate,
  endDate,
}: Props) => {
  const { data: auditData } = useGetAuditsQuery({
    start_date: moment().utc().subtract(1, "month").format("YYYY-MM-DD"),
    end_date: moment().utc().format("YYYY-MM-DD"),
  });

  const itemEdits = auditData?.filter(
    (item: any) => item.action === 2 && item.resourceType === "content"
  );

  const itemZUIDs = uniqBy(itemEdits, "affectedZUID")
    ?.slice(0, 20)
    ?.map((item: any) => item.affectedZUID);

  const {
    data: items,
    isFetching,
    isUninitialized,
  } = useGetContentItemsQuery(itemZUIDs, {
    skip: !itemZUIDs?.length,
  });

  const sortedPaths = itemZUIDs
    ?.map(
      (itemZUID) =>
        items?.success?.find(
          (item: ContentItem) => itemZUID === item?.meta?.ZUID
        )?.web?.path
    )
    ?.filter((i) => i);

  return (
    <ItemsTableContent
      propertyId={propertyId}
      startDate={startDate}
      endDate={endDate}
      paths={sortedPaths}
      showSkeleton={isFetching || isUninitialized}
      isRecentEdits
    />
  );
};
