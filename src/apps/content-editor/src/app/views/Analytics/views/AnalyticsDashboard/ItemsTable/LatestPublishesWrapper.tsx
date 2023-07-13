import { uniqBy } from "lodash";
import {
  useGetAllPublishingsQuery,
  useGetContentItemsQuery,
} from "../../../../../../../../../shell/services/instance";
import { ContentItem } from "../../../../../../../../../shell/services/types";
import { ItemsTableContent } from "./ItemsTable";
import { Moment } from "moment-timezone";

type Props = {
  propertyId: string;
  startDate: Moment;
  endDate: Moment;
};

export const LatestPublishesWrapper = ({
  propertyId,
  startDate,
  endDate,
}: Props) => {
  const { data: publishings } = useGetAllPublishingsQuery();
  const latestUniqueItemPublishings = uniqBy(publishings, "itemZUID")
    ?.slice(0, 20)
    ?.map((publishing) => publishing.itemZUID);

  const {
    data: items,
    isFetching,
    isUninitialized,
  } = useGetContentItemsQuery(latestUniqueItemPublishings, {
    skip: !latestUniqueItemPublishings?.length,
  });

  const sortedPaths = latestUniqueItemPublishings
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
    />
  );
};
