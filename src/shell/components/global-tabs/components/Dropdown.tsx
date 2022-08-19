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
import Input from "@mui/material/Input";

import { Tab } from "../../../../shell/store/ui";

export type Dropdown = {
  tabs: Tab[];
  tabWidth: number;
  removeOne: (tab: Tab) => void;
  removeMany: (tabs: Tab[]) => void;
};

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
  // TODO consider memoizing this
  const filteredTabs = tabs.filter(
    (tab) =>
      tab.pathname.toLocaleLowerCase().includes(filterTerm) ||
      (tab.name && tab.name.toLocaleLowerCase().includes(filterTerm))
  );

  return (
    <>
      <div>
        <Button
          id="basic-button"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          More
        </Button>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem>
            <Input
              placeholder="Search Tabs"
              startAdornment={<SearchIcon />}
              value={filter}
              onChange={(evt) => setFilter(evt.target.value)}
            />
          </MenuItem>
          <MenuItem>
            <Stack direction="row" justifyContent="space-between">
              PINNED TABS
              {Boolean(filterTerm) || (
                <Button onClick={() => setConfirmOpen(true)}>UNPIN ALL</Button>
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
      </div>
      <ConfirmDialog
        open={confirmOpen}
        callback={(confirmed) => {
          console.log({ confirmed });
          if (confirmed) {
            setFilter("");
            handleClose();
            removeMany(tabs);
          }
          setConfirmOpen(false);
        }}
        title="Unpin All Tabs in See More Menu?"
        content="This  cannot be undone"
      />
    </>
  );
};
type DropdownItem = {
  tab: Tab;
  remove: () => void;
};
const DropdownItem: FC<DropdownItem> = ({ tab, remove }) => {
  return (
    <MenuItem>
      <MuiLink
        component={Link}
        to={tab.pathname + tab.search}
        sx={{
          color: "grey.400",
          justifyContent: "space-between",
          // taken from old less
          width: "100%",
          display: "inline-block",
          maxWidth: "300px",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textShadow: "none",
          wordBreak: "keep-all",
          transitionDuration: "unset",
          transitionProperty: "unset",
        }}
      >
        {tab.icon && <FontAwesomeIcon icon={tab.icon} />}
        &nbsp;
        {tab.name ? tab.name : `${tab.pathname.slice(1)}`}
      </MuiLink>
      <Box component="span" onClick={remove} sx={{ cursor: "pointer" }}>
        <PinIcon
          fontSize="small"
          sx={{ transform: "rotate(45deg)", marginRight: 0.25 }}
        />
      </Box>
    </MenuItem>
  );
};
