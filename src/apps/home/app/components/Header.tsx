import { Box, Typography, Menu, MenuItem, ListItemIcon } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useSelector } from "react-redux";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";

interface Props {
  dateRange: number;
  onDateRangeChange: (dateRange: number) => void;
}

const dateRanges = [7, 14, 30, 90];

export const Header = ({ dateRange, onDateRangeChange }: Props) => {
  const userFirstName = useSelector((state: any) => state.user.firstName);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        sx={{
          height: "160px",
          color: "common.white",
          px: 3,
          py: 2,
          background: (theme) =>
            // @ts-expect-error - missing module augmentations
            `linear-gradient(91.57deg, ${theme.palette.deepOrange?.[500]} 0%, ${theme.palette.deepOrange?.[600]} 100%)`,
        }}
      >
        <Typography variant="h4" fontWeight={600}>
          Good Morning, {userFirstName}
        </Typography>
        <Typography variant="subtitle1" marginTop={0.5}>
          Here is your instance summary of the{" "}
          <Box
            component="span"
            onClick={handleClick}
            sx={{
              gap: 0.25,
              display: "inline-flex",
              alignItems: "center",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            last {dateRange} days <KeyboardArrowDownRoundedIcon />
          </Box>
        </Typography>
      </Box>
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        {dateRanges.map((dateRangeItem) => (
          <MenuItem
            onClick={() => onDateRangeChange(dateRangeItem)}
            sx={{
              ...(dateRangeItem === dateRange && {
                backgroundColor: (theme) =>
                  alpha(
                    theme.palette.primary.main,
                    theme.palette.action.hoverOpacity
                  ),
              }),
            }}
          >
            <ListItemIcon
              sx={{ visibility: dateRangeItem !== dateRange && "hidden" }}
            >
              <CheckIcon color="primary" />
            </ListItemIcon>
            Last {dateRangeItem} days
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
