import {
  Box,
  IconButton,
  Typography,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Menu,
  MenuItem,
  SvgIcon,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddIcon from "@mui/icons-material/Add";
import { ContentModel } from "../../../../../../shell/services/types";
import { useHistory, useLocation } from "react-router";
import { useMemo, useState } from "react";
import { useLocalStorage } from "react-use";
import { CreateModelDialogue } from "../CreateModelDialogue";
import { modelIconMap } from "../../utils";

interface Props {
  title: string;
  type: string;
  models: ContentModel[];
}

export const ModelList = ({ title, models, type }: Props) => {
  const history = useHistory();
  const location = useLocation();

  const [sort, setSort] = useLocalStorage(
    `zesty:navSchema-${title}:sort`,
    "asc"
  );
  const [showCreateModelDialogue, setShowCreateModelDialogue] = useState(false);
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
    <>
      <Box>
        <Box display="flex" justifyContent="space-between" mb={1} ml={1}>
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
          <IconButton
            size="small"
            onClick={() => setShowCreateModelDialogue(true)}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
        {sortedModels?.length === 0 && (
          //@ts-expect-error need to add augmentation
          <Typography color="text.secondary" variant="body3">
            No {title} models present.
          </Typography>
        )}
        {sortedModels?.map((model) => {
          const selected = location.pathname.includes(model.ZUID);
          return (
            <ListItemButton
              key={model.ZUID}
              sx={{ py: "6px", px: "12px", borderRadius: "4px" }}
              selected={selected}
              onClick={() => history.push(`/schema/${model.ZUID}`)}
            >
              <ListItemIcon
                sx={{
                  minWidth: "unset",
                  mr: 1,
                  color: selected && "primary.main",
                }}
              >
                <SvgIcon
                  fontSize="small"
                  component={modelIconMap[model.type]}
                />
              </ListItemIcon>
              <ListItemText
                sx={{ m: 0 }}
                primary={model.label}
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
      {showCreateModelDialogue && (
        <CreateModelDialogue
          modelType={type}
          onClose={() => setShowCreateModelDialogue(false)}
        />
      )}
    </>
  );
};
