import { subMonths } from "date-fns";
import {
  useGetAuditsQuery,
  useGetContentItemsQuery,
} from "../../../../../../../../../shell/services/instance";
import { uniqBy } from "lodash";
import { ContentItem } from "../../../../../../../../../shell/services/types";
import { ItemsTableContent } from "./ItemsTable";

type Props = {
  propertyId: string;
  startDate: Date;
  endDate: Date;
};

export const RecentEditsWrapper = ({
  propertyId,
  startDate,
  endDate,
}: Props) => {
  const end = new Date();
  const endStr = end.toISOString().slice(0, 10);
  const start = subMonths(end, 1);
  const startStr = start.toISOString().slice(0, 10);

  const { data: auditData } = useGetAuditsQuery({
    start_date: startStr,
    end_date: endStr,
  });

  const itemEdits = auditData?.filter(
    (item: any) => item.action === 2 && item.resourceType === "content"
  );

  const itemZUIDs =
    uniqBy(itemEdits, "affectedZUID")
      ?.slice(0, 20)
      ?.map((i: any) => i.affectedZUID) || [];

  const {
    data: items,
    isFetching,
    isUninitialized,
  } = useGetContentItemsQuery(itemZUIDs, {
    skip: !itemZUIDs.length,
  });

  const sortedPaths =
    itemZUIDs
      ?.map(
        (zuid) =>
          items?.success?.find((item: ContentItem) => zuid === item?.meta?.ZUID)
            ?.web?.path
      )
      ?.filter(Boolean) || [];

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
