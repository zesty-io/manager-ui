import { useState, useMemo } from "react";
import {
  Stack,
  Menu,
  MenuItem,
  MenuList,
  Typography,
  ListItemText,
  Box,
} from "@mui/material";
import { ChevronRightOutlined } from "@mui/icons-material";

import { FilterButton, UserFilter } from "../../Filters";
import { CascadingMenuItem } from "../../CascadingMenuItem";
import {
  useGetContentModelFieldsQuery,
  useGetLangsQuery,
} from "../../../services/instance";
import { useGetUsersQuery } from "../../../services/accounts";
import { DateFilterValue, DateFilter } from "../../Filters/DateFilter";
import { FieldFilters } from "./index";

const SORT_ORDER = {
  lastSaved: "Last Saved",
  lastPublished: "Last Published",
  createdOn: "Date Created",
  version: "Status",
} as const;

export const STATUS_FILTER = {
  published: "Published",
  scheduled: "Scheduled",
  notPublished: "Not Published",
} as const;

const FILTERABLE_DATA_TYPES = [
  "text",
  "wysiwyg_basic",
  "wysiwyg_advanced",
  "article_writer",
  "markdown",
  "textarea",
  "number",
  "images",
  "date",
  "datetime",
  "one_to_many",
  "one_to_one",
  "uuid",
  "number",
  "currency",
  "date",
  "datetime",
  "link",
  "internal_link",
  "sort",
] as const;

const getCountryCode = (langCode: string) => {
  if (!langCode) return "";
  const splitTag = langCode.split("-");
  const countryCode =
    splitTag.length === 2 ? splitTag[1] : langCode.toUpperCase();

  return countryCode;
};

