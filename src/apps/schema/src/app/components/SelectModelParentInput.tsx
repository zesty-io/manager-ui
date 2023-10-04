import {
  Box,
  InputLabel,
  TextField,
  Tooltip,
  Autocomplete,
} from "@mui/material";
import { useMemo } from "react";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { useGetContentNavItemsQuery } from "../../../../../shell/services/instance";
import { ContentNavItem, ModelType } from "../../../../../shell/services/types";

type SelectModelParentInputProps = {
  value: string;
  onChange: (value: string) => void;
  modelType: ModelType;
  label?: string;
  withTooltip?: boolean;
};

export const SelectModelParentInput = ({
  value,
  onChange,
  modelType,
  label = "Select Model Parent",
  withTooltip = true,
}: SelectModelParentInputProps) => {
  const { data: navItems } = useGetContentNavItemsQuery();

  const parents = useMemo(() => {
    if (navItems) {
      const _navItems = [...navItems];

      // remove homepage from list of parents only if model type is not dataset
      if (modelType !== "dataset") {
        _navItems?.splice(
          _navItems?.findIndex((m) => m.label === "Homepage"),
          1
        );
      }

      return _navItems?.sort((a, b) => a.label.localeCompare(b.label));
    }

    return [];
  }, [navItems]);
  return (
    <Box>
      <InputLabel>
        {label}
        {withTooltip && (
          <Tooltip
            placement="top"
            title="Selecting a parent affects default routing and content navigation in the UI"
          >
            <InfoRoundedIcon
              sx={{ ml: 1, width: "10px", height: "10px" }}
              color="action"
            />
          </Tooltip>
        )}
      </InputLabel>
      <Autocomplete
        fullWidth
        renderInput={(params) => <TextField {...params} placeholder="None" />}
        value={navItems?.find((m) => m.ZUID === value) || null}
        options={parents}
        onChange={(event, value: ContentNavItem) =>
          onChange(value?.ZUID || null)
        }
        sx={{
          "& .MuiOutlinedInput-root": {
            padding: "2px",
          },
        }}
      />
    </Box>
  );
};
