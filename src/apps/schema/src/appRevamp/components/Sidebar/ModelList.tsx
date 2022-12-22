import {
  Box,
  IconButton,
  Typography,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import AddIcon from "@mui/icons-material/Add";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { ContentModel } from "../../../../../../shell/services/types";
import { Database } from "@zesty-io/material";
import { useHistory, useLocation } from "react-router";
import { useMemo, useState } from "react";
import { useLocalStorage } from "react-use";

interface Props {
  title: string;
  models: ContentModel[];
}

const listIconMap = {
  templateset: <FormatListBulletedRoundedIcon fontSize="small" />,
  dataset: <Database fontSize="small" />,
  pageset: <DescriptionRoundedIcon fontSize="small" />,
};

export const ModelList = ({ title, models }: Props) => {
  const history = useHistory();
  const location = useLocation();

  const [sort, setSort] = useLocalStorage(
    `zesty:navSchema-${title}:sort`,
    "asc"
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleSortMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const sortedModels = useMemo(() => {
    if (!sort) return [...models].reverse();
    return [...models].sort((a, b) => {
      if (sort === "asc") {
        return a.label.localeCompare(b.label);
      } else {
        return b.label.localeCompare(a.label);
      }
    });
  }, [sort, models]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between">
        <Box display="flex" gap={0.25} alignItems="center">
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ textTransform: "uppercase" }}
          >
            {title}
          </Typography>
          <IconButton size="small" onClick={handleSortMenuClick}>
            <ArrowDropDownIcon fontSize="small" />
          </IconButton>
        </Box>
        <IconButton size="small">
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
      {sortedModels?.map((model) => {
        const selected = location.pathname.includes(model.ZUID);
        return (
          <ListItemButton
            sx={{ py: "6px", px: "12px" }}
            selected={selected}
            onClick={() => history.push(`/schema/${model.ZUID}`)}
          >
            <ListItemIcon
              sx={{
                minWidth: "unset",
                mr: 1.5,
                color: selected && "primary.main",
              }}
            >
              {listIconMap[model.type as keyof typeof listIconMap]}
            </ListItemIcon>
            <ListItemText
              sx={{ m: 0 }}
              primary={model.name}
              primaryTypographyProps={{
                fontWeight: 500,
                variant: "caption",
                color: selected ? "primary.dark" : "text.secondary",
                sx: { wordBreak: "break-word" },
              }}
            />
          </ListItemButton>
        );
      })}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            handleClose();
            setSort("asc");
          }}
        >
          Name (A to Z)
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            setSort("desc");
          }}
        >
          Name (Z to A)
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            setSort("");
          }}
        >
          Last Created
        </MenuItem>
      </Menu>
    </Box>
  );
};
