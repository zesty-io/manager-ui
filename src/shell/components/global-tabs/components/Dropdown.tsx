import { useState, FC } from "react";
import { Link as Link } from "react-router-dom";

import { ConfirmDialog } from "@zesty-io/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PinIcon from "@mui/icons-material/PushPin";
import SearchIcon from "@mui/icons-material/Search";

import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import { Tab } from "../../../../shell/store/ui";
import { Typography } from "@mui/material";

export type Dropdown = {
  tabs: Tab[];
  tabWidth: number;
  removeOne: (tab: Tab) => void;
  removeMany: (tabs: Tab[]) => void;
};

const ITEM_HEIGHT = 48;

export const Dropdown: FC<Dropdown> = ({ tabs, removeOne, removeMany }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [filter, setFilter] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  if (tabs.length === 0) {
    if (open) {
      handleClose();
      setFilter("");
    }
    return null;
  }
  const filterTerm = filter.trim().toLocaleLowerCase();
  const filteredTabs = tabs.filter(
    (tab) =>
      tab.pathname.toLocaleLowerCase().includes(filterTerm) ||
      (tab.name && tab.name.toLocaleLowerCase().includes(filterTerm))
  );

  return (
    <>
      <Box>
        <Button
          id="basic-button"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          disableRipple
          disableElevation
          disableTouchRipple
          sx={{
            alignItems: "center",
            display: "flex",
            flexDirection: "row",
            width: "100%",
            textTransform: "none",
            padding: "12px 12px 12px",
            gap: "8px",
            borderRadius: "12px 12px 0px 0px",
            "&:hover": {
              backgroundColor: "grey.800",
            },
            /*
             Needed to prevent button from outgrowing parent
             which will push the dropdown below the nav bar,
             creating an unsightly gap
            */
            lineHeight: "inherit",
          }}
        >
          <Box component="span" sx={{ color: "white" }}>
            <Typography variant="caption">More</Typography>
          </Box>
          <ArrowDropDownIcon sx={{ color: "grey.400" }} fontSize="small" />
        </Button>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          disableScrollLock
          PaperProps={{ style: { maxHeight: ITEM_HEIGHT * 10 } }}
          MenuListProps={{
            "aria-labelledby": "basic-button",
            sx: {
              backgroundColor: "grey.900",
              boxSizing: "border-box",
              padding: "0px",
              width: "240px",
            },
          }}
        >
          <MenuItem
            onKeyDown={(e) => e.stopPropagation()}
            disableRipple
            sx={{
              cursor: "auto",
              padding: "12px 12px 12px 12px",
              height: "56px",
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Search Tabs"
              size="small"
              sx={{ height: "32px" }}
              InputProps={{
                startAdornment: (
                  <SearchIcon fontSize="small" sx={{ color: "grey.300" }} />
                ),
                sx: {
                  "&.Mui-focused": {
                    backgroundColor: "white",
                    color: "grey.900",
                  },
                  "&.Mui-focused fieldset": {
                    border: "none",
                  },
                  "&.Mui-focused svg": {
                    color: "grey.400",
                  },
                  backgroundColor: "grey.800",
                  color: "grey.50",
                  padding: "0px 8px",
                  gap: "8px",
                },
              }}
              value={filter}
              onChange={(evt) => setFilter(evt.target.value)}
            />
          </MenuItem>
          <MenuItem
            disableRipple
            sx={{
              cursor: "auto",
              padding: "6px 12px",
              height: "32px",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flex="1"
            >
              <Box component="span" sx={{ color: "white", lineHeight: "266%" }}>
                <Typography variant="overline">
                  {Boolean(filterTerm)
                    ? `${filteredTabs.length} RESULTS`
                    : "PINNED TABS"}
                </Typography>
              </Box>
              {Boolean(filterTerm) || (
                <Button
                  disableRipple
                  disableFocusRipple
                  disableTouchRipple
                  onClick={() => setConfirmOpen(true)}
                  size="small"
                  sx={{
                    mr: 0,
                    pr: 0,
                    color: "grey.400",
                    lineHeight: "266%",
                    "&:hover": {
                      color: "warning.main",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  <Typography variant="overline">UNPIN ALL</Typography>
                </Button>
              )}
            </Stack>
          </MenuItem>
          {filteredTabs.map((tab) => (
            <DropdownItem
              tab={tab}
              key={tab.pathname + tab.search}
              remove={() => removeOne(tab)}
            />
          ))}
        </Menu>
      </Box>
      <ConfirmDialog
        open={confirmOpen}
        title="Unpin All Tabs in See More Menu?"
        content="This  cannot be undone"
        callback={() => {} /* TODO why is this required?? */}
      >
        <Button
          color="info"
          sx={{
            color: "text.secondary",
            textTransform: "none",
          }}
          onClick={() => setConfirmOpen(false)}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            setFilter("");
            handleClose();
            removeMany(tabs);
            setConfirmOpen(false);
          }}
        >
          Unpin All
        </Button>
      </ConfirmDialog>
    </>
  );
};
type DropdownItem = {
  tab: Tab;
  remove: () => void;
};
const DropdownItem: FC<DropdownItem> = ({ tab, remove }) => {
  return (
    <MenuItem
      disableRipple
      sx={{
        color: "grey.400",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "20px 1fr 20px",
        justifyContent: "space-between",
        alignItems: "center",
        height: `${ITEM_HEIGHT}px`,
        padding: "12px 12px 12px 12px",
        gap: "8px",
        cursor: "auto",

        boxSizing: "border-box",
        borderBottom: "1px solid",
        borderColor: "grey.800",
      }}
    >
      <Box component="span" color="grey.400">
        {tab.icon && (
          <FontAwesomeIcon icon={tab.icon} style={{ fontSize: 16 }} />
        )}
      </Box>
      <MuiLink
        component={Link}
        to={tab.pathname + tab.search}
        underline="none"
        sx={{
          color: "grey.400",
          textDecoration: "none",
          flex: "1",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",

          alignContent: "center",
        }}
      >
        <Typography variant="caption">
          {tab.name ? tab.name : `${tab.pathname.slice(1)}`}
        </Typography>
      </MuiLink>
      <Box
        component="span"
        onClick={remove}
        sx={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PinIcon
          fontSize="small"
          sx={{
            width: "16px",
            height: "16px",
            transform: "rotate(45deg)",
          }}
        />
      </Box>
    </MenuItem>
  );
};
