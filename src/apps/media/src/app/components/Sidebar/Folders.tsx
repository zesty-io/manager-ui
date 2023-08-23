import React, { useCallback } from "react";
import {
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  ThemeProvider,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Button,
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
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useLocalStorage } from "react-use";
import { useSelector } from "react-redux";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router";
import moment from "moment-timezone";

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
import { FolderMenu } from "../FolderMenu";

const SortMenuItems: { label: string; value: string }[] = [
  {
    label: "Name (A to Z)",
    value: "asc",
  },
  {
    label: "Name (Z to A)",
    value: "desc",
  },
  {
    label: "Last Created",
    value: "",
  },
];

interface Props {
  lockedToGroupId?: string;
}

export const Folders = ({ lockedToGroupId }: Props) => {
  const [folderMenuAnchorEl, setFolderMenuAnchorEl] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const history = useHistory();
  const location = useLocation();
  const [hiddenGroups, setHiddenGroups] = useState(
    JSON.parse(localStorage.getItem("zesty:navMedia:hidden"))
  );
  const [value, setValue] = useState(0);
  const [folderMenuData, setFolderMenuData] = useState<{
    id: string;
    groupId: string | null;
    title: string;
    binId: string | null;
  }>(null);
  const [openNewFolderDialog, setOpenNewFolderDialog] = useState(false);
  const [openDndFailedDialog, setOpenDndFailedDialog] = useState(false);
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const { data: bins } = useGetBinsQuery({ instanceId, ecoId });
  const [updateFile] = useUpdateFileMutation();
  const [sort, setSort] = useLocalStorage("zesty:navMedia:sort", "");
  const [hiddenExpanded, setHiddenExpanded] = useState([]);
  const [expanded, setExpanded] = useLocalStorage("zesty:navMedia:open", []);

  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    window.addEventListener("storage", () =>
      setHiddenGroups(JSON.parse(localStorage.getItem("zesty:navMedia:hidden")))
    );

    return () => {
      window.removeEventListener("storage", () => {});
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

  const sortItems = (rawItems: TreeItemType[], sortBy: string) => {
    if (sortBy === "asc" || sortBy === "desc") {
      return rawItems.sort((a, b) => {
        if (sortBy === "asc") {
          return a.label.localeCompare(b.label);
        } else if (sortBy === "desc") {
          return b.label.localeCompare(a.label);
        }
      });
    } else {
      return rawItems
        .sort((a, b) => a.label.localeCompare(b.label))
        .sort((a, b) => moment(b.createdAt).diff(a.createdAt));
    }
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
    const childItems = items
      ?.filter((item) => item[link] === id)
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
        hidden: hiddenGroup?.includes(item.id),
        nodeData: item,
        createdAt: item.created_at,
      }));

    return sortItems(childItems, sort);
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

        const items = [
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
            createdAt: rootNode.created_at,
          },
        ];

        return sortItems(items, sort);
      } else {
        const items = binGroups
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
                hidden: hiddenGroups?.includes(bins[idx].id),
                nodeData: bins[idx],
                createdAt: bins[idx].created_at,
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
                hidden: hiddenGroups?.includes(bins[idx].id),
                nodeData: bins[idx],
                createdAt: bins[idx].created_at,
              };
            }
          })
          .flat();

        return sortItems(items, sort);
      }
    }

    return [];
  }, [binGroups, sort, bins, hiddenGroups]);

  /* Creating a tree structure based on the hidden items. */
  const hiddenTrees: TreeItemType[] = useMemo(() => {
    if (binGroups && hiddenGroups?.length) {
      return hiddenGroups?.map((id: string) => {
        let rootGroup: Group[];
        let rootNode: Group | Bin;
        let binId: string;

        if (id.startsWith("1")) {
          rootGroup = binGroups.find((group: any) => group[0].bin_id === id);
          rootNode = bins.find((bin: any) => bin.id === id);
          binId = rootNode?.id;
        } else {
          rootGroup = binGroups?.filter((groups) =>
            groups?.some((group) => group.id === id)
          )?.[0];
          rootNode = rootGroup?.find((group) => group.id === id);
          binId = rootNode?.bin_id;
        }

        if (!rootNode) return;

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

  const handleItemDrop = useCallback((draggedItem, target) => {
    // Allow drag and drop of file when the target folder is in the same eco bin or is the actual eco bin root
    if (
      draggedItem.bin_id === target.bin_id ||
      (target.id.startsWith("1") && draggedItem.bin_id === target.id)
    ) {
      updateFile({
        id: draggedItem.id,
        previousGroupId: draggedItem.group_id,
        body: {
          group_id: target.id,
          filename: draggedItem.filename,
        },
      });
    } else {
      setOpenDndFailedDialog(true);
    }
  }, []);

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
        onItemDrop={handleItemDrop}
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
                px: 1.5,
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
          {SortMenuItems.map((menuItem) => (
            <MenuItem
              onClick={() => {
                closeMenu();
                setSort(menuItem.value);
              }}
              selected={sort === menuItem.value}
            >
              {menuItem.label}
            </MenuItem>
          ))}
        </Menu>
        {openNewFolderDialog && (
          <NewFolderDialog open onClose={() => setOpenNewFolderDialog(false)} />
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
        {openDndFailedDialog && (
          <Dialog
            open
            onClose={() => setOpenDndFailedDialog(false)}
            fullWidth
            maxWidth={"xs"}
          >
            <DialogTitle>
              <WarningAmberRoundedIcon
                color="warning"
                sx={{
                  padding: "8px",
                  borderRadius: "20px",
                  backgroundColor: "warning.light",
                  display: "block",
                  mb: 2,
                }}
              />
              Cannot move file to another eco-bin
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary">
                Currently Zesty lacks the ability to allow you to move files
                between eco-bins. If you desire this feature please contact
                support@zesty.io.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenDndFailedDialog(false)}
              >
                Okay
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </ThemeProvider>
    </>
  );
};
