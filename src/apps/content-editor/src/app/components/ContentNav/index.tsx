import { useRef, useMemo, useEffect, useState } from "react";
import {
  Stack,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  InputAdornment,
  ListItemButton,
  SvgIcon,
  Tooltip,
  IconButton,
  AccordionSummary,
  AccordionDetails,
  Accordion,
} from "@mui/material";
import {
  SvgIconComponent,
  BackupTableRounded,
  ScheduleRounded,
} from "@mui/icons-material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchIcon from "@mui/icons-material/Search";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import HomeIcon from "@mui/icons-material/Home";
import { FileTable } from "@zesty-io/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { MenuListDropDown } from "@zesty-io/material";
import { useLocation, useHistory } from "react-router-dom";
import { useLocalStorage } from "react-use";

import { AppSideBar } from "../../../../../../shell/components/AppSidebar";
import {
  NavTree,
  TreeItem,
} from "../../../../../../shell/components/NavTreeV2";
import { useGetCurrentUserRolesQuery } from "../../../../../../shell/services/accounts";
import { useGetContentNavItemsQuery } from "../../../../../../shell/services/instance";
import noSearchResults from "../../../../../../../public/images/noSearchResults.svg";
import { CreateContentItemDialog } from "../../../../../../shell/components/CreateContentItemDialog";
import {
  ContentNavItem,
  ModelType,
} from "../../../../../../shell/services/types";
import { ReorderNav } from "../ReorderNav";
import { HideContentItemDialog } from "../HideContentItemDialog";

interface NavData {
  nav: TreeItem[];
  headless: TreeItem[];
  hidden: TreeItem[];
}
interface SubMenu {
  name: string;
  icon: SvgIconComponent;
  path: string;
}
const SUB_MENUS: Readonly<SubMenu[]> = [
  {
    name: "Dashboard",
    icon: BackupTableRounded,
    path: "/content",
  },
  {
    name: "Releases",
    icon: ScheduleRounded,
    path: "/release",
  },
] as const;
const ICONS: Record<string, SvgIconComponent> = {
  templateset: DescriptionRoundedIcon,
  pageset: FormatListBulletedRoundedIcon,
  dataset: FileTable as SvgIconComponent,
  external: LinkRoundedIcon,
  internal: LinkRoundedIcon,
  item: DescriptionRoundedIcon,
  homepage: HomeIcon,
} as const;

