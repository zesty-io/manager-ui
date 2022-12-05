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
import { getDateFilter } from "../../utils/fileUtils";
import moment from "moment-timezone";
import { DateFilterModal } from "../DateFilterModal";
import { useParams } from "../../../../../../shell/hooks/useParams";

type Modal = "on" | "before" | "after" | null;
export const DateRangeFilter: FC = () => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [modal, setModal] = useState<Modal>(null);
  const [params, setParams] = useParams();
  const activeFilter = getDateFilter(params);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleChange = (dateRange: DateRange | null) => {
    handleClose();
    if (dateRange === null) {
      setParams(null, "to");
      setParams(null, "from");
      setParams(null, "dateFilter");
      return;
    }
    const format = (date: string) => {
      const s = moment(date).format("YYYY-MM-DD");
      return s;
    };
    switch (dateRange.type) {
      case "on": {
        setParams(format(dateRange.value), "to");
        setParams(format(dateRange.value), "from");
        return;
      }
      case "before": {
        setParams(format(dateRange.value), "to");
        setParams(null, "from");
        return;
      }
      case "after": {
        setParams(format(dateRange.value), "from");
        setParams(null, "to");
        return;
      }
      case "preset": {
        setParams(dateRange.value.replace(/\s/g, ""), "dateFilter");
        setParams(null, "to");
        setParams(null, "from");
        return;
      }
    }
  };
  const formatDisplay = (filter: DateRange) => {
    if (!filter) return "";
    const { type, value } = filter;
    if (type === "range") {
      return "Custom Range";
    }
    const dateDisplay = new Date(value).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
      day: "numeric",
      timeZone: "UTC",
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
        setDateCallback={
          modal
            ? (date) => handleChange({ type: modal, value: date.toISOString() })
            : null
        }
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
