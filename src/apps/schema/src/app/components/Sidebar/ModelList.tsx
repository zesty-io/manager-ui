import { Stack, IconButton, Typography, Menu, MenuItem } from "@mui/material";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import moment from "moment";
import { theme } from "@zesty-io/material";

import { ContentModel } from "../../../../../../shell/services/types";
import { useLocation } from "react-router";
import { useMemo, useState } from "react";
import { useLocalStorage } from "react-use";
import { CreateModelDialogue } from "../CreateModelDialogue";
import { modelIconMap } from "../../utils";
import { NavTree, TreeItem } from "../../../../../../shell/components/NavTree";
import { ModelMenu } from "../ModelMenu";
import { capitalize } from "lodash";

interface Props {
  title: string;
  type: string;
  models: ContentModel[];
  app?: string;
}

export const ModelList = ({ title, models, type, app = "schema" }: Props) => {
  const location = useLocation();

  const [sort, setSort] = useLocalStorage(
    `zesty:nav${capitalize(app)}-${title}:sort`,
    "asc"
  );
  const [modelZUID, setModelZUID] = useState("");
  const [showCreateModelDialogue, setShowCreateModelDialogue] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [modelMenuAnchorEl, setModelMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleSortMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const mappedModels: TreeItem[] = useMemo(() => {
    if (models.length) {
      return models.map((model) => {
        return {
          icon: modelIconMap[model.type],
          children: [],
          label: model.label,
          path: `/${app}/${model.ZUID}`,
          actions: [
            <IconButton
              data-cy="tree-item-hide"
              key="tree-item-hide"
              size="xxsmall"
              onClick={(evt) => {
                evt.stopPropagation();

                setModelMenuAnchorEl(evt.currentTarget);
                setModelZUID(model.ZUID);
              }}
            >
              <MoreHorizRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>,
          ],
          ZUID: model.ZUID,
          updatedAt: model.updatedAt,
        };
      });
    }

    return [];
  }, [models]);

  const sortedModels = useMemo(() => {
    if (!sort) return [...mappedModels].reverse();
    return [...mappedModels].sort((a, b) => {
      switch (sort) {
        case "asc":
          return a.label.localeCompare(b.label);

        case "desc":
          return b.label.localeCompare(a.label);

        case "modified":
          return moment(b.updatedAt).diff(moment(a.updatedAt));
      }
    });
  }, [sort, mappedModels]);

  return (
    <>
      <NavTree
        id={`${app}-nav-${type}`}
        tree={sortedModels}
        selected={location.pathname.split("/").slice(0, 3).join("/")}
        HeaderComponent={
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            px={1.5}
            pb={1.5}
            sx={{
              color: "text.secondary",
            }}
          >
            <Stack direction="row" alignItems="center" gap={0.5}>
              <Typography variant="body2" textTransform="uppercase">
                {title}
              </Typography>
              <IconButton size="xxsmall" onClick={handleSortMenuClick}>
                <ArrowDropDownRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Stack>
            <IconButton
              onClick={() => setShowCreateModelDialogue(true)}
              size="xxsmall"
              data-cy={`create-model-button-sidebar-${type}`}
            >
              <AddRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        }
      />

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          selected={sort === "asc"}
          onClick={() => {
            handleClose();
            setSort("asc");
          }}
        >
          Name (A to Z)
        </MenuItem>
        <MenuItem
          selected={sort === "desc"}
          onClick={() => {
            handleClose();
            setSort("desc");
          }}
        >
          Name (Z to A)
        </MenuItem>
        <MenuItem
          selected={!sort}
          onClick={() => {
            handleClose();
            setSort("");
          }}
        >
          Last Created
        </MenuItem>
        <MenuItem
          selected={sort === "modified"}
          onClick={() => {
            handleClose();
            setSort("modified");
          }}
        >
          Last Modified
        </MenuItem>
      </Menu>

      {showCreateModelDialogue && (
        <CreateModelDialogue
          typeIsSet={true}
          modelType={type}
          onClose={() => setShowCreateModelDialogue(false)}
        />
      )}
      <ModelMenu
        anchorEl={modelMenuAnchorEl}
        modelZUID={modelZUID}
        onClose={() => {
          setModelMenuAnchorEl(null);
        }}
      />
    </>
  );
};
