import { useState, FC } from "react";
import { Link as Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import { ConfirmDialog } from "@zesty-io/material";
import PinIcon from "@mui/icons-material/PushPin";
import SearchIcon from "@mui/icons-material/Search";

import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import SvgIcon from "@mui/material/SvgIcon";
import Typography from "@mui/material/Typography";

import { Tab, updatePinnedTabs } from "../../../../shell/store/ui";

export type Dropdown = {
  tabs: Tab[];
  tabWidth: number;
  removeOne: (tab: Tab) => void;
  removeMany: (tabs: Tab[]) => void;
};

const ITEM_HEIGHT = 56;

export const Dropdown: FC<Dropdown> = ({
  tabs,
  removeOne,
  removeMany,
  tabWidth,
}) => {
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
  const getDropdownHeader = () => {
    if (Boolean(filterTerm)) {
      if (filteredTabs.length) {
        return `${filteredTabs.length} Results`;
      } else {
        return "No results found";
      }
    } else {
      return "Pinned Tabs";
    }
  };

  return (
    <>
      <Box
        height={34}
        width={tabWidth}
        py={0.5}
        borderRadius="8px 8px 0px 0px"
        className="more-menu-tab"
        sx={{
          "&:hover": {
            backgroundColor: "grey.50",
            cursor: "pointer",
          },
        }}
      >
        <Stack
          direction="row"
          component="span"
          height={24}
          alignItems="center"
          justifyContent="flex-start"
          borderLeft={1}
          borderColor="grey.300"
          sx={{
            "&:hover": {
              borderColor: "transparent",
            },
          }}
          data-cy="TabsDropdownButton"
          onClick={handleClick}
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Typography
            // @ts-expect-error missing body3 module augmentation
            variant="body3"
            fontWeight={600}
            pl={1.5}
          >
            More
          </Typography>
          <IconButton disableTouchRipple disableRipple size="small">
            <ArrowDropDownIcon />
          </IconButton>
        </Stack>
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
              padding: "0px",
              width: "274px",
            },
          }}
          sx={{
            "*": {
              boxSizing: "border-box",
            },
          }}
        >
          <MenuItem
            onKeyDown={(e) => e.stopPropagation()}
            disableRipple
            sx={{
              cursor: "auto",
              height: "60px",
              padding: 1.5,
              "&:hover": {
                backgroundColor: "common.white",
              },
              "&.Mui-focusVisible": {
                backgroundColor: "common.white",
              },
            }}
          >
            <Box
              display="flex"
              bgcolor="grey.50"
              border={1}
              borderColor="grey.50"
              borderRadius={1}
              height={36}
              width="100%"
            >
              <InputBase
                fullWidth
                placeholder="Search Tabs"
                value={filter}
                onChange={(evt) => setFilter(evt.target.value)}
                startAdornment={
                  <IconButton disableRipple disableTouchRipple size="small">
                    <SearchIcon />
                  </IconButton>
                }
                endAdornment={
                  filter.length ? (
                    <IconButton
                      disableRipple
                      disableTouchRipple
                      size="small"
                      onClick={() => setFilter("")}
                    >
                      <CloseRoundedIcon />
                    </IconButton>
                  ) : null
                }
                sx={{
                  "&.Mui-focused": {
                    borderColor: "border",
                    backgroundColor: "common.white",
                  },
                }}
              />
            </Box>
          </MenuItem>
          <MenuItem
            disableRipple
            sx={{
              cursor: "auto",
              padding: 1.5,
              height: "56px",
              "&:hover": {
                backgroundColor: "common.white",
              },
              "&.Mui-focusVisible": {
                backgroundColor: "common.white",
              },
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
                  {getDropdownHeader()}
                </Typography>
              </Box>
              {Boolean(filterTerm) || (
                <Button
                  variant="outlined"
                  onClick={() => setConfirmOpen(true)}
                  size="small"
                  sx={{
                    color: "text.secondary",
                    borderColor: "border",
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
  const dispatch = useDispatch();

  return (
    <MenuItem
      disableRipple
      sx={{
        width: "100%",
        display: "flex",
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
      <Box
        component="span"
        pr={0.5}
        sx={{ color: "action.active" }}
        fontSize={18}
      >
        {tab.icon && (
          <SvgIcon
            component={tab.icon}
            fontSize="inherit"
            sx={{
              verticalAlign: "middle",
            }}
          />
        )}
      </Box>
      <MuiLink
        component={Link}
        to={tab.pathname + tab.search}
        onClick={() => dispatch(updatePinnedTabs(tab))}
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
        <Typography noWrap variant="body2" color="text.primary">
          {tab.name ? tab.name : `${tab.pathname.slice(1)}`}
        </Typography>
      </MuiLink>
      <IconButton size="small" onClick={remove}>
        <PinIcon
          fontSize="small"
          sx={{
            transform: "rotate(45deg)",
          }}
        />
      </IconButton>
    </MenuItem>
  );
};
