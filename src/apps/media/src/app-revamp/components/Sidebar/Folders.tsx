import { Box, Typography, IconButton } from "@mui/material";
import { TreeView, TreeItem } from "@mui/lab";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import LanguageIcon from "@mui/icons-material/Language";
import FolderIcon from "@mui/icons-material/Folder";
import { mediaManagerApi } from "../../../../../../shell/services/mediaManager";
import { useSelector } from "react-redux";
import { SyntheticEvent, useEffect, useMemo } from "react";
import { useHistory, useLocation } from "react-router";

/**
 * It takes an array of items, an id, and a link, and returns a new array of items with the children of
 * the item with the given id nested under it
 * @param {any} items - The array of items to nest.
 * @param {string} id - The id of the group you want to nest
 * @param [link=group_id] - The name of the property that links the items together.
 */
const nest = (items: any, id: string, link = "group_id") =>
  items
    .filter((item: any) => item[link] === id)
    .sort((a: any, b: any) => a.name.localeCompare(b.name))
    .map((item: any) => ({ ...item, children: nest(items, item.id) }));

export const Folders = () => {
  const history = useHistory();
  const location = useLocation();
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const { data: bins } = mediaManagerApi.useGetSiteBinsQuery(instanceId);
  const { data: ecoBins } = mediaManagerApi.useGetEcoBinsQuery(ecoId, {
    skip: !ecoId,
  });

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
      console.log("testing binGroups", binGroups);
      return binGroups
        .map((binGroup, idx) => {
          if (!binGroup.length) {
            return { ...combinedBins[idx], children: [] };
          } else if (combinedBins[idx].eco_id || binGroups.length > 1) {
            console.log("testing binGroup", binGroup);
            return {
              ...combinedBins[idx],
              children: nest(binGroup, binGroup[0].bin_id),
            };
          } else {
            return nest(binGroup, binGroup[0].bin_id);
          }
        })
        .flat()
        .sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return [];
    }
  }, [binGroups]);

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
            component={nodes.eco_id ? LanguageIcon : FolderIcon}
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
        sx={{ display: "flex", alignItems: "center", gap: 0.25, px: 2, py: 1 }}
      >
        <Typography variant="overline" color="text.secondary">
          FOLDERS
        </Typography>
        <IconButton size="small">
          <ArrowDropDownIcon fontSize="small" />
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
    </>
  );
};
