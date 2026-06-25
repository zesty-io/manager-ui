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
import { useMemo, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
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
import { Flag, getCountryCode } from "shell/components/Flag";

// Values are i18next keys (content namespace); translated at render time.
const SORT_ORDER = {
  lastSaved: "content.itemListLastSaved",
  lastPublished: "content.itemListLastPublished",
  createdOn: "content.itemListDateCreated",
  version: "content.itemListStatus",
} as const;

const STATUS_FILTER = {
  published: "content.itemListStatusPublished",
  scheduled: "content.itemListStatusScheduled",
  notPublished: "content.itemListStatusNotPublished",
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

export const ItemListFilters = () => {
  const { t } = useTranslation();
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
    useGetContentModelFieldsQuery({ modelZUID });
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
      return t(SORT_ORDER.lastSaved);
    }

    if (activeSortOrder === "createdBy") {
      return t("common.createdBy");
    }

    if (activeSortOrder === "zuid") {
      return "ZUID";
    }

    if (SORT_ORDER.hasOwnProperty(activeSortOrder)) {
      return t(SORT_ORDER[activeSortOrder as keyof typeof SORT_ORDER]);
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
        buttonText={t("content.itemListSortPrefix", {
          value: getButtonText(activeSortOrder),
        })}
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
            {t(value)}
          </MenuItem>
        ))}
        <CascadingMenuItem
          MenuItemComponent={
            <>
              <ListItemText>{t("common.more")}</ListItemText>
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
              {t("common.createdBy")}
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
            textTransform: "uppercase",
          }}
        >
          {t("content.itemListFieldsLabel")}
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
              data-cy={`sort:${field.name}`}
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
            ? t(
                STATUS_FILTER[
                  params.get("statusFilter") as keyof typeof STATUS_FILTER
                ]
              )
            : t("content.itemListStatus")
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
            {t(value)}
          </MenuItem>
        ))}
      </Menu>
      <UserFilter
        value={params.get("user") || ""}
        onChange={(value) => setParams(value, "user")}
        defaultButtonText={t("common.createdBy")}
        options={userOptions}
      />
      <DateFilter
        withDateRange
        defaultButtonText={t("content.itemListDateSaved")}
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
          <Flag countryCode={getCountryCode(activeLanguageCode)} />
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
            <Flag countryCode={getCountryCode(language.code)} />{" "}
            {language.code.split("-")[0]?.toUpperCase()} (
            {getCountryCode(language.code)})
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
