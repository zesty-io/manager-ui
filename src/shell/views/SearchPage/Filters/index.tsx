import { useMemo } from "react";
import { Stack } from "@mui/material";

import { useParams } from "../../../hooks/useParams";
import { SortByFilter, FilterValues } from "./SortByFilter";
import {
  UserFilter,
  DateFilter,
  DateRangeFilterValue,
} from "../../../components/Filters/";
import { useGetUsersQuery } from "../../../services/accounts";
import { DateFilterValue } from "../../../components/Filters/DateFilter";
import { ResourceTypeFilter } from "./ResourceTypeFilter";
import { ResourceType } from "../../../services/types";

export const Filters = () => {
  const [params, setParams] = useParams();
  const { data: users } = useGetUsersQuery();
  const userOptions = useMemo(() => {
    return users?.map((user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      ZUID: user.ZUID,
      email: user.email,
    }));
  }, [users]);

  const handleDateFilterChanged = (dateFilter: DateFilterValue) => {
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
    const isPreset = Boolean(params.get("datePreset"));
    const isBefore = Boolean(params.get("to")) && !Boolean(params.get("from"));
    const isAfter = Boolean(params.get("from")) && !Boolean(params.get("to"));
    const isOn =
      Boolean(params.get("to")) &&
      Boolean(params.get("from")) &&
      params.get("to") === params.get("from");
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

  return (
    <Stack direction="row" gap={1.5}>
      <SortByFilter
        value={(params.get("sort") as FilterValues) || "modified"}
        onChange={(value) => setParams(value, "sort")}
      />
      <ResourceTypeFilter
        onChange={(value) => setParams(value, "resource")}
        value={(params.get("resource") as ResourceType) || ""}
      />
      <UserFilter
        value={params.get("user") || ""}
        onChange={(value) => setParams(value, "user")}
        defaultButtonText="People"
        options={userOptions}
      />
      <DateFilter
        withDateRange
        defaultButtonText="Date Modified"
        onChange={(value) => handleDateFilterChanged(value)}
        value={activeDateFilter}
      />
    </Stack>
  );
};
