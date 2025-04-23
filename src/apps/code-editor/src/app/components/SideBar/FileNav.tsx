import { FC, useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import { NavTree, TreeItem } from "../../../../../../shell/components/NavTree";

const CreateFileToolTip = {
  views: "Create View",
  stylesheets: "Create Stylesheet",
  scripts: "Create Script",
};

type FileNavProps = {
  id: string;
  group: "views" | "stylesheets" | "scripts";
  createFile?: () => void;
  orderFiles?: () => void;
  header: string;
  toolTip: string;
  tree: TreeItem[];
  dirList: string[];
  isLoading?: boolean;
  searchTerm?: string;
};

const filterTreeData = (
  treeData: TreeItem[] = [],
  keyword: string = ""
): { tree: TreeItem[]; dir: string[] } => {
  const normalizedKeyword = keyword.toLowerCase().trim();
  const dirList: string[] = [];
  const tree = treeData
    .map((item) => {
      const { ZUID, isDir, fileName, contentModelType, contentModelZUID } =
        item?.nodeData;
      const searchString = [
        ZUID,
        fileName,
        item?.label,
        item?.path,
        contentModelZUID,
        contentModelType,
      ]
        .filter(Boolean)
        .join("\n")
        .toLowerCase();

      if (isDir) {
        dirList.push(item?.path);
      }

      const isFound = searchString.includes(normalizedKeyword);
      if (!isDir && !isFound) return null;
      const itemChildren = filterTreeData(item?.children, keyword);
      if (isDir && !itemChildren?.tree?.length && !isFound) return null;
      return {
        ...item,
        children: itemChildren.tree,
      };
    })
    .filter(Boolean);

  return { tree, dir: dirList };
};
const FileNav: FC<FileNavProps> = ({
  id,
  group,
  createFile,
  orderFiles,
  header,
  toolTip,
  tree,
  dirList = [],
  searchTerm = "",
}) => {
  let { pathname } = useLocation();
  const [expanded, setExpanded] = useState<string[] | null>(dirList);
  const [searchExpanded, setSearchExpanded] = useState<string[] | null>(null);

  const treeData = useMemo(() => {
    const { tree: treeRaw } = filterTreeData(tree, searchTerm);
    if (!searchTerm) {
      setSearchExpanded(null);
    } else {
      if (!searchExpanded) {
        setSearchExpanded(dirList);
      }
    }
    return treeRaw;
  }, [tree, searchTerm, searchExpanded]);

  return (
    <>
      {treeData?.length > 0 && (
        <Box width="100%">
          <NavTree
            id={id}
            tree={treeData}
            selected={pathname?.replace(/\/diff.*/, "")}
            expandedItems={!!searchTerm ? searchExpanded : expanded}
            onToggleCollapse={(nodeIds) => {
              if (!!searchTerm) {
                setSearchExpanded(nodeIds);
              } else {
                setExpanded(nodeIds);
              }
            }}
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
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={0.5}
                  flexGrow={1}
                >
                  <Typography variant="body2" textTransform="uppercase">
                    {header}
                  </Typography>
                  <Tooltip
                    placement="top-start"
                    title={toolTip}
                    enterDelay={500}
                    enterNextDelay={500}
                    componentsProps={{
                      popper: {
                        sx: {
                          "& .MuiTooltip-tooltip": {
                            bgcolor: "grey.800",
                          },
                        },
                      },
                    }}
                  >
                    <InfoRoundedIcon
                      sx={{ width: 12, height: 12, color: "text.secondary" }}
                    />
                  </Tooltip>
                </Stack>
                <Stack direction="row" alignItems="center" gap={1} flexGrow={0}>
                  {group !== "views" && (
                    <Tooltip
                      placement="top"
                      title="Change combine and pre-process order"
                      enterDelay={1000}
                      enterNextDelay={1000}
                      componentsProps={{
                        popper: {
                          sx: {
                            "& .MuiTooltip-tooltip": {
                              bgcolor: "grey.800",
                            },
                          },
                        },
                      }}
                    >
                      <IconButton onClick={() => orderFiles()} size="xxsmall">
                        <ReorderRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip
                    placement="top-end"
                    title={CreateFileToolTip[group]}
                    enterDelay={1000}
                    enterNextDelay={1000}
                    componentsProps={{
                      popper: {
                        sx: {
                          "& .MuiTooltip-tooltip": {
                            bgcolor: "grey.800",
                          },
                        },
                      },
                    }}
                  >
                    <IconButton
                      onClick={() => createFile && createFile()}
                      size="xxsmall"
                    >
                      <AddRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            }
          />
        </Box>
      )}
    </>
  );
};

export default FileNav;
