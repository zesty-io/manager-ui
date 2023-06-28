import { useEffect, useMemo } from "react";
import { DateFilterValue } from "../../../../../../../shell/components/Filters/DateFilter";
import { useParams as useQueryParams } from "../../../../../../../shell/hooks/useParams";
import {
  DateFilter,
  DateRangeFilterValue,
} from "../../../../../../../shell/components/Filters";
import { Skeleton } from "@mui/lab";

type Props = {
  showSkeleton: boolean;
};

export const AnalyticsDateFilter = ({ showSkeleton }: Props) => {
  const [params, setParams] = useQueryParams();
  const activeDateFilter: DateFilterValue = useMemo(() => {
    const isPreset = Boolean(params.get("datePreset"));
    const isDateRange =
      Boolean(params.get("to")) &&
      Boolean(params.get("from")) &&
      params.get("to") !== params.get("from");

    if (isPreset) {
      return {
        type: "preset",
        value: params.get("datePreset"),
      };
    }

    if (isDateRange) {
      return {
        type: "daterange",
        value: {
          from: params.get("from"),
          to: params.get("to"),
        },
      };
    }

    return {
      type: "",
      value: "",
    };
  }, [params]);

  const handleDateFilterChanged = (dateFilter: DateFilterValue) => {
    switch (dateFilter.type) {
      case "daterange": {
        const value = dateFilter.value as DateRangeFilterValue;

        setParams(value.to, "to");
        setParams(value.from, "from");
        setParams(null, "datePreset");
        return;
      }
      case "preset": {
        const value = dateFilter.value as string;

        setParams(value, "datePreset");
        setParams(null, "to");
        setParams(null, "from");
        return;
      }

      default: {
        setParams(null, "to");
        setParams(null, "from");
        setParams(null, "datePreset");
        return;
      }
    }
  };

  useEffect(() => {
    if (!params.get("datePreset") && !params.get("from") && !params.get("to")) {
      handleDateFilterChanged({ type: "preset", value: "last_14_days" });
    }
  }, []);

  if (showSkeleton) {
    return <Skeleton variant="rectangular" width="137px" height="28px" />;
  }

  return (
    <DateFilter
      clearable={false}
      value={activeDateFilter}
      onChange={handleDateFilterChanged}
      hideCustomDates
      withDateRange
      extraPresets={[
        {
          text: "This Week (Sun - Today)",
          value: "this_week",
        },
        {
          text: "This Year (Jan - Today)",
          value: "this_year",
        },
        {
          text: "Quarter to Date",
          value: "quarter_to_date",
        },
      ]}
    />
  );
};
