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
import IconButton from "@mui/material/IconButton";

import { Tab } from "../../../../shell/store/ui";
import { Typography } from "@mui/material";

export type Dropdown = {
  tabs: Tab[];
  tabWidth: number;
  removeOne: (tab: Tab) => void;
  removeMany: (tabs: Tab[]) => void;
};

const ITEM_HEIGHT = 56;

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
          data-cy="TabsDropdownButton"
          endIcon={<ArrowDropDownIcon color="action" />}
          sx={{
            backgroundColor: "grey.100",
            "&:hover": {
              backgroundColor: "grey.50",
            },
            /*
             Needed to prevent button from outgrowing parent
             which will push the dropdown below the nav bar,
             creating an unsightly gap
            */
            lineHeight: "inherit",
          }}
        >
          <Typography color="text.secondary" fontWeight={600} variant="caption">
            More
          </Typography>
        </Button>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          disableScrollLock
          data-cy="TabsDropdownMenu"
          PaperProps={{ style: { maxHeight: ITEM_HEIGHT * 10 } }}
          MenuListProps={{
            "aria-labelledby": "basic-button",
            sx: {
              backgroundColor: "common.white",
              boxSizing: "border-box",
              padding: "0px",
              width: "274px",
            },
          }}
        >
          <MenuItem
            onKeyDown={(e) => e.stopPropagation()}
            disableRipple
            sx={{
              cursor: "auto",
              height: "60px",
              backgroundColor: "grey.200",
              padding: 1.5,
              boxSizing: "border-box",
              "&:hover": {
                backgroundColor: "grey.200",
              },
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Search Tabs"
              size="small"
              fullWidth
              sx={{ height: "36px" }}
              InputProps={{
                startAdornment: (
                  <SearchIcon fontSize="small" sx={{ color: "action" }} />
                ),
                sx: {
                  "&.Mui-focused": {
                    backgroundColor: "white",
                    color: "text.secondary",
                  },
                  backgroundColor: "common.white",
                  color: "text.disabled",
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
              padding: 1.5,
              height: "56px",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flex="1"
            >
              <Box component="span">
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ color: "text.secondary" }}
                >
                  {Boolean(filterTerm)
                    ? `${filteredTabs.length} Results`
                    : "Pinned Tabs"}
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
                    color: "text.secondary",
                    "&:hover": {
                      color: "warning.main",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  <Typography variant="overline">Unpin All</Typography>
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
        maxWidth="xs"
        fullWidth
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
          sx={{ textTransform: "none" }}
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
        width: "100%",
        display: "grid",
        gridTemplateColumns: "20px 1fr 20px",
        justifyContent: "space-between",
        alignItems: "center",
        height: `${ITEM_HEIGHT}px`,
        padding: 1.5,
        gap: "8px",
        cursor: "auto",
        boxSizing: "border-box",
        borderBottom: "1px solid",
        borderColor: "border",
      }}
    >
      <Box component="span" sx={{ color: "action.active" }}>
        {tab.icon && (
          <FontAwesomeIcon icon={tab.icon} style={{ fontSize: "18px" }} />
        )}
      </Box>
      <MuiLink
        component={Link}
        to={tab.pathname + tab.search}
        underline="none"
        sx={{
          textDecoration: "none",
          flex: "1",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          alignContent: "center",
        }}
      >
        <Typography variant="body2" color="text.primary">
          {tab.name ? tab.name : `${tab.pathname.slice(1)}`}
        </Typography>
      </MuiLink>
      <IconButton size="small" onClick={remove}>
        <PinIcon
          fontSize="inherit"
          sx={{
            transform: "rotate(45deg)",
          }}
        />
      </IconButton>
    </MenuItem>
  );
};
