import { FC } from "react";
import { Button, ButtonGroup, Typography } from "@mui/material";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

interface FilterButton {
  isFilterActive: boolean;
  buttonText: string;
  onOpenMenu: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onRemoveFilter: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  filterId?: string;
  clearable?: boolean;
}
export const FilterButton: FC<FilterButton> = ({
  isFilterActive,
  buttonText,
  onOpenMenu,
  onRemoveFilter,
  children,
  filterId = "genericFilter",
  clearable = true,
}) => {
  if (isFilterActive && clearable) {
    return (
      <>
        <ButtonGroup variant="contained" sx={{ height: "28px" }}>
          <Button
            size="small"
            startIcon={<CheckIcon sx={{ width: "20px", height: "20px" }} />}
            onClick={onOpenMenu}
            data-cy={`${filterId}_selected`}
          >
            {buttonText}
          </Button>
          <Button
            size="small"
            onClick={onRemoveFilter}
            data-cy={`${filterId}_clearFilter`}
          >
            <CloseRoundedIcon fontSize="small" />
          </Button>
        </ButtonGroup>
        {children}
      </>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        color="inherit"
        endIcon={<ArrowDropDownOutlinedIcon />}
        onClick={onOpenMenu}
        data-cy={`${filterId}_default`}
        sx={{
          backgroundColor: "common.white",
          height: "28px",
          maxWidth: "320px",
        }}
      >
        <Typography variant="inherit" noWrap>
          {buttonText}
        </Typography>
      </Button>
      {children}
    </>
  );
};
