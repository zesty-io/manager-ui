import { FC, useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";

import { FilterButton } from "../../../components/Filters";

export type FilterValues = "modified" | "created" | "AtoZ" | "ZtoA";
const OPTIONS: { [key in FilterValues]: string } = Object.freeze({
  modified: "shell.sortMostRecentlyModified",
  created: "shell.sortMostRecentlyCreated",
  AtoZ: "common.sortNameAToZ",
  ZtoA: "common.sortNameZToA",
});

interface SortByFilter {
  onChange: (value: FilterValues) => void;
  value?: FilterValues;
}
export const SortByFilter: FC<SortByFilter> = ({
  onChange,
  value = "modified",
}) => {
  const { t } = useTranslation();
  const [anchorRef, setAnchorRef] = useState<HTMLElement | null>(null);

  return (
    <>
      <FilterButton
        filterId="sortBy"
        isFilterActive={false}
        buttonText={t("shell.sortValue", { value: t(OPTIONS[value]) })}
        onOpenMenu={(e: React.MouseEvent<HTMLButtonElement>) =>
          setAnchorRef(e.currentTarget)
        }
        onRemoveFilter={() => {}} // Setting to empty as this is required by the component but not needed here
      />
      <Menu
        data-cy="SortByFilterMenu"
        anchorEl={anchorRef}
        open={Boolean(anchorRef)}
        onClose={() => setAnchorRef(null)}
        PaperProps={{
          sx: {
            mt: 1,
          },
        }}
      >
        {Object.entries(OPTIONS).map(([filter, textKey]) => (
          <MenuItem
            key={filter}
            selected={value === filter}
            sx={{
              height: 40,
            }}
            onClick={() => {
              onChange(filter as FilterValues);
              setAnchorRef(null);
            }}
          >
            {t(textKey)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
