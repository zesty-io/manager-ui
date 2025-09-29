import { format as fmt } from "date-fns";
import { useGetAnalyticsPagePathsByFilterQuery } from "../../../../../../../../../shell/services/analytics";
import { ItemsTableContent } from "./ItemsTable";

type Props = {
  propertyId: string;
  startDate: Date;
  endDate: Date;
};

export const GainersLosersWrapper = ({
  propertyId,
  startDate,
  endDate,
  isLosers,
}: Props & { isLosers: boolean }) => {
  const pid = propertyId?.split("/")?.pop();
  const startStr = startDate ? fmt(startDate, "yyyy-MM-dd") : "";
  const endStr = endDate ? fmt(endDate, "yyyy-MM-dd") : "";

  const { data: paths, isFetching } = useGetAnalyticsPagePathsByFilterQuery(
    {
      filter: isLosers ? "loser" : "gainer",
      propertyId: pid,
      startDate: startStr,
      endDate: endStr,
      limit: 10,
      order: isLosers ? "asc" : "desc",
    },
    { skip: !pid || !startStr || !endStr }
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
