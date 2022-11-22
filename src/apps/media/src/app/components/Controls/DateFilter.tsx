import { FC, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseRounded from "@mui/icons-material/CloseRounded";
import CheckIcon from "@mui/icons-material/Check";
import Divider from "@mui/material/Divider";

import { AppState } from "../../../../../../shell/store/types";
import {
  DateRange,
  setDateRangeFilter,
} from "../../../../../../shell/store/media-revamp";
import { DateFilterModal } from "../DateFilterModal";

type Modal = "on" | "before" | "after" | null;
export const DateRangeFilter: FC = () => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [modal, setModal] = useState<Modal>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleChange = (dateRange: DateRange) => {
    dispatch(setDateRangeFilter(dateRange));
    handleClose();
  };
  const activeFilter = useSelector(
    (state: AppState) => state.mediaRevamp.dateRangeFilter
  );
  const formatDisplay = (filter: DateRange) => {
    if (!filter) return "";
    const { type, value } = filter;
    const dateDisplay = new Date(value).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
      day: "numeric",
    });
    switch (type) {
      case "preset":
        return value;
      case "on":
        return `On ${dateDisplay}`;
      case "before":
        return `Before ${dateDisplay}`;
      case "after":
        return `After ${dateDisplay}`;
    }
  };

  const inactiveButton = (
    <Button
      endIcon={<ArrowDropDownIcon />}
      onClick={handleClick}
      variant="outlined"
      size="small"
      color="inherit"
      sx={{
        py: "1px",
      }}
    >
      Date
    </Button>
  );

  const activeButton = (
    <ButtonGroup variant="contained">
      <Button
        startIcon={<CheckIcon sx={{ width: "20px", height: "20px" }} />}
        onClick={handleClick}
        size="small"
        sx={{
          py: "1px",
        }}
      >
        <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
          {formatDisplay(activeFilter)}
        </Typography>
      </Button>
      <Button
        onClick={() => handleChange(null)}
        size="small"
        sx={{
          py: "1px",
        }}
      >
        <CloseRounded fontSize="small" />
      </Button>
    </ButtonGroup>
  );

  return (
    <>
      <DateFilterModal
        open={Boolean(modal)}
        type={modal}
        onClose={() => {
          setModal(null);
          handleClose();
        }}
      />
      {activeFilter ? activeButton : inactiveButton}
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        <MenuItem
          onClick={() => handleChange({ type: "preset", value: "today" })}
        >
          <Typography variant="body1">Today</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => handleChange({ type: "preset", value: "yesterday" })}
        >
          <Typography variant="body1">Yesterday</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => handleChange({ type: "preset", value: "last 7 days" })}
        >
          <Typography variant="body1">Last 7 days</Typography>
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleChange({ type: "preset", value: "last 30 days" })
          }
        >
          <Typography variant="body1">Last 30 days</Typography>
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleChange({ type: "preset", value: "last 3 months" })
          }
        >
          <Typography variant="body1">Last 3 months</Typography>
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleChange({ type: "preset", value: "last 12 months" })
          }
        >
          <Typography variant="body1">Last 12 months</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setModal("on")}>
          <Typography variant="body1">On</Typography>
        </MenuItem>
        <MenuItem onClick={() => setModal("before")}>
          <Typography variant="body1">Before</Typography>
        </MenuItem>
        <MenuItem onClick={() => setModal("after")}>
          <Typography variant="body1">After</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
