import { useState } from "react";
import {
  Stack,
  Menu,
  MenuItem,
  MenuList,
  Typography,
  ListItemText,
} from "@mui/material";
import { ChevronRightOutlined } from "@mui/icons-material";

import { FilterButton } from "../../Filters";
import { CascadingMenuItem } from "../../CascadingMenuItem";
import { useGetContentModelFieldsQuery } from "../../../services/instance";

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

type FieldSelectorFiltersProps = {
  activeSortOrder: string;
  onUpdateActiveSortOrder: (sortOrder: string) => void;
  modelZUID: string;
};
export const FieldSelectorFilters = ({
  modelZUID,
  activeSortOrder,
  onUpdateActiveSortOrder,
}: FieldSelectorFiltersProps) => {
  const [anchorEl, setAnchorEl] = useState({
    currentTarget: null,
    id: "",
  });
  const { data: fields, isLoading: isFieldsLoading } =
    useGetContentModelFieldsQuery(modelZUID);

  const handleUpdateSortOrder = (sortOrder: string) => {
    setAnchorEl({
      currentTarget: null,
      id: "",
    });

    onUpdateActiveSortOrder(sortOrder);
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
    <Stack direction="row">
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
    </Stack>
  );
};