type FieldSelectorFiltersProps = {
  modelZUID: string;
  filters: FieldFilters;
  onUpdateFilter: (filter: Partial<FieldFilters>) => void;
};
export const FieldSelectorFilters = ({
  modelZUID,
  filters,
  onUpdateFilter,
}: FieldSelectorFiltersProps) => {
  const [anchorEl, setAnchorEl] = useState({
    currentTarget: null,
    id: "",
  });
  const { data: users } = useGetUsersQuery();
  const { data: fields, isLoading: isFieldsLoading } =
    useGetContentModelFieldsQuery(modelZUID);
  const { data: langs } = useGetLangsQuery({});

  const userOptions = useMemo(() => {
    return users?.map((user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      ZUID: user.ZUID,
      email: user.email,
    }));
  }, [users]);

  const selectedLang = useMemo(() => {
    return langs?.find((lang) => lang.ID === filters.lang);
  }, [langs, filters.lang]);

  const handleUpdateSortOrder = (sortOrder: string) => {
    setAnchorEl({
      currentTarget: null,
      id: "",
    });

    // onUpdateSortOrder(sortOrder);
    onUpdateFilter({ sortOrder });
  };

  const getButtonText = (sortOrder: string) => {
    if (!sortOrder) {
      return SORT_ORDER.lastSaved;
    }

    if (sortOrder === "createdBy") {
      return "Created By";
    }

    if (sortOrder === "zuid") {
      return "ZUID";
    }

    if (SORT_ORDER.hasOwnProperty(sortOrder)) {
      return SORT_ORDER[sortOrder as keyof typeof SORT_ORDER];
    }

    const fieldLabel = fields?.find((field) => field.name === sortOrder)?.label;
    return fieldLabel;
  };

  return (
    <Stack direction="row" gap={1.5}>
      <FilterButton
        filterId="sortByFilter"
        isFilterActive={false}
        buttonText={`Sort: ${getButtonText(filters.sortOrder)}`}
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
        transformOrigin={{
          vertical: -8,
          horizontal: "left",
        }}
        // add set width to the menu
        PaperProps={{
          sx: {
            width: "240px",
            maxHeight: "420px",
          },
        }}
      >
        {Object.entries(SORT_ORDER).map(([key, value]) => (
          <MenuItem
            key={key}
            data-cy={`${key}FilterOption`}
            onClick={() => handleUpdateSortOrder(key)}
            selected={
              key === "lastSaved"
                ? !filters.sortOrder || filters.sortOrder === "lastSaved"
                : filters.sortOrder === key
            }
          >
            {value}
          </MenuItem>
        ))}
        <CascadingMenuItem
          MenuItemComponent={
            <>
              <ListItemText>More</ListItemText>
              <ChevronRightOutlined color="action" />
            </>
          }
          PaperProps={{
            sx: {
              width: 240,
            },
          }}
        >
          <MenuList>
            <MenuItem
              selected={filters.sortOrder === "createdBy"}
              onClick={() => handleUpdateSortOrder("createdBy")}
            >
              Created By
            </MenuItem>
            <MenuItem
              selected={filters.sortOrder === "zuid"}
              onClick={() => handleUpdateSortOrder("zuid")}
            >
              ZUID
            </MenuItem>
          </MenuList>
        </CascadingMenuItem>
        <Typography
          variant="body3"
          color="text.secondary"
          fontWeight={600}
          sx={{
            display: "block",
            pt: 1,
            pl: 2,
            borderTop: (theme) => `1px solid ${theme.palette.border}`,
          }}
        >
          FIELDS
        </Typography>
        {fields
          ?.filter((field) =>
            FILTERABLE_DATA_TYPES.includes(field.datatype as any)
          )
          ?.map((field) => (
            <MenuItem
              key={field.ZUID}
              onClick={() => handleUpdateSortOrder(field.name)}
              selected={filters.sortOrder === field.name}
            >
              <Typography variant="inherit" noWrap>
                {field.label}
              </Typography>
            </MenuItem>
          ))}
      </Menu>
      <FilterButton
        filterId="statusFilter"
        isFilterActive={!!filters.status}
        buttonText={STATUS_FILTER[filters.status] || "Status"}
        onOpenMenu={(event: React.MouseEvent<HTMLButtonElement>) => {
          setAnchorEl({
            currentTarget: event.currentTarget,
            id: "statusFilter",
          });
        }}
        onRemoveFilter={() => {
          onUpdateFilter({ status: null });
          // onUpdateStatusFilter(null);
        }}
      />
      <Menu
        open={!!anchorEl?.currentTarget && anchorEl.id === "statusFilter"}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl?.currentTarget}
        transformOrigin={{
          vertical: -8,
          horizontal: "left",
        }}
      >
        {Object.entries(STATUS_FILTER).map(([key, value]) => (
          <MenuItem
            key={key}
            data-cy={`${key}FilterOption`}
            onClick={() => {
              // onUpdateStatusFilter(key as keyof typeof STATUS_FILTER);
              onUpdateFilter({ status: key as keyof typeof STATUS_FILTER });
              setAnchorEl({
                currentTarget: null,
                id: "",
              });
            }}
            selected={filters.status === key}
          >
            {value}
          </MenuItem>
        ))}
      </Menu>
      <UserFilter
        value={filters.user || ""}
        onChange={(user) => onUpdateFilter({ user })}
        defaultButtonText="Created By"
        options={userOptions}
      />
      <DateFilter
        withDateRange
        defaultButtonText="Date Saved"
        onChange={(date) => onUpdateFilter({ date })}
        value={filters.date}
      />
      <FilterButton
        filterId="langFilter"
        isFilterActive={false}
        buttonText={
          !!selectedLang ? (
            <>
              <Box
                component="img"
                pr={0.5}
                height={12}
                src={`/images/flags/${getCountryCode(
                  selectedLang.code
                )?.toLowerCase()}.svg`}
                loading="lazy"
                alt={`${getCountryCode(selectedLang.code)?.toLowerCase()} flag`}
              />
              {selectedLang?.code.split("-")?.[0]?.toUpperCase()} (
              {getCountryCode(selectedLang.code)})
            </>
          ) : (
            ""
          )
        }
        onOpenMenu={(event: React.MouseEvent<HTMLButtonElement>) => {
          setAnchorEl({
            currentTarget: event.currentTarget,
            id: "lang",
          });
        }}
        onRemoveFilter={() => {}}
      />
      <Menu
        onClose={() => setAnchorEl(null)}
        transformOrigin={{
          vertical: -8,
          horizontal: "left",
        }}
        anchorEl={anchorEl?.currentTarget}
        open={!!anchorEl?.currentTarget && anchorEl.id === "lang"}
      >
        {langs?.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => {
              setAnchorEl({
                currentTarget: null,
                id: "",
              });
              // onUpdateLangFilter(lang.ID);
              onUpdateFilter({ lang: lang.ID });
            }}
          >
            <Box
              component="img"
              pr={0.5}
              height={14}
              src={`/images/flags/${getCountryCode(
                lang.code
              )?.toLowerCase()}.svg`}
              loading="lazy"
              alt={`${getCountryCode(lang.code)?.toLowerCase()} flag`}
            />
            {lang.code?.split("-")?.[0]?.toUpperCase()} (
            {getCountryCode(lang.code)})
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
};
