import { Box, Menu, MenuItem } from "@mui/material";
import {
  DateFilter,
  DateRangeFilterValue,
  FilterButton,
} from "../../../../../../shell/components/Filters";
import { useMemo, useState } from "react";
import { useParams } from "../../../../../../shell/hooks/useParams";
import { DateFilterValue } from "../../../../../../shell/components/Filters/DateFilter";

const SORT_ORDER = {
  dateSaved: "Date Saved",
  datePublished: "Date Published",
  dateCreated: "Date Created",
  status: "Status",
} as const;

const STATUS_FILTER = {
  published: "Published",
  scheduled: "Scheduled",
  notPublished: "Not Published",
} as const;

export const ItemListFilters = () => {
  const [anchorEl, setAnchorEl] = useState({
    currentTarget: null,
    id: "",
  });
  const [params, setParams] = useParams();

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

  return (
    <Box display="flex" gap={1.5} py={2}>
      <FilterButton
        isFilterActive={false}
        buttonText={`Sort: ${
          SORT_ORDER[params.get("sort") as keyof typeof SORT_ORDER] ??
          SORT_ORDER.dateSaved
        }`}
        onOpenMenu={(event: React.MouseEvent<HTMLButtonElement>) => {
          setAnchorEl({
            currentTarget: event.currentTarget,
            id: "sort",
          });
        }}
        onRemoveFilter={() => {}}
      />
      <Menu
        open={!!anchorEl?.currentTarget && anchorEl.id === "sort"}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl?.currentTarget}
      >
        {Object.entries(SORT_ORDER).map(([key, value]) => (
          <MenuItem
            onClick={() => {
              setParams(key, "sort");
              setAnchorEl({
                currentTarget: null,
                id: "",
              });
            }}
            selected={
              key === "dateSaved"
                ? !params.get("sort") || params.get("sort") === key
                : params.get("sort") === key
            }
          >
            {value}
          </MenuItem>
        ))}
      </Menu>
      <FilterButton
        isFilterActive={!!params.get("statusFilter")}
        buttonText={
          params.get("statusFilter")
            ? STATUS_FILTER[
                params.get("statusFilter") as keyof typeof STATUS_FILTER
              ]
            : "Status"
        }
        onOpenMenu={(event: React.MouseEvent<HTMLButtonElement>) => {
          setAnchorEl({
            currentTarget: event.currentTarget,
            id: "statusFilter",
          });
        }}
        onRemoveFilter={() => {
          setParams(null, "statusFilter");
        }}
      />
      <Menu
        open={!!anchorEl?.currentTarget && anchorEl.id === "statusFilter"}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl?.currentTarget}
      >
        {Object.entries(STATUS_FILTER).map(([key, value]) => (
          <MenuItem
            onClick={() => {
              setParams(key, "statusFilter");
              setAnchorEl({
                currentTarget: null,
                id: "",
              });
            }}
            selected={params.get("statusFilter") === key}
          >
            {value}
          </MenuItem>
        ))}
      </Menu>
      <DateFilter
        withDateRange
        defaultButtonText="Date Saved"
        onChange={(value) => handleDateFilterChanged(value)}
        value={activeDateFilter}
      />
    </Box>
  );
};
