import { useParams } from "./useParams";
import { DateFilterValue } from "../components/Filters/DateFilter";
import { useMemo } from "react";
import { DateRangeFilterValue } from "../components/Filters/DateFilter/types";

type UseDateFilterParams = [
  DateFilterValue,
  (dateFilter: DateFilterValue) => void
];
export const useDateFilterParams: () => UseDateFilterParams = () => {
  const [params, setParams] = useParams();

  const setDateFilter = (dateFilter: DateFilterValue) => {
    switch (dateFilter.type) {
      case "daterange": {
        const value = dateFilter.value as DateRangeFilterValue;

        setParams(value.to, "to");
        setParams(value.from, "from");
        setParams(null, "datePreset");
        return;
      }

      case "on": {
        const value = dateFilter.value as string;

        setParams(value, "to");
        setParams(value, "from");
        setParams(null, "datePreset");
        return;
      }
      case "before": {
        const value = dateFilter.value as string;

        setParams(value, "to");
        setParams(null, "from");
        setParams(null, "datePreset");
        return;
      }
      case "after": {
        const value = dateFilter.value as string;

        setParams(value, "from");
        setParams(null, "to");
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

  const activeDateFilter: DateFilterValue = useMemo(() => {
    const isPreset = !!params.get("datePreset");
    const isBefore = !!params.get("to") && !!!params.get("from");
    const isAfter = !!params.get("from") && !!!params.get("to");
    const isOn =
      !!params.get("to") &&
      !!params.get("from") &&
      params.get("to") === params.get("from");
    const isDateRange =
      !!params.get("to") &&
      !!params.get("from") &&
      params.get("to") !== params.get("from");

    if (isPreset) {
      return {
        type: "preset",
        value: params.get("datePreset"),
      };
    }

    if (isBefore) {
      return {
        type: "before",
        value: params.get("to"),
      };
    }

    if (isAfter) {
      return {
        type: "after",
        value: params.get("from"),
      };
    }

    if (isOn) {
      return {
        type: "on",
        value: params.get("from"),
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

  return [activeDateFilter, setDateFilter];
};
