import { Moment } from "moment-timezone";
import { useGetAnalyticsPagePathsByFilterQuery } from "../../../../../../../../../shell/services/cloudFunctions";
import { ItemsTableContent } from "./ItemsTable";

type Props = {
  propertyId: string;
  startDate: Moment;
  endDate: Moment;
};

export const GainersLosersWrapper = ({
  propertyId,
  startDate,
  endDate,
  isLosers,
}: Props & { isLosers: boolean }) => {
  const { data: paths, isFetching } = useGetAnalyticsPagePathsByFilterQuery(
    {
      filter: isLosers ? "loser" : "gainer",
      propertyId: propertyId?.split("/")?.pop(),
      startDate: startDate?.format("YYYY-MM-DD"),
      endDate: endDate?.format("YYYY-MM-DD"),
      limit: 10,
      order: isLosers ? "asc" : "desc",
    },
    {
      skip: !propertyId,
    }
  );

  return (
    <ItemsTableContent
      propertyId={propertyId}
      startDate={startDate}
      endDate={endDate}
      paths={paths}
      showSkeleton={isFetching}
    />
  );
};
