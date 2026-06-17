import { FC, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";

import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import CheckIcon from "@mui/icons-material/Check";
import Divider from "@mui/material/Divider";

import { AppState } from "../../../../../../shell/store/types";
import { DateRange } from "../../../../../../shell/store/media-revamp";
import { getDateFilter } from "../../utils/fileUtils";
import { format as fmt } from "date-fns";
import { DateFilterModal } from "../DateFilterModal";
import { useParams } from "../../../../../../shell/hooks/useParams";

type Modal = "on" | "before" | "after" | null;

// Maps the stored preset value (English, from getDateFilter) to its localized
// label key, so the active filter chip shows the translated label rather than
// the raw stored value.
const PRESET_LABEL_KEYS: Record<string, string> = {
  today: "common.today",
  yesterday: "common.yesterday",
  "last 7 days": "common.last7Days",
  "last 30 days": "common.last30Days",
  "last 3 months": "common.last3Months",
  "last 12 months": "common.last12Months",
};

export const DateRangeFilter: FC = () => {
  const { t } = useTranslation();
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
    const format = (date: string | Date) => fmt(new Date(date), "yyyy-MM-dd");
    switch (dateRange.type) {
      case "on": {
        setParams(format(dateRange.value), "to");
        setParams(format(dateRange.value), "from");
        setParams(null, "dateFilter");
        return;
      }
      case "before": {
        setParams(format(dateRange.value), "to");
        setParams(null, "from");
        setParams(null, "dateFilter");
        return;
      }
      case "after": {
        setParams(format(dateRange.value), "from");
        setParams(null, "to");
        setParams(null, "dateFilter");
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
      return t("media.dateFilterCustomRange");
    }
    const dateDisplay = new Date(value).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
      day: "numeric",
      timeZone: "UTC",
    });
    switch (type) {
      case "preset":
        return PRESET_LABEL_KEYS[value] ? t(PRESET_LABEL_KEYS[value]) : value;
      case "on":
        return t("common.dateOnValue", { date: dateDisplay });
      case "before":
        return t("common.dateBeforeValue", { date: dateDisplay });
      case "after":
        return t("common.dateAfterValue", { date: dateDisplay });
    }
  };

  const inactiveButton = (
    <Button
      endIcon={<KeyboardArrowDownRoundedIcon />}
      onClick={handleClick}
      variant="outlined"
      size="small"
      color="inherit"
      sx={{
        py: "1px",
        backgroundColor: "common.white",
      }}
    >
      {t("media.dateFilterButtonLabel")}
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
          <Typography variant="body1">{t("common.today")}</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => handleChange({ type: "preset", value: "yesterday" })}
        >
          <Typography variant="body1">{t("common.yesterday")}</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => handleChange({ type: "preset", value: "last 7 days" })}
        >
          <Typography variant="body1">{t("common.last7Days")}</Typography>
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleChange({ type: "preset", value: "last 30 days" })
          }
        >
          <Typography variant="body1">{t("common.last30Days")}</Typography>
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleChange({ type: "preset", value: "last 3 months" })
          }
        >
          <Typography variant="body1">{t("common.last3Months")}</Typography>
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleChange({ type: "preset", value: "last 12 months" })
          }
        >
          <Typography variant="body1">{t("common.last12Months")}</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setModal("on")}>
          <Typography variant="body1">{t("media.dateFilterOn")}</Typography>
        </MenuItem>
        <MenuItem onClick={() => setModal("before")}>
          <Typography variant="body1">{t("media.dateFilterBefore")}</Typography>
        </MenuItem>
        <MenuItem onClick={() => setModal("after")}>
          <Typography variant="body1">{t("media.dateFilterAfter")}</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
