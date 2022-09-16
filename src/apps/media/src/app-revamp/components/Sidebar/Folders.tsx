import { Box, Typography, IconButton } from "@mui/material";
import { TreeView, TreeItem } from "@mui/lab";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import LanguageIcon from "@mui/icons-material/Language";
import FolderIcon from "@mui/icons-material/Folder";
import { mediaManagerApi } from "../../../../../../shell/services/mediaManager";
import { useSelector } from "react-redux";
import { SyntheticEvent, useMemo } from "react";
import { useHistory, useLocation } from "react-router";

// @ts-ignore
const nest = (items: any, id, link = "group_id") =>
  items
    .filter((item: any) => item[link] === id)
    .map((item: any) => ({ ...item, children: nest(items, item.id) }));

type Params = { id: string };

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

  const { data: binGroups } = mediaManagerApi.useGetAllBinGroupsQuery(
    combinedBins?.map((bin) => bin.id),
    {
      skip: !bins?.length,
    }
  );

  const trees = useMemo(() => {
    if (binGroups) {
      return binGroups
        .map((binGroup, idx) => {
          if (!binGroup.length) {
            return { ...combinedBins[idx], children: [] };
          } else if (combinedBins[idx].eco_id) {
            return {
              ...combinedBins[idx],
              children: nest(binGroup, binGroup[0].bin_id),
            };
          } else {
            return nest(binGroup, binGroup[0].bin_id);
          }
        })
        .flat();
    } else {
      return [];
    }
  }, [binGroups]);

  const renderTree = (nodes: any) => (
    <TreeItem
      key={nodes.id}
      nodeId={nodes.id}
      sx={{ " .MuiTreeItem-content": { width: "unset" } }}
      label={
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component={nodes.eco_id ? LanguageIcon : FolderIcon}
            sx={{ mr: 1 }}
            color="action.active"
          />
          <Typography
            // @ts-expect-error body3 additional variant is not on Typography augmentation
            variant="body3"
            color="text.secondary"
            fontWeight={500}
            sx={{ wordBreak: "break-all" }}
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

  console.log("testing trees", trees);

  return (
    <>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 0.25, px: 2, py: 1 }}
      >
        <Typography variant="overline" color="text.secondary">
          FOLDERS
        </Typography>
        <IconButton size="small">
          <ArrowDropDownIcon />
        </IconButton>
      </Box>
      {/* @ts-ignore */}
      <TreeView
        onNodeSelect={(
          event: SyntheticEvent<Element, Event>,
          nodeIds: string[]
        ) => history.push(`/media/${nodeIds}`)}
        defaultCollapseIcon={
          <ArrowDropDownIcon sx={{ color: "action.active" }} />
        }
        defaultExpandIcon={<ArrowRightIcon sx={{ color: "action.active" }} />}
        sx={{ height: "100%", width: "100%", overflowY: "auto" }}
        selected={[location.pathname.split("/")[2]]}
      >
        {trees.map((tree: any) => renderTree(tree))}
      </TreeView>
    </>
  );
};
