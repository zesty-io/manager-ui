import {
  Box,
  Menu,
  MenuItem,
  Button,
  Typography,
  MenuList,
  ListItemText,
} from "@mui/material";
import {
  DateFilter,
  FilterButton,
  UserFilter,
} from "../../../../../../shell/components/Filters";
import { useEffect, useMemo, useState, useContext } from "react";
import { useParams } from "../../../../../../shell/hooks/useParams";
import {
  ChevronRightOutlined,
  KeyboardArrowDownRounded,
} from "@mui/icons-material";
import {
  useGetContentModelFieldsQuery,
  useGetLangsQuery,
} from "../../../../../../shell/services/instance";
import { useDateFilterParams } from "../../../../../../shell/hooks/useDateFilterParams";
import { useGetUsersQuery } from "../../../../../../shell/services/accounts";
import { useParams as useRouterParams } from "react-router";
import { CascadingMenuItem } from "../../../../../../shell/components/CascadingMenuItem";
import { TableSortContext } from "./TableSortProvider";
import { selectLang } from "../../../../../../shell/store/user";
import { useDispatch } from "react-redux";

const SORT_ORDER = {
  lastSaved: "Last Saved",
  lastPublished: "Last Published",
  createdOn: "Date Created",
  version: "Status",
} as const;

const STATUS_FILTER = {
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
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const [anchorEl, setAnchorEl] = useState({
    currentTarget: null,
    id: "",
  });
  const [params, setParams] = useParams();
  const [activeDateFilter, setActiveDateFilter] = useDateFilterParams();
  const { data: languages } = useGetLangsQuery({});
  const activeLanguageCode = params.get("lang");
  const { data: users } = useGetUsersQuery();
  const { data: fields, isFetching: isFieldsFetching } =
    useGetContentModelFieldsQuery(modelZUID);
  const [sortModel, setSortModel] = useContext(TableSortContext);
  const dispatch = useDispatch();

  const activeSortOrder = sortModel?.[0]?.field;

  const userOptions = useMemo(() => {
    return users?.map((user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      ZUID: user.ZUID,
      email: user.email,
    }));
  }, [users]);

  const handleUpdateSortOrder = (sortType: string) => {
    setAnchorEl({
      currentTarget: null,
      id: "",
    });

    setSortModel([
      {
        field: sortType,
        sort: "desc",
      },
    ]);
  };

  const getButtonText = (activeSortOrder: string) => {
    if (!activeSortOrder) {
      return SORT_ORDER.lastSaved;
    }

    if (activeSortOrder === "createdBy") {
      return "Created By";
    }

    if (activeSortOrder === "zuid") {
      return "ZUID";
    }

    if (SORT_ORDER.hasOwnProperty(activeSortOrder)) {
      return SORT_ORDER[activeSortOrder as keyof typeof SORT_ORDER];
    }

    const fieldLabel = fields?.find(
      (field) => field.name === activeSortOrder
    )?.label;
    return fieldLabel;
  };

  return (
    <Box display="flex" gap={1.5} py={2}>
      <FilterButton
        filterId="sortByFilter"
        isFilterActive={false}
        buttonText={`Sort: ${getButtonText(activeSortOrder)}`}
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
                ? !activeSortOrder || activeSortOrder === "lastSaved"
                : activeSortOrder === key
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
              selected={activeSortOrder === "createdBy"}
              onClick={() => handleUpdateSortOrder("createdBy")}
            >
              Created By
            </MenuItem>
            <MenuItem
              selected={activeSortOrder === "zuid"}
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
              selected={activeSortOrder === field.name}
            >
              <Typography variant="inherit" noWrap>
                {field.label}
              </Typography>
            </MenuItem>
          ))}
      </Menu>
      <FilterButton
        filterId="statusFilter"
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
      <UserFilter
        value={params.get("user") || ""}
        onChange={(value) => setParams(value, "user")}
        defaultButtonText="Created By"
        options={userOptions}
      />
      <DateFilter
        withDateRange
        defaultButtonText="Date Saved"
        onChange={(value) => setActiveDateFilter(value)}
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
        endIcon={<KeyboardArrowDownRounded />}
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
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: -10,
          horizontal: "left",
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
              setParams(language.code, "lang");
              dispatch(selectLang(language.code));
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
