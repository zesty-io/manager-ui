import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Box, MenuItem, Menu } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { MediaSortOrder } from "../../../../../../shell/store/media-revamp";
import { useParams } from "../../../../../../shell/hooks/useParams";
import { FilterButton } from "../../../../../../shell/components/Filters";

type SortOrder = "AtoZ" | "ZtoA" | "dateadded";
// Maps the raw sort key (used as state/comparison value) to its i18n key.
const SORT_ORDER_LABEL_KEYS: Record<SortOrder, string> = {
  dateadded: "media.sortDateAdded",
  AtoZ: "common.sortNameAToZ",
  ZtoA: "common.sortNameZToA",
} as const;
export const Sort: FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const [params, setParams] = useParams();
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleChange = (sortOrder: SortOrder) => {
    //dispatch(setSortOrder(sortOrder));
    setParams(sortOrder, "sort");
    handleClose();
  };

  return (
    <>
      <FilterButton
        filterId="sortBy"
        isFilterActive={false}
        buttonText={t("media.sortButtonLabel", {
          order: t(
            SORT_ORDER_LABEL_KEYS[params.get("sort") as SortOrder] ??
              SORT_ORDER_LABEL_KEYS.dateadded
          ),
        })}
        onOpenMenu={handleClick}
        onRemoveFilter={() => {}}
      />
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        {Object.entries(SORT_ORDER_LABEL_KEYS).map(([key, labelKey]) => (
          <MenuItem
            key={key}
            onClick={() => handleChange(key as SortOrder)}
            selected={
              key === "dateadded"
                ? !params.get("sort") || params.get("sort") === key
                : params.get("sort") === key
            }
          >
            {t(labelKey)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
