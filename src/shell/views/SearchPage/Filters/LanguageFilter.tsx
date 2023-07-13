import { FC, useState, useMemo } from "react";
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
  const { data: langs } = useGetLangsQuery({});

  const sortedLangs = useMemo(() => {
    if (langs?.length) {
      return [...langs]?.sort((a, b) => a.code?.localeCompare(b.code));
    }

    return [];
  }, [langs]);

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
          {sortedLangs?.map((lang) => (
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
