import { Moment } from "moment-timezone";
import { useGetAnalyticsPropertyDataByQueryQuery } from "../../../../../../../../../shell/services/cloudFunctions";
import { findTopDimensions, generateDateRangesForReport } from "../../../utils";
import { ItemsTableContent } from "./ItemsTable";

type Props = {
  propertyId: string;
  startDate: Moment;
  endDate: Moment;
};

export const MostPopularWrapper = ({
  propertyId,
  startDate,
  endDate,
}: Props) => {
  const { data: pathsData, isFetching } =
    useGetAnalyticsPropertyDataByQueryQuery(
      {
        property: propertyId,
        requests: [
          {
            dimensions: [
              {
                name: "pagePath",
              },
            ],
            metrics: [
              {
                name: "screenPageViews",
              },
            ],
            dateRanges: generateDateRangesForReport(startDate, endDate),
            limit: "10",
            orderBys: [
              {
                metric: {
                  metricName: "screenPageViews",
                },
                desc: true,
              },
            ],
          },
        ],
      },
      {
        skip: !propertyId,
      }
    );
  const paths =
    findTopDimensions(pathsData?.reports?.[0]?.rows, ["date_range_0"], 10)?.map(
      (row, index) => row[0].value
    ) || [];

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
