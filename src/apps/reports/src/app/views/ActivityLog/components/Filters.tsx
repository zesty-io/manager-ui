import { useMemo, FC, useEffect, useState } from "react";
import { Box, FormControl, Skeleton } from "@mui/material";
import { uniqBy, isEqual } from "lodash";
import { useLocation } from "react-router-dom";
import { parse, format, isValid } from "date-fns";
import { useTranslation } from "react-i18next";

import { useParams } from "../../../../../../../shell/hooks/useParams";
import { accountsApi } from "../../../../../../../shell/services/accounts";
import { Audit } from "../../../../../../../shell/services/types";
import {
  DateRangeFilter,
  DateRangeFilterValue,
  UserFilter,
  GenericFilter,
} from "../../../../../../../shell/components/Filters";

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

const stripToYMD = (s?: string | null) => (s ? String(s).slice(0, 10) : null);

const parseYMD = (s?: string | null) => {
  const ymd = stripToYMD(s);
  return ymd ? parse(ymd, "yyyy-MM-dd", new Date()) : null;
};

const fmtYMD = (s?: string | null): string | null => {
  const d = parseYMD(s);
  return d && isValid(d) ? format(d, "yyyy-MM-dd") : null;
};
export const Filters: FC<FiltersProps> = ({
  actions,
  filters,
  showSkeletons,
}) => {
  const { t } = useTranslation();
  const [params, setParams] = useParams();
  const location = useLocation();
  const { data: usersRoles } = accountsApi.useGetUsersRolesQuery();

  const [defaultDateRange, setDefaultDateRange] =
    useState<DateRangeFilterValue>({
      from: null,
      to: null,
    });

  const RESOURCE_TYPES = [
    { text: t("reports.blockVariants"), value: "block" },
    { text: t("reports.codeFilesAndSnippets"), value: "code" },
    { text: t("common.contentItems"), value: "content" },
    { text: t("common.models"), value: "schema" },
    { text: t("reports.settings"), value: "settings" },
  ];

  const HAPPENED_AT = [
    { text: t("reports.mostRecent"), value: "" },
    { text: t("reports.oldestFirst"), value: "happenedAt" },
  ];

  const USER_ACTIVITY = [
    { text: t("reports.mostActive"), value: "" },
    { text: t("reports.mostRecentlyActive"), value: "happenedAt" },
    { text: t("reports.leastActive"), value: "leastActive" },
  ];

  const ACTION = [
    { text: t("reports.created"), value: "1" },
    { text: t("reports.modified"), value: "2" },
    { text: t("reports.deleted"), value: "3" },
    { text: t("reports.published"), value: "4" },
    { text: t("reports.unpublished"), value: "5" },
    { text: t("reports.scheduled"), value: "6" },
  ];

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
        from: fmtYMD(params.get("from")),
        to: fmtYMD(params.get("to")),
      };

      if (
        location?.pathname.includes("schema") &&
        isEqual(currentDateRange, defaultDateRange)
      ) {
        // Hide the date on the filter if it's the same as the default date
        return { from: null, to: null };
      }

      return currentDateRange;
    }

    return { from: null, to: null };
  }, [params, defaultDateRange, location?.pathname]);

  useEffect(() => {
    // Store a copy of the default date range (used to reset when cleared)
    if (
      Boolean(params.get("from")) &&
      Boolean(params.get("to")) &&
      !defaultDateRange.from &&
      !defaultDateRange.to
    ) {
      setDefaultDateRange({
        from: fmtYMD(params.get("from")),
        to: fmtYMD(params.get("to")),
      });
    }
  }, [params, defaultDateRange.from, defaultDateRange.to]);

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
            defaultButtonText={t("reports.mostRecent")}
            isSort
          />
        );
      case "sortByUsers":
        return (
          <GenericFilter
            defaultButtonText={t("reports.mostActive")}
            value={params.get("sortByUsers") || ""}
            onChange={(userActivity) =>
              setParams(userActivity.toString(), "sortByUsers")
            }
            options={USER_ACTIVITY}
            isSort
          />
        );
      case "resourceType":
        return (
          <GenericFilter
            defaultButtonText={t("shell.resourceType")}
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
            defaultButtonText={t("common.users")}
          />
        );
      case "action":
        return (
          <GenericFilter
            defaultButtonText={t("reports.actionType")}
            value={params.get("action") || ""}
            options={ACTION}
            onChange={(action) => setParams(action.toString(), "action")}
            filterId="action"
          />
        );
      case "userRole":
        return (
          <GenericFilter
            defaultButtonText={t("reports.userRole")}
            value={params.get("userRole") || ""}
            onChange={(role) => setParams(role.toString(), "userRole")}
            options={uniqueUsersRoles}
          />
        );
      default:
        return null;
    }
  };

  const handleDateRangeFilterChanged = (range: DateRangeFilterValue) => {
    if (!range.to && !range.from) {
      // Reset to default date range when cleared
      const defFrom = fmtYMD(defaultDateRange.from);
      const defTo = fmtYMD(defaultDateRange.to);

      setParams(defFrom ?? "", "from");
      setParams(defTo ?? "", "to");
    } else {
      setParams(range.from as any, "from");
      setParams(range.to as any, "to");
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
          inactiveButtonText={t("reports.date")}
          headerTitle={t("reports.selectDateRange")}
        />
      )}
    </Box>
  );
};
