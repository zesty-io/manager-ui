import { FC, useState, useMemo } from "react";
import { useLocation } from "react-router";
import {
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  SvgIcon,
} from "@mui/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FileNodeProps, NavCodeTypes } from "./constants";
import { usePermission } from "../../../../../../shell/hooks/use-permissions";
import { fetchFiles, publishFile } from "../../../store/files";
import { useDispatch } from "react-redux";
import { NavTree, TreeItem } from "../../../../../../shell/components/NavTree";

type FileNavProps = {
  id: string;
  group: "views" | "stylesheets" | "scripts";
  createFile?: () => void;
  orderFiles?: () => void;
  header: string;
  toolTip: string;
  tree: FileNodeProps[];
};

const createIcon = (icon: any) => {
  if (!icon) return null;
  const {
    icon: [width, height, , , svgPathData],
  } = icon;
  return () => (
    <SvgIcon
      viewBox={`0 0 ${width} ${height}`}
      sx={{ height: "14px", width: "14px", mr: 0.75 }}
    >
      {typeof svgPathData === "string" ? (
        <path d={svgPathData} />
      ) : (
        svgPathData.map((d: string, i: number) => (
          <path style={{ opacity: i === 0 ? 0.4 : 1 }} d={d} />
        ))
      )}
    </SvgIcon>
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
}) => {
  const dispatch = useDispatch();
  const canPublish = usePermission("PUBLISH");
  let { pathname } = useLocation();
  const [expanded, setExpanded] = useState<string[]>([]);

  const treeData = useMemo(() => {
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
      const itemLocation: string = `/code/file/${group}`;
      const itemPath: string = path?.trim()?.replace(/^\/+/, "");

      const filePath: string = isDir
        ? `${itemLocation}/${itemPath}`
        : `/${itemPath}`;

      if (isDir) setExpanded((prev) => [...prev, `/code/file/views/${path}`]);

      const actions =
        canPublish &&
        !treeItem.isLive &&
        treeItem?.version > treeItem?.publishedVersion
          ? [
              <IconButton
                key="publish"
                color="inherit"
                size="xsmall"
                onClick={() => {
                  dispatch(publishFile(treeItem?.ZUID, treeItem?.status));
                }}
              >
                <CloudUploadRoundedIcon
                  sx={{ fontSize: 14, color: "grey!important" }}
                />
              </IconButton>,
            ]
          : [];

      return {
        icon: createIcon(treeItem?.icon),
        path: filePath,
        label: treeItem?.label,
        children: treeItem?.children?.map((child: NavCodeTypes) =>
          createTreeItemData(child)
        ),
        actions: actions,
        nodeData: { ...treeData, navSource: "code", isDir },
      };
    };

    return tree?.map((item) => createTreeItemData(item as NavCodeTypes));
  }, [tree, group, canPublish, dispatch]);

  return (
    <>
      {!!treeData?.length && (
        <Box>
          <NavTree
            id={id}
            tree={treeData}
            selected={pathname}
            expandedItems={expanded}
            onToggleCollapse={(nodeIds) => {
              setExpanded(nodeIds);
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
                    enterDelay={1000}
                    enterNextDelay={1000}
                  >
                    <InfoRoundedIcon
                      sx={{ width: 12, height: 12, color: "action.active" }}
                    />
                  </Tooltip>
                </Stack>
                <Stack direction="row" alignItems="center" gap={1} flexGrow={0}>
                  {group !== "views" && (
                    <Tooltip
                      placement="top-end"
                      title="Change combine and pre-process order"
                      enterDelay={1000}
                      enterNextDelay={1000}
                    >
                      <IconButton onClick={() => orderFiles()} size="xxsmall">
                        <ReorderRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip
                    placement="top-end"
                    title={`Create ${header}`}
                    enterDelay={1000}
                    enterNextDelay={1000}
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
