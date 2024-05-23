import { Box, Menu, MenuItem, Button } from "@mui/material";
import {
  DateFilter,
  DateRangeFilterValue,
  FilterButton,
} from "../../../../../../shell/components/Filters";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "../../../../../../shell/hooks/useParams";
import { DateFilterValue } from "../../../../../../shell/components/Filters/DateFilter";
import { ArrowDropDownOutlined } from "@mui/icons-material";
import { useGetLangsQuery } from "../../../../../../shell/services/instance";

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

const getCountryCode = (langCode: string) => {
  if (!langCode) return "";
  const splitTag = langCode.split("-");
  const countryCode =
    splitTag.length === 2 ? splitTag[1] : langCode.toUpperCase();
  return countryCode;
};

const getFlagEmojiFromIETFTag = (langCode: string) => {
  if (!langCode) {
    return "";
  }
  const countryCode = getCountryCode(langCode);

  // Convert country code to flag emoji.
  // Unicode flag emojis are made up of regional indicator symbols, which are a sequence of two letters.
  const baseOffset = 0x1f1e6;
  return (
    String.fromCodePoint(baseOffset + (countryCode.charCodeAt(0) - 65)) +
    String.fromCodePoint(baseOffset + (countryCode.charCodeAt(1) - 65))
  );
};

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

  const { data: languages } = useGetLangsQuery({});

  const activeLanguageCode = params.get("language");

  useEffect(() => {
    // if languages and no language param, set the first language as the active language
    if (languages && !activeLanguageCode) {
      setParams(languages[0].code, "language");
    }
  }, [languages, activeLanguageCode]);

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
      <Button
        sx={{
          bgcolor: "common.white",
          height: "28px",
          minWidth: "unset",
          " .MuiButton-endIcon": {
            marginLeft: "4px",
          },
        }}
        size="small"
        variant="outlined"
        color="inherit"
        endIcon={<ArrowDropDownOutlined />}
        onClick={(e) =>
          setAnchorEl({
            currentTarget: e.currentTarget,
            id: "language",
          })
        }
      >
        <Box component="span" color="text.primary">
          {getFlagEmojiFromIETFTag(activeLanguageCode)}
        </Box>{" "}
        {activeLanguageCode?.split("-")[0]?.toUpperCase()} (
        {getCountryCode(activeLanguageCode)})
      </Button>
      <Menu
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: -10,
          horizontal: "right",
        }}
        anchorEl={anchorEl?.currentTarget}
        open={!!anchorEl?.currentTarget && anchorEl.id === "language"}
        PaperProps={{
          sx: {
            boxShadow: (theme) => theme.shadows[8],
            width: "280px",
          },
        }}
      >
        {languages?.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => {
              setAnchorEl(null);
              setParams(language.code, "language");
            }}
          >
            {getFlagEmojiFromIETFTag(language.code)}{" "}
            {language.code.split("-")[0]?.toUpperCase()} (
            {getCountryCode(language.code)})
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
