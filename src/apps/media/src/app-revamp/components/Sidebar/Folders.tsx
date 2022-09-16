import { Box, Typography, IconButton } from "@mui/material";
import { TreeView, TreeItem } from "@mui/lab";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import FolderIcon from "@mui/icons-material/Folder";
import { mediaManagerApi } from "../../../../../../shell/services/mediaManager";
import { useSelector } from "react-redux";
import { useMemo } from "react";

// @ts-ignore
const nest = (items: any, id, link = "group_id") =>
  items
    .filter((item: any) => item[link] === id)
    .map((item: any) => ({ ...item, children: nest(items, item.id) }));

export const Folders = () => {
  const instanceId = useSelector((state: any) => state.instance.ID);
  const { data: bins } = mediaManagerApi.useGetSiteBinsQuery(instanceId);

  const { data: binGroups } = mediaManagerApi.useGetAllBinGroupsQuery(
    bins?.map((bin) => bin.id),
    {
      skip: !bins?.length,
    }
  );

  const trees = useMemo(() => {
    if (binGroups) {
      return binGroups
        .map((binGroup) => nest(binGroup, binGroup[0].bin_id))
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
          <Box component={FolderIcon} sx={{ mr: 1 }} color="action.active" />
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
      <TreeView
        defaultCollapseIcon={
          <ArrowDropDownIcon sx={{ color: "action.active" }} />
        }
        defaultExpanded={["root"]}
        defaultExpandIcon={<ArrowRightIcon sx={{ color: "action.active" }} />}
        sx={{ height: "100%", width: "100%", overflowY: "auto" }}
        selected={[]}
      >
        {trees.map((tree: any) => renderTree(tree))}
      </TreeView>
    </>
  );
};
