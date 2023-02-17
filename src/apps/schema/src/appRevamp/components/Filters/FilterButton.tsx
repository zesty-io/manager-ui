import { FC } from "react";
import { Button, ButtonGroup } from "@mui/material";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

interface FilterButton {
  isFilterActive: boolean;
  buttonText: string;
  onOpenMenu: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onRemoveFilter: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
}
export const FilterButton: FC<FilterButton> = ({
  isFilterActive,
  buttonText,
  onOpenMenu,
  onRemoveFilter,
  children,
}) => {
  if (isFilterActive) {
    return (
      <>
        <ButtonGroup variant="contained">
          <Button
            size="small"
            startIcon={<CheckIcon sx={{ width: "20px", height: "20px" }} />}
            onClick={onOpenMenu}
          >
            {buttonText}
          </Button>
          <Button size="small" onClick={onRemoveFilter}>
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
      >
        {buttonText}
      </Button>
      {children}
    </>
  );
};
