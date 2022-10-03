import { Box, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import { TreeView, TreeItem } from "@mui/lab";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { FolderGlobal } from "@zesty-io/material";
import FolderIcon from "@mui/icons-material/Folder";
import AddIcon from "@mui/icons-material/Add";
import { mediaManagerApi } from "../../../../../../shell/services/mediaManager";
import { useSelector } from "react-redux";
import { MouseEvent, SyntheticEvent, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { NewFolderDialog } from "../NewFolderDialog";

/**
 * It takes an array of items, an id, and a link, and returns a new array of items with the children of
 * the item with the given id nested under it
 * @param {any} items - The array of items to nest.
 * @param {string} id - The id of the group you want to nest
 * @param [link=group_id] - The name of the property that links the items together.
 */
const nest = (items: any, id: string, link: string, sort: string) =>
  items
    .filter((item: any) => item[link] === id)
    .sort((a: any, b: any) =>
      sort === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    )
    .map((item: any) => ({
      ...item,
      children: nest(items, item.id, link, sort),
    }));

export const Folders = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const history = useHistory();
  const location = useLocation();
  const [openNewFolderDialog, setOpenNewFolderDialog] = useState(false);
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const { data: bins } = mediaManagerApi.useGetSiteBinsQuery(instanceId);
  const { data: ecoBins } = mediaManagerApi.useGetEcoBinsQuery(ecoId, {
    skip: !ecoId,
  });
  const [sort, setSort] = useState("asc");

  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };

  const combinedBins = [...(ecoBins || []), ...(bins || [])];

  const { data: binGroups, isLoading } =
    mediaManagerApi.useGetAllBinGroupsQuery(
      combinedBins?.map((bin) => bin.id),
      {
        skip: !bins?.length,
      }
    );

  /* Creating a tree structure from the data. */
  const trees = useMemo(() => {
    if (binGroups) {
      return binGroups
        .map((binGroup, idx) => {
          if (!binGroup.length) {
            return { ...combinedBins[idx], children: [] };
          } else if (combinedBins[idx].eco_id || binGroups.length > 1) {
            return {
              ...combinedBins[idx],
              children: nest(binGroup, binGroup[0].bin_id, "group_id", sort),
            };
          } else {
            return nest(binGroup, binGroup[0].bin_id, "group_id", sort);
          }
        })
        .flat()
        .sort((a, b) =>
          sort === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );
    } else {
      return [];
    }
  }, [combinedBins, binGroups]);

  /* Creating a path to the selected folder. */
  const selectedPath = useMemo(() => {
    const id = location.pathname.split("/")[2];
    const path = [];
    let done = false;

    if (id && trees.length) {
      let currId = id;
      while (!done) {
        const node = binGroups.flat().find((group) => group.id === currId);
        if (node) {
          path.push(node.id);
          currId = node.group_id;
        } else {
          path.push(binGroups.flat().find((group) => group.id === id)?.bin_id);
          done = true;
        }
      }
      return path.reverse();
    }

    return [];
  }, [trees]);

  const renderTree = (nodes: any) => (
    <TreeItem
      key={nodes.id}
      nodeId={nodes.id}
      sx={{
        " .MuiTreeItem-content": {
          width: "unset",
        },
        ".Mui-selected": {
          " .MuiTreeItem-label .MuiSvgIcon-root": {
            color: "primary.main",
          },
          ".MuiTypography-root": {
            color: "primary.dark",
          },
        },
      }}
      label={
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component={nodes.eco_id ? FolderGlobal : FolderIcon}
            sx={{
              mr: 1,
              ".Mui-selected": {
                color: "primary.main",
              },
            }}
            color="action.active"
          />
          <Typography
            // @ts-expect-error body3 additional variant is not on Typography augmentation
            variant="body3"
            color="text.secondary"
            fontWeight={500}
            sx={{
              wordBreak: "break-all",
              ".Mui-selected": {
                color: "primary.dark",
              },
            }}
          >
            {nodes.name}
          </Typography>
        </Box>
      }
    >
      {Array.isArray(nodes.children)
        ? nodes.children.map((node: any) => renderTree(node))
        : null}
    </TreeItem>
  );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          <Typography variant="overline" color="text.secondary">
            FOLDERS
          </Typography>
          <IconButton size="small" onClick={openMenu}>
            <ArrowDropDownIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={closeMenu}>
            <MenuItem
              onClick={() => {
                closeMenu();
                setSort("asc");
              }}
            >
              Name (A to Z)
            </MenuItem>
            <MenuItem
              onClick={() => {
                closeMenu();
                setSort("desc");
              }}
            >
              Name (Z to A)
            </MenuItem>
          </Menu>
        </Box>
        <IconButton size="small" onClick={() => setOpenNewFolderDialog(true)}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
      {!isLoading ? (
        <TreeView
          onNodeSelect={(
            event: SyntheticEvent<Element, Event>,
            nodeIds: string[]
          ) => history.push(`/media/${nodeIds}`)}
          defaultCollapseIcon={
            <ArrowDropDownIcon sx={{ color: "action.active" }} />
          }
          defaultExpandIcon={<ArrowRightIcon sx={{ color: "action.active" }} />}
          defaultExpanded={selectedPath}
          sx={{ height: "100%", width: "100%", overflowY: "auto" }}
          selected={[location.pathname.split("/")[2]]}
        >
          {trees.map((tree: any) => renderTree(tree))}
        </TreeView>
      ) : null}
      <NewFolderDialog
        open={openNewFolderDialog}
        onClose={() => setOpenNewFolderDialog(false)}
        binId={bins?.find((bin) => bin.default)?.id}
      />
    </>
  );
};
