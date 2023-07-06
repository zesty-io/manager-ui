import { FC, useState } from "react";
import { Menu, MenuItem } from "@mui/material";

import { FilterButton } from "../../../components/Filters";
import { useGetLangsQuery } from "../../../services/instance";

interface LanguageFilterProps {
  onChange: (value: string) => void;
  value?: string;
}
export const LanguageFilter: FC<LanguageFilterProps> = ({
  onChange,
  value,
}) => {
  const [anchorRef, setAnchorRef] = useState<HTMLElement | null>(null);
  //TODO: verify with Markel if should I be using active or enabled here
  const { data: langs } = useGetLangsQuery("active");

  return (
    <>
      <FilterButton
        filterId="language"
        isFilterActive={Boolean(value)}
        buttonText={Boolean(value) ? value : "Language"}
        onOpenMenu={(evt: React.MouseEvent<HTMLButtonElement>) =>
          setAnchorRef(evt.currentTarget)
        }
        onRemoveFilter={() => onChange("")}
      >
        <Menu
          data-cy="LanguageFilterMenu"
          anchorEl={anchorRef}
          open={Boolean(anchorRef)}
          onClose={() => setAnchorRef(null)}
          PaperProps={{
            sx: {
              mt: 1,
            },
          }}
        >
          {langs?.map((lang) => (
            <MenuItem
              key={lang.code}
              value={lang.code}
              selected={value === lang.code}
              sx={{
                height: 40,
              }}
              onClick={() => {
                onChange(lang.code);
                setAnchorRef(null);
              }}
            >
              {lang.code}
            </MenuItem>
          ))}
        </Menu>
      </FilterButton>
    </>
  );
};
