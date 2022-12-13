import { useState, FC } from "react";
import { Link as Link } from "react-router-dom";

import { ConfirmDialog, theme } from "@zesty-io/material";
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
          sx={{
            alignItems: "center",
            display: "flex",
            flexDirection: "row",
            width: "100%",
            textTransform: "none",
            gap: "8px",
            borderRadius: "8px 8px 0px 0px",
            backgroundColor: theme.palette.grey[100],
            "&:hover": {
              backgroundColor: theme.palette.grey[50],
            },
            /*
             Needed to prevent button from outgrowing parent
             which will push the dropdown below the nav bar,
             creating an unsightly gap
            */
            lineHeight: "inherit",
            marginTop: "1px",
          }}
        >
          <Box
            component="span"
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              More
            </Typography>
          </Box>
          <ArrowDropDownIcon
            sx={{ color: theme.palette.action.active }}
            fontSize="small"
          />
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
              backgroundColor: "white",
              boxSizing: "border-box",
              padding: "0px",
              width: "274px",
            },
          }}
        >
          <Box
            onKeyDown={(e) => e.stopPropagation()}
            sx={{
              cursor: "auto",
              height: "60px",
              backgroundColor: theme.palette.grey[200],
              padding: "12px",
              boxSizing: "border-box",
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
                  <SearchIcon
                    fontSize="small"
                    sx={{ color: theme.palette.action.active }}
                  />
                ),
                sx: {
                  "&.Mui-focused": {
                    backgroundColor: "white",
                    color: theme.palette.text.secondary,
                  },
                  backgroundColor: "white",
                  color: theme.palette.text.disabled,
                  padding: "0px 8px",
                  gap: "8px",
                },
              }}
              value={filter}
              onChange={(evt) => setFilter(evt.target.value)}
            />
          </Box>
          <MenuItem
            disableRipple
            sx={{
              cursor: "auto",
              padding: "17px 12px",
              height: "56px",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flex="1"
            >
              <Box
                component="span"
                sx={{ color: theme.palette.text.secondary, lineHeight: "266%" }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
                    color: theme.palette.text.secondary,
                    lineHeight: "24px",
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
        color: theme.palette.text.primary,
        width: "100%",
        display: "grid",
        gridTemplateColumns: "20px 1fr 20px",
        justifyContent: "space-between",
        alignItems: "center",
        height: `${ITEM_HEIGHT}px`,
        padding: "17px 12px",
        gap: "8px",
        cursor: "auto",
        boxSizing: "border-box",
        borderBottom: "1px solid",
        borderColor: theme.palette.border,
      }}
    >
      <Box component="span" sx={{ color: theme.palette.action.active }}>
        {tab.icon && (
          <FontAwesomeIcon icon={tab.icon} style={{ fontSize: "18px" }} />
        )}
      </Box>
      <MuiLink
        component={Link}
        to={tab.pathname + tab.search}
        underline="none"
        sx={{
          color: theme.palette.text.primary,
          textDecoration: "none",
          flex: "1",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          alignContent: "center",
        }}
      >
        <Typography variant="body2">
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
          color: theme.palette.action.active,
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
