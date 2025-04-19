import { FC, useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { usePermission } from "../../../../../../shell/hooks/use-permissions";
import { useDispatch } from "react-redux";
import { NavTree, TreeItem } from "../../../../../../shell/components/NavTree";
import { fetchFiles, publishFile } from "../../../store/files";
import { CircularProgress } from "@mui/material";
import { fetchAuditTrail } from "../../../store/auditTrail";
import { FileNodeProps, NavCodeTypes } from "../constants";

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
  tree: FileNodeProps[];
  isSearched?: boolean;
};

const ActionsButton = ({
  ZUID,
  status,
  dispatch,
  fileType,
}: {
  ZUID: string;
  status: string;
  dispatch: any;
  fileType: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <IconButton
      key="publish"
      color="inherit"
      size="xsmall"
      sx={{
        transform: "translateX(5px)",
      }}
      onClick={() => {
        setIsLoading(true);
        dispatch(publishFile(ZUID, status))
          .then(() => {
            dispatch(fetchFiles(fileType));
            dispatch(fetchAuditTrail(ZUID));
          })
          .finally(() => {
            setIsLoading(false);
          });
      }}
    >
      {isLoading ? (
        <CircularProgress size="16px" />
      ) : (
        <CloudUploadRoundedIcon
          sx={{
            fontSize: 16,
            color: (theme) => `${theme.palette.grey[500]}!important`,
          }}
        />
      )}
    </IconButton>
  );
};

const FileNav: FC<FileNavProps> = ({
  id,
  group,
  createFile,
  orderFiles,
  header,
  toolTip,
  tree,
  isSearched = false,
}) => {
  const dispatch = useDispatch();
  const canPublish = usePermission("PUBLISH");
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState<string[] | null>(null);
  const didAutoExpand = useRef(false);
  const expandedFolders = useRef<Set<string>>(new Set());
  const [treeData, dirPaths] = useMemo(() => {
    const directoryPaths: string[] = [];

    const createTreeItemData = (treeItem: NavCodeTypes): TreeItem => {
      const {
        path,
        icon,
        label,
        type,
        isLive,
        version,
        publishedVersion,
        children,
        ...treeData
      } = treeItem;

      const isDir: boolean = type === "directory";
      const itemLocation = `/code/file/${group}`;
      const itemPath = path?.trim()?.replace(/^\/+/, "");
      const filePath = isDir ? `${itemLocation}/${itemPath}` : `/${itemPath}`;

      if (isDir) directoryPaths.push(filePath);

      const actions =
        canPublish && !isLive && version > publishedVersion
          ? [
              <ActionsButton
                key="publish"
                ZUID={treeItem?.ZUID}
                status={treeItem?.status}
                dispatch={dispatch}
                fileType={group}
              />,
            ]
          : [];

      return {
        icon,
        path: filePath,
        label,
        children: children?.map(createTreeItemData),
        actions,
        nodeData: { ...treeData, navSource: "code", isDir },
      };
    };

    const treeItems = tree?.map((item) => createTreeItemData(item));
    return [treeItems, directoryPaths];
  }, [tree, group, canPublish, dispatch]);

  useEffect(() => {
    if (isSearched) {
      setExpanded(dirPaths);
      didAutoExpand.current = false;
      return;
    }

    if (!didAutoExpand.current && dirPaths.length) {
      setExpanded(dirPaths);
      didAutoExpand.current = true;
    }
  }, [dirPaths, isSearched]);

  useEffect(() => {
    const newDirPaths: string[] = [];

    const collectDirs = (items: TreeItem[] = []) => {
      items.forEach((item) => {
        if (item?.nodeData?.isDir) {
          newDirPaths.push(item.path);
          collectDirs(item.children);
        }
      });
    };

    collectDirs(treeData as TreeItem[]);
    const foldersToExpand = newDirPaths.filter(
      (path) => !expandedFolders.current.has(path)
    );

    if (foldersToExpand.length) {
      setExpanded((prev) => {
        const merged = [...prev, ...foldersToExpand];
        merged.forEach((path) => expandedFolders.current.add(path));
        return merged;
      });
    }
  }, [treeData]);

  const handleToggleCollapse = (nodeIds: string[]) => {
    nodeIds.forEach((path) => expandedFolders.current.add(path));
    setExpanded(nodeIds);
  };

  return (
    <>
      {!!treeData?.length && (
        <Box>
          <NavTree
            id={id}
            tree={treeData}
            selected={
              !!expanded || !!didAutoExpand.current
                ? pathname?.replace(/\/diff.*/, "")
                : ""
            }
            expandedItems={expanded}
            onToggleCollapse={handleToggleCollapse}
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
