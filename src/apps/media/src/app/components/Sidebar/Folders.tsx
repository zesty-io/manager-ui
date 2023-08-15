import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  ThemeProvider,
} from "@mui/material";
import { FolderRounded } from "@mui/icons-material";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import {
  FolderGlobal,
  theme,
  IconButton as IconButtonCustom,
} from "@zesty-io/material";
import FolderIcon from "@mui/icons-material/Folder";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useLocalStorage } from "react-use";
import { useSelector } from "react-redux";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router";

import {
  mediaManagerApi,
  useGetBinsQuery,
  useUpdateFileMutation,
} from "../../../../../../shell/services/mediaManager";
import { NewFolderDialog } from "../NewFolderDialog";
import {
  NavTree,
  TreeItem as TreeItemType,
} from "../../../../../../shell/components/NavTree";
import { Bin, Group } from "../../../../../../shell/services/types";
import { UploadButton } from "../UploadButton";
import { FolderMenu } from "../FolderMenu";

interface Props {
  lockedToGroupId?: string;
}

export const Folders = React.memo(({ lockedToGroupId }: Props) => {
  const [folderMenuAnchorEl, setFolderMenuAnchorEl] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const history = useHistory();
  const location = useLocation();
  const id = location.pathname.split("/")[2];
  const hiddenGroups =
    JSON.parse(localStorage.getItem("zesty:navMedia:hidden")) || [];
  const [value, setValue] = useState(0);
  const [folderMenuData, setFolderMenuData] = useState<{
    id: string;
    groupId: string | null;
    title: string;
    binId: string | null;
  }>(null);
  const [openNewFolderDialog, setOpenNewFolderDialog] = useState(false);
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const { data: bins } = useGetBinsQuery({ instanceId, ecoId });
  const [updateFile] = useUpdateFileMutation();
  const [sort, setSort] = useLocalStorage("zesty:navMedia:sort", "asc");
  const [hiddenExpanded, setHiddenExpanded] = useState([]);
  const [expanded, setExpanded] = useLocalStorage("zesty:navMedia:open", []);

  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    window.addEventListener("storage", (evt) =>
      setValue((prevCount) => prevCount + 1)
    );

    return () => {
      window.removeEventListener("storage", (evt) =>
        setValue((prevCount) => prevCount + 1)
      );
    };
  }, []);

  const { data: binGroups, isLoading } =
    mediaManagerApi.useGetAllBinGroupsQuery(
      bins?.map((bin) => bin.id),
      {
        skip: !bins?.length,
      }
    );

  const renderActions = ({
    id,
    title,
    groupId,
    path,
    binId,
  }: {
    id: string;
    title: string;
    binId: string;
    path: string;
    groupId?: string;
  }) => {
    return [
      <IconButton
        data-cy="tree-item-hide"
        key="tree-item-hide"
        size="xxsmall"
        onClick={(e) => {
          e.stopPropagation();

          setFolderMenuAnchorEl(e.currentTarget);
          setFolderMenuData({ id, groupId, title, binId });
        }}
      >
        <MoreHorizRoundedIcon sx={{ fontSize: 16 }} />
      </IconButton>,
      <IconButtonCustom
        data-cy="tree-item-add-new-content"
        key="tree-item-add-new-content"
        variant="contained"
        size="xxsmall"
        onClick={(e) => {
          e.stopPropagation();
          history.push(`${path}?triggerUpload=true`, { from: path });
        }}
      >
        <FileUploadRoundedIcon sx={{ fontSize: 16 }} />
      </IconButtonCustom>,
    ];
  };

  /**
   * It takes an array of items, an id, and a link, and returns a new array of items with the children of
   * the item with the given id nested under it
   * @param {any} items - The array of items to nest.
   * @param {string} id - The id of the group you want to nest
   * @param [link=group_id] - The name of the property that links the items together.
   */
  const nest = (
    items: Group[],
    id: string,
    link: keyof Group,
    sort: string,
    hiddenGroup: string[],
    binId: string
  ): TreeItemType[] => {
    return items
      ?.filter((item) => item[link] === id)
      ?.sort((a, b) => {
        if (!sort) return;
        return sort === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      })
      ?.map((item) => ({
        icon: FolderRounded,
        children: nest(items, item.id, link, sort, hiddenGroup, binId),
        path: `/media/folder/${item.id}`,
        label: item.name,
        actions: renderActions({
          id: item.id,
          title: item.name,
          groupId: item.group_id,
          binId,
          path: `/media/folder/${item.id}`,
        }),
        hidden: hiddenGroup.includes(item.id),
        nodeData: item,
      }));
  };

  const mappedTree: TreeItemType[] = useMemo(() => {
    if (binGroups?.length) {
      if (lockedToGroupId) {
        let rootGroup = [];
        let rootNode: Group;

        rootGroup = binGroups?.filter((groups) =>
          groups?.some((group) => group.id === lockedToGroupId)
        )?.[0];

        if (!rootGroup) return [];

        rootNode = rootGroup?.find((group) => group.id === lockedToGroupId);

        return [
          {
            icon: FolderRounded,
            path: `/media/folder/${rootNode?.id}`,
            label: rootNode?.name,
            actions: renderActions({
              id: rootNode?.id,
              title: rootNode?.name,
              binId: rootNode.bin_id,
              path: `/media/folder/${rootNode?.id}`,
            }),
            children: nest(
              rootGroup,
              lockedToGroupId,
              "group_id",
              sort,
              hiddenGroups,
              rootNode.bin_id
            ),
            nodeData: rootNode,
          },
        ];
      } else {
        return binGroups
          .filter((binGroup) => (bins.length > 1 ? true : binGroup?.length))
          .map((binGroup, idx) => {
            if (!binGroup.length) {
              return {
                icon: FolderGlobal,
                children: [],
                path: `/media/folder/${bins[idx].id}`,
                label: bins[idx].name,
                actions: renderActions({
                  id: bins[idx].id,
                  title: bins[idx].name,
                  binId: bins[idx].id,
                  path: `/media/folder/${bins[idx].id}`,
                }),
                hidden: hiddenGroups.includes(bins[idx].id),
              };
            } else {
              return {
                icon: FolderGlobal,
                children: nest(
                  binGroup,
                  binGroup[0].bin_id,
                  "group_id",
                  sort,
                  hiddenGroups,
                  bins[idx].id
                ),
                path: `/media/folder/${bins[idx].id}`,
                label: bins[idx].name,
                actions: renderActions({
                  id: bins[idx].id,
                  title: bins[idx].name,
                  binId: bins[idx].id,
                  path: `/media/folder/${bins[idx].id}`,
                }),
                hidden: hiddenGroups.includes(bins[idx].id),
              };
            }
          })
          .flat()
          .sort((a, b) => {
            if (!sort) return;
            return sort === "asc"
              ? a.label.localeCompare(b.label)
              : b.label.localeCompare(a.label);
          });
      }
    }

    return [];
  }, [binGroups, sort, bins, hiddenGroups]);

  /* Creating a tree structure based on the hidden items. */
  const hiddenTrees: TreeItemType[] = useMemo(() => {
    if (binGroups && hiddenGroups.length) {
      return hiddenGroups.map((id: string) => {
        let rootGroup: Group[];
        let rootNode: Group | Bin;
        let binId: string;

        if (id.startsWith("1")) {
          rootGroup = binGroups.find((group: any) => group[0].bin_id === id);
          rootNode = bins.find((bin: any) => bin.id === id);
          binId = rootNode.id;
        } else {
          rootGroup = binGroups?.filter((groups) =>
            groups?.some((group) => group.id === id)
          )?.[0];
          rootNode = rootGroup?.find((group) => group.id === id);
          binId = rootNode.bin_id;
        }

        return {
          icon: FolderIcon,
          path: `/media/folder/${rootNode.id}`,
          label: rootNode.name,
          actions: renderActions({
            id: rootNode?.id,
            title: rootNode?.name,
            binId,
            path: `/media/folder/${rootNode.id}`,
          }),
          children: nest(rootGroup, id, "group_id", sort, hiddenGroups, binId),
          nodeData: rootNode,
        };
      });
    } else {
      return [];
    }
  }, [binGroups, hiddenGroups, sort]);

  useEffect(() => {
    // Sets ecobins open by default
    if (!!bins?.length) {
      const ecoBins = bins?.map((bin) => `/media/folder/${bin.id}`);

      if (ecoBins?.length) {
        setExpanded([...expanded, ...ecoBins]);
      }
    }
  }, [bins]);

  return (
    <>
      <NavTree
        id="media-main-nav"
        selected={location.pathname}
        tree={mappedTree}
        expandedItems={expanded}
        onToggleCollapse={(paths) => setExpanded(paths)}
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
                Folders
              </Typography>
              <IconButton size="xxsmall" onClick={openMenu}>
                <ArrowDropDownRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
            <IconButton
              data-cy="createNewMediaFolder"
              onClick={() => setOpenNewFolderDialog(true)}
              size="xxsmall"
            >
              <AddRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        }
        onItemDrop={(draggedItem, target) => {
          if (draggedItem.bin_id === target.bin_id) {
            updateFile({
              id: draggedItem.id,
              previousGroupId: draggedItem.group_id,
              body: {
                group_id: target.id,
                filename: draggedItem.filename,
              },
            });
          }
        }}
        dragAndDrop
      />
      {!lockedToGroupId && (
        <Accordion
          elevation={0}
          sx={{
            mt: 1.5,
            "&.Mui-expanded": {
              mt: 1.5,
            },
            "&:before": {
              display: "none",
            },
            "&.MuiPaper-root": {
              backgroundColor: "transparent",
              backgroundImage: "none",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ArrowDropDownRoundedIcon fontSize="small" />}
            sx={{
              "&.MuiButtonBase-root": {
                minHeight: 20,
                mb: 1.5,
                "&.Mui-expanded": {
                  height: 20,
                },
              },
              "& .MuiAccordionSummary-content": {
                m: 0,
                "&.Mui-expanded": {
                  m: 0,
                },
              },
              "& .MuiAccordionSummary-expandIconWrapper": {
                transform: "rotate(-90deg)",
                "&.Mui-expanded": {
                  transform: "rotate(0deg)",
                },
              },
            }}
          >
            <Typography
              variant="body2"
              textTransform="uppercase"
              color="text.secondary"
            >
              Hidden Items
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              p: 0,
            }}
          >
            <NavTree
              id="media-hidden-nav"
              isHiddenTree
              tree={hiddenTrees}
              selected={location.pathname}
              expandedItems={hiddenExpanded}
              onToggleCollapse={(paths) => setHiddenExpanded(paths)}
              dragAndDrop
              onItemDrop={(draggedItem, target) => {
                if (draggedItem.bin_id === target.bin_id) {
                  updateFile({
                    id: draggedItem.id,
                    previousGroupId: draggedItem.group_id,
                    body: {
                      group_id: target.id,
                      filename: draggedItem.filename,
                    },
                  });
                }
              }}
            />
          </AccordionDetails>
        </Accordion>
      )}
      <ThemeProvider theme={theme}>
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
          <MenuItem
            onClick={() => {
              closeMenu();
              setSort("");
            }}
          >
            Last Created
          </MenuItem>
        </Menu>
        {openNewFolderDialog && (
          <NewFolderDialog
            open
            onClose={() => setOpenNewFolderDialog(false)}
            id={id}
            binId={
              (id?.startsWith("1") ? id : null) ||
              binGroups?.flat()?.find((binGroup) => binGroup.id === id)
                ?.bin_id ||
              bins?.find((bin) => bin.default)?.id
            }
          />
        )}
        <FolderMenu
          anchorEl={folderMenuAnchorEl}
          onCloseMenu={() => {
            setFolderMenuAnchorEl(null);
          }}
          groupId={folderMenuData?.groupId}
          id={folderMenuData?.id}
          title={folderMenuData?.title}
          binId={folderMenuData?.binId}
        />
      </ThemeProvider>
    </>
  );
});