export const ContentNav = () => {
  const location = useLocation();
  const history = useHistory();

  const sideBarChildrenContainerRef = useRef(null);
  const [createContentDialogLimit, setCreateContentDialogLimit] = useState<
    ModelType[]
  >([]);
  const [keyword, setKeyword] = useState("");
  const [clippingsZUID, setClippingsZUID] = useState("");
  const [modelZUID, setModelZUID] = useState("");
  const [isCreateContentDialogOpen, setIsCreateContentDialogOpen] =
    useState(false);
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false);
  const [isHideDialogOpen, setIsHideDialogOpen] = useState(false);
  const [isHideMode, setIsHideMode] = useState(false);
  const [itemToHide, setItemToHide] = useState<ContentNavItem>(null);

  const {
    data: currentUserRoles,
    error: currentUserRolesError,
    isUninitialized: currentUserRolesUninitialized,
  } = useGetCurrentUserRolesQuery();
  const { data: rawNavData } = useGetContentNavItemsQuery(null, {
    skip:
      currentUserRolesUninitialized ||
      !currentUserRoles?.length ||
      !!currentUserRolesError,
  });

  const [expandedPageItems, setExpandedPageItems] = useLocalStorage(
    "zesty:navContentPages:open",
    []
  );
  const [expandedDatasetItems, setExpandedDatasetItems] = useLocalStorage(
    "zesty:navContentDatasets:open",
    []
  );
  const [expandedHiddenItems, setExpandedHiddenItems] = useLocalStorage(
    "zesty:navContentHiddenItems:open",
    []
  );
  const [hiddenNavItems, setHiddenNavItems] = useLocalStorage(
    "zesty:navContent:hidden",
    []
  );

  const hiddenZUIDs = useMemo(() => {
    if (!!hiddenNavItems?.length) {
      return hiddenNavItems.reduce((acc, curr: TreeItem) => {
        return [...acc, curr.ZUID];
      }, []);
    }

    return [];
  }, [hiddenNavItems]);

  const granularRoles: string[] = useMemo(() => {
    if (!!currentUserRoles?.length) {
      // Get all the resource ZUIDs from all the user's granular roles
      return currentUserRoles.reduce(
        (granularResourceZUIDs: string[], role) => {
          if (role?.granularRoles?.length) {
            const resourceZUIDs: string[] = role?.granularRoles?.reduce(
              (acc: string[], curr) => {
                return [...acc, curr.resourceZUID];
              },
              []
            );

            if (!!resourceZUIDs.length) {
              return (granularResourceZUIDs = [
                ...granularResourceZUIDs,
                ...resourceZUIDs,
              ]);
            }
          }

          return granularResourceZUIDs;
        },
        []
      );
    }

    return [];
  }, [currentUserRoles]);

  const mappedTree: TreeItem[] = useMemo(() => {
    if (!!rawNavData?.length) {
      let filteredNavData = [...rawNavData];

      // Find and store the clippings zuid
      const clippingsModel = filteredNavData.find(
        (item) =>
          item.label.toLowerCase() === "clippings" ||
          item.label.toLowerCase() === "globals"
      );

      setClippingsZUID(clippingsModel?.ZUID ?? "");

      if (!!keyword) {
        filteredNavData = filteredNavData.filter((navItem) => {
          return navItem.label.toLowerCase().includes(keyword.toLowerCase());
        });
      }

      if (!!granularRoles?.length) {
        // Filter nav based on user's granular role access
        filteredNavData = filteredNavData.filter((navItem) => {
          return granularRoles.includes(navItem.ZUID);
        });
      }

      // Sort nav alphabetically
      filteredNavData = filteredNavData.sort((a, b) =>
        a?.label?.localeCompare(b?.label)
      );

      // Sort nav by user defined value
      filteredNavData = filteredNavData.sort((a, b) => a?.sort - b?.sort);

      // Set path, actions and icon, and initiate empty children array
      return filteredNavData.map((navItem) => {
        let path = "";
        const isHideMode = hiddenZUIDs.includes(navItem.ZUID);

        switch (navItem.type) {
          case "item":
            path = `/content/${navItem.contentModelZUID}/${navItem.ZUID}`;
            break;

          case "internal":
          case "external":
            path = `/content/link/${navItem.ZUID}`;
            break;

          default:
            path = `/content/${navItem.ZUID}`;
            break;
        }

        let actions = [
          <IconButton
            data-cy="tree-item-hide"
            key="tree-item-hide"
            sx={{
              borderRadius: 0.5,
            }}
            size="xSmall"
            onClick={(e) => {
              e.stopPropagation();

              setItemToHide(navItem);
              setIsHideMode(!isHideMode);
              setIsHideDialogOpen(true);
            }}
          >
            {isHideMode ? (
              <VisibilityOffRoundedIcon sx={{ fontSize: 16 }} />
            ) : (
              <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>,
        ];

        if (
          (navItem.type === "dataset" || navItem.type === "pageset") &&
          !["dashboard widgets", "clippings", "globals"].includes(
            navItem.label.toLowerCase()
          )
        ) {
          actions.push(
            <IconButton
              data-cy="tree-item-add-new-content"
              key="tree-item-add-new-content"
              sx={{
                borderRadius: 0.5,
                backgroundColor: "primary.dark",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                "& svg.MuiSvgIcon-root": {
                  color: "common.white",
                },
              }}
              size="xSmall"
              onClick={(e) => {
                e.stopPropagation();
                setModelZUID(navItem.contentModelZUID);
                setIsCreateContentDialogOpen(true);
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          );
        }

        return {
          ...navItem,
          icon:
            navItem?.label?.toLowerCase() === "homepage"
              ? ICONS["homepage"]
              : ICONS[navItem.type],
          path,
          actions,
          children: [],
        };
      });
    }

    return [];
  }, [granularRoles, rawNavData, keyword, hiddenZUIDs]);

  const navTree: NavData = useMemo(() => {
    if (mappedTree?.length) {
      // Get all hidden items
      const hidden: TreeItem[] = mappedTree.filter((item) =>
        hiddenZUIDs.includes(item.ZUID)
      );

      // Convert nav item array to zuid:treeItem map
      const zuidTreeItemMap = mappedTree.reduce(
        (acc: { [key: string]: TreeItem }, curr) => {
          // exclude dashboard widgets
          if (curr.label?.toLowerCase() === "dashboard widgets") {
            return acc;
          }

          acc[curr.ZUID] = { ...curr };

          return acc;
        },
        {}
      );

      const tree: TreeItem[] = [];

      // Place children inside their respective parents except hidden items
      Object.values(zuidTreeItemMap).forEach((item) => {
        if (
          !!item.parentZUID &&
          !!zuidTreeItemMap[item.parentZUID] &&
          !hiddenZUIDs.includes(item.ZUID)
        ) {
          zuidTreeItemMap[item.parentZUID].children.push(item);
        } else {
          tree.push(item);
        }
      });

      // Split the nav tree into categories
      const nav: TreeItem[] = [];
      const headless: TreeItem[] = [];

      tree.forEach((item) => {
        if (item.type === "dataset") {
          return headless.push(item);
        }

        // Don't add a hidden item to the tree
        if (!item.parentZUID && !hiddenZUIDs.includes(item.ZUID)) {
          return nav.push(item);
        }
      });

      return {
        nav,
        headless,
        hidden,
      };
    }

    return {
      nav: [],
      headless: [],
      hidden: [],
    };
  }, [mappedTree, hiddenZUIDs]);

  const pathExists = (tree: TreeItem[], path: string) => {
    return !!tree?.find((item) => item.path === path);
  };

  const activeNodeId = useMemo(() => {
    const pathnameArr = location?.pathname?.split("/");

    if (!pathnameArr?.length) {
      return "";
    }

    // Matches url /content/X-XXXXXX
    if (pathnameArr.length === 3) {
      return location.pathname;
    }

    // Matches url /content/X-XXXX/X-XXXX or /content/link/X-XXXXXX
    if (pathnameArr.length >= 4) {
      const pathWithContentZUID = pathnameArr.slice(0, 4).join("/");
      const pathWithoutContentZUID = pathnameArr.slice(0, 3).join("/");

      if (!pathExists(mappedTree, pathWithContentZUID)) {
        /**
         * Checks if the url's content model ZUID is equal to the saved clippings/globals zuid
         * This allows the sidebar to select the clippings nav item since when the clippings item is
         * loaded, it dynamically adds a content item zuid to the url.
         * Also enables highlighting of a parent nav item when clicking an item from a templateset or dataset which has no nav item entry
         */
        if (
          pathnameArr[2] === clippingsZUID ||
          pathExists(mappedTree, pathWithoutContentZUID)
        ) {
          return pathWithoutContentZUID;
        }
      }

      return pathWithContentZUID;
    }
  }, [location, mappedTree, clippingsZUID]);

  const noMatchedItems =
    !navTree.nav.length &&
    !navTree.headless.length &&
    !navTree.hidden.length &&
    !!keyword;

  return (
    <>
      <AppSideBar
        data-cy="contentNav"
        mode="dark"
        ref={sideBarChildrenContainerRef}
        HeaderSubComponent={
          <Stack gap={1.5}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              px={1.5}
            >
              <Typography
                variant="h6"
                color="text.primary"
                fontWeight={700}
                lineHeight="24px"
                fontSize={18}
              >
                Content
              </Typography>
              <Button
                variant="contained"
                onClick={() => setIsCreateContentDialogOpen(true)}
                sx={{
                  width: 24,
                  height: 24,
                  minWidth: 0,
                  p: 0,
                  backgroundColor: "primary.dark",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                <AddRoundedIcon fontSize="small" />
              </Button>
            </Stack>
            <TextField
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search Content"
              size="small"
              sx={{
                px: 1.5,
              }}
              onChange={(evt) => setKeyword(evt.target.value)}
            />
            {!noMatchedItems && (
              <List disablePadding>
                {SUB_MENUS.map((menu) => {
                  const isActive = location.pathname === menu.path;

                  return (
                    <ListItem
                      key={menu.name}
                      disablePadding
                      selected={isActive}
                      sx={{
                        color: "text.secondary",
                        borderLeft: isActive ? "2px solid" : "none",
                        borderColor: "primary.main",
                      }}
                    >
                      <ListItemButton
                        sx={{
                          height: 36,
                          pl: isActive ? 1.25 : 1.5,
                          pr: 1.5,
                          py: 0.75,
                        }}
                        onClick={() => history.push(menu.path)}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <SvgIcon component={menu.icon} />
                        </ListItemIcon>
                        <ListItemText
                          primary={menu.name}
                          primaryTypographyProps={{
                            variant: "body3",
                            fontWeight: 600,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Stack>
        }
      >
        {noMatchedItems ? (
          <Stack gap={1.5} alignItems="center" justifyContent="center" p={1.5}>
            <img
              src={noSearchResults}
              alt="No search results"
              width="70px"
              height="64px"
            />
            <Typography color="text.secondary" variant="body2">
              No results available for "{keyword}"
            </Typography>
          </Stack>
        ) : (
          <>
            <NavTree
              tree={navTree.nav}
              expandedItems={expandedPageItems}
              selected={activeNodeId}
              onToggleCollapse={(paths) => setExpandedPageItems(paths)}
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
                      Pages
                    </Typography>
                    <Tooltip
                      placement="right-start"
                      title="Pages include single page and multi page models with URLs. Datasets that have been parented also show in this navigation."
                    >
                      <InfoRoundedIcon
                        sx={{ width: 12, height: 12, color: "action.active" }}
                      />
                    </Tooltip>
                  </Stack>
                  <Stack direction="row" gap={1}>
                    <IconButton
                      onClick={() => setIsReorderDialogOpen(true)}
                      sx={{
                        width: 20,
                        height: 20,
                        padding: 0.25,
                        borderRadius: 0.5,
                      }}
                    >
                      <ReorderRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setCreateContentDialogLimit(["pageset", "templateset"]);
                        setIsCreateContentDialogOpen(true);
                      }}
                      sx={{
                        width: 20,
                        height: 20,
                        padding: 0.25,
                        borderRadius: 0.5,
                      }}
                    >
                      <AddRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Stack>
                </Stack>
              }
            />
            <NavTree
              tree={navTree.headless}
              expandedItems={expandedDatasetItems}
              selected={activeNodeId}
              onToggleCollapse={(paths) => setExpandedDatasetItems(paths)}
              HeaderComponent={
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  px={1.5}
                  py={1.5}
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography variant="body2" textTransform="uppercase">
                      Datasets
                    </Typography>
                    <Tooltip
                      placement="right-start"
                      title="Datasets listed here do not have a parent content item and do not have URLs for the content items."
                    >
                      <InfoRoundedIcon
                        sx={{ width: 12, height: 12, color: "action.active" }}
                      />
                    </Tooltip>
                  </Stack>
                  <IconButton
                    onClick={() => {
                      setCreateContentDialogLimit(["dataset"]);
                      setIsCreateContentDialogOpen(true);
                    }}
                    sx={{
                      width: 20,
                      height: 20,
                      padding: 0.25,
                      borderRadius: 0.5,
                    }}
                  >
                    <AddRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>
              }
            />
            <Accordion
              elevation={0}
              onChange={() => {
                setTimeout(() => {
                  sideBarChildrenContainerRef.current?.scrollDown();
                }, 300);
              }}
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
                expandIcon={<MenuListDropDown sx={{ fontSize: "20px" }} />}
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
                  tree={navTree.hidden}
                  selected={activeNodeId}
                  expandedItems={expandedHiddenItems}
                  onToggleCollapse={(paths) => setExpandedHiddenItems(paths)}
                />
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </AppSideBar>
      {isCreateContentDialogOpen && (
        <CreateContentItemDialog
          open
          limitTo={createContentDialogLimit}
          modelZUID={modelZUID}
          onClose={() => {
            setCreateContentDialogLimit([]);
            setModelZUID("");
            setIsCreateContentDialogOpen(false);
          }}
        />
      )}
      {isReorderDialogOpen && (
        <ReorderNav isOpen toggleOpen={() => setIsReorderDialogOpen(false)} />
      )}
      {isHideDialogOpen && (
        <HideContentItemDialog
          open
          isHide={isHideMode}
          item={itemToHide}
          onClose={() => {
            setIsHideDialogOpen(false);
            setIsHideMode(false);
            setItemToHide(null);
          }}
          onToggleItemHideStatus={(item) => {
            const matchedItem = hiddenNavItems.find(
              (hiddenItem) => hiddenItem.ZUID === item.ZUID
            );

            // Remove if already exists, else add it
            if (!!matchedItem) {
              setHiddenNavItems(
                hiddenNavItems.filter(
                  (hiddenItem) => hiddenItem.ZUID !== item.ZUID
                )
              );
            } else {
              setHiddenNavItems([...hiddenNavItems, item]);
            }
          }}
        />
      )}
    </>
  );
};
