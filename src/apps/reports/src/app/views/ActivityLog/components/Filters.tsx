import { useMemo, FC, useEffect, useState } from "react";
import { Box, FormControl, Skeleton } from "@mui/material";
import moment from "moment";
import { uniqBy, isEqual } from "lodash";
import { useLocation } from "react-router-dom";
import { useParams } from "../../../../../../../shell/hooks/useParams";
import { accountsApi } from "../../../../../../../shell/services/accounts";
import { Audit } from "../../../../../../../shell/services/types";
import {
  DateRangeFilter,
  DateRangeFilterValue,
  UserFilter,
  GenericFilter,
} from "../../../../../../../shell/components/Filters";

const RESOURCE_TYPES = [
  {
    text: "Code",
    value: "code",
  },
  {
    text: "Content",
    value: "content",
  },
  {
    text: "Schema",
    value: "schema",
  },
  {
    text: "Settings",
    value: "settings",
  },
];
const HAPPENED_AT = [
  {
    text: "Most Recent",
    value: "",
  },
  {
    text: "Oldest First",
    value: "happenedAt",
  },
];
const USER_ACTIVITY = [
  {
    text: "Most Active",
    value: "",
  },
  {
    text: "Most Recently Active",
    value: "happenedAt",
  },
  {
    text: "Least Active",
    value: "leastActive",
  },
];
const ACTION = [
  {
    text: "Created",
    value: "1",
  },
  {
    text: "Modified",
    value: "2",
  },
  {
    text: "Deleted",
    value: "3",
  },
  {
    text: "Published",
    value: "4",
  },
  {
    text: "Unpublished",
    value: "5",
  },
  {
    text: "Scheduled",
    value: "6",
  },
];

type Filter =
  | "happenedAt"
  | "sortByUsers"
  | "resourceType"
  | "actionByUserZUID"
  | "action"
  | "userRole";
interface FiltersProps {
  showSkeletons: boolean;
  filters: Filter[];
  actions: Audit[];
}
export const Filters: FC<FiltersProps> = ({
  actions,
  filters,
  showSkeletons,
}) => {
  const [params, setParams] = useParams();
  const location = useLocation();
  const { data: usersRoles } = accountsApi.useGetUsersRolesQuery();
  const [defaultDateRange, setDefaultDateRange] =
    useState<DateRangeFilterValue>({ from: null, to: null });

  const uniqueUserActions = useMemo(() => {
    const uniqueUsers = uniqBy(actions, "actionByUserZUID");

    return uniqueUsers?.map((user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      ZUID: user.actionByUserZUID,
      email: user.email,
    }));
  }, [actions]);

  const uniqueUsersRoles = useMemo(() => {
    if (usersRoles?.length) {
      const uniqueRoles = uniqBy(usersRoles, "role.ZUID");

      return uniqueRoles?.map((role) => ({
        text: role.role.name,
        value: role.role.name,
      }));
    }
  }, [usersRoles]);

  const dateRange: DateRangeFilterValue = useMemo(() => {
    if (Boolean(params.get("from")) && Boolean(params.get("to"))) {
      const currentDateRange = {
        from: moment(params.get("from")).format("YYYY-MM-DD"),
        to: moment(params.get("to")).format("YYYY-MM-DD"),
      };

      if (
        location?.pathname.includes("schema") &&
        isEqual(currentDateRange, defaultDateRange)
      ) {
        // Don't show the date on the date range filter if it's the same with the default date
        return { from: null, to: null };
      }

      return currentDateRange;
    }

    return { from: null, to: null };
  }, [params, defaultDateRange]);

  useEffect(() => {
    // Store a copy of the default date range which will be used to reset the date range
    if (
      Boolean(params.get("from")) &&
      Boolean(params.get("to")) &&
      !defaultDateRange.from &&
      !defaultDateRange.to
    ) {
      setDefaultDateRange({
        from: moment(params.get("from")).format("YYYY-MM-DD"),
        to: moment(params.get("to")).format("YYYY-MM-DD"),
      });
    }
  }, [params]);

  const getFilter = (filter: Filter) => {
    switch (filter) {
      case "happenedAt":
        return (
          <GenericFilter
            filterId="sortBy"
            options={HAPPENED_AT}
            value={params.get("sortBy") || ""}
            onChange={(happenedAt) =>
              setParams(happenedAt?.toString(), "sortBy")
            }
            defaultButtonText="Most Recent"
          />
        );
      case "sortByUsers":
        return (
          <GenericFilter
            defaultButtonText="Most Active"
            value={params.get("sortByUsers") || ""}
            onChange={(userActivity) =>
              setParams(userActivity.toString(), "sortByUsers")
            }
            options={USER_ACTIVITY}
          />
        );
      case "resourceType":
        return (
          <GenericFilter
            defaultButtonText="Resource Type"
            value={params.get("resourceType") || ""}
            options={RESOURCE_TYPES}
            onChange={(resourceType) =>
              setParams(resourceType?.toString(), "resourceType")
            }
            filterId="resourceType"
          />
        );
      case "actionByUserZUID":
        return (
          <UserFilter
            value={params.get("actionByUserZUID") || ""}
            onChange={(userZUID) => setParams(userZUID, "actionByUserZUID")}
            options={uniqueUserActions}
            defaultButtonText="People"
          />
        );
      case "action":
        return (
          <GenericFilter
            defaultButtonText="Action Type"
            value={params.get("action") || ""}
            options={ACTION}
            onChange={(action) => setParams(action.toString(), "action")}
            filterId="action"
          />
        );
      case "userRole":
        return (
          <GenericFilter
            defaultButtonText="User Role"
            value={params.get("userRole") || ""}
            onChange={(role) => setParams(role.toString(), "userRole")}
            options={uniqueUsersRoles}
          />
        );
      default:
        break;
    }
  };

  const handleDateRangeFilterChanged = (range: DateRangeFilterValue) => {
    if (!range.to && !range.from) {
      // Reset the date range filter to the default value when user input date range is cleared
      setParams(
        moment(defaultDateRange.from).isValid() ? defaultDateRange.from : "",
        "from"
      );
      setParams(
        moment(defaultDateRange.to).isValid() ? defaultDateRange.to : "",
        "to"
      );
    } else {
      setParams(range.from, "from");
      setParams(range.to, "to");
    }
  };

  return (
    <Box
      data-cy="filters"
      sx={{
        display: "flex",
        gap: 1.5,
        my: 1.5,
      }}
    >
      {filters.map((filter, idx) =>
        showSkeletons ? (
          <Skeleton key={idx} variant="rectangular" width={172} height={56} />
        ) : (
          <Box key={idx}>{getFilter(filter)}</Box>
        )
      )}

      {showSkeletons ? (
        <Skeleton variant="rectangular" width={250} height={56} />
      ) : (
        <DateRangeFilter
          value={dateRange}
          onChange={handleDateRangeFilterChanged}
          inactiveButtonText="Date"
          headerTitle="Select Date Range"
        />
      )}
    </Box>
  );
};
