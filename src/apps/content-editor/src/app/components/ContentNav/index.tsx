import { useRef, useMemo, useEffect, useState, useReducer } from "react";
import {
  Stack,
  Typography,
  Tooltip,
  IconButton,
  AccordionSummary,
  AccordionDetails,
  Accordion,
} from "@mui/material";
import { SvgIconComponent, BackupTableRounded } from "@mui/icons-material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import {
  FileTable,
  IconButton as IconButtonCustom,
  Home,
} from "@zesty-io/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import { useLocation, useHistory } from "react-router-dom";
import { useLocalStorage, useDebounce } from "react-use";
import { useDispatch } from "react-redux";
import { cloneDeep } from "lodash";

import {
  AppSideBar,
  SubMenu,
} from "../../../../../../shell/components/AppSidebar";
import { NavTree, TreeItem } from "../../../../../../shell/components/NavTree";
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
import { notify } from "../../../../../../shell/store/notifications";
import { NavError } from "./NavError";

interface NavData {
  nav: TreeItem[];
  headless: TreeItem[];
  hidden: TreeItem[];
  parents: Record<string, TreeItem>;
}
const SUB_MENUS: SubMenu[] = [
  {
    name: "Dashboard",
    icon: BackupTableRounded,
    path: "/content",
  },
  // To be re-added on a different release
  // {
  //   name: "Releases",
  //   icon: ScheduleRounded,
  //   path: "/content/releases",
  // },
];
const ICONS: Record<string, SvgIconComponent> = {
  templateset: DescriptionRoundedIcon,
  pageset: FormatListBulletedRoundedIcon,
  dataset: FileTable as SvgIconComponent,
  external: LinkRoundedIcon,
  internal: LinkRoundedIcon,
  item: DescriptionRoundedIcon,
  homepage: Home as SvgIconComponent,
} as const;

export const ContentNav = () => {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  const sideBarChildrenContainerRef = useRef(null);
  const [createContentDialogLimit, setCreateContentDialogLimit] = useState<
    ModelType[]
  >([]);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [clippingsZUID, setClippingsZUID] = useState("");
  const [isCreateContentDialogOpen, setIsCreateContentDialogOpen] =
    useState(false);
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false);
  const [isHideDialogOpen, setIsHideDialogOpen] = useState(false);
  const [isHideMode, setIsHideMode] = useState(false);
  const [itemToHide, setItemToHide] = useState<TreeItem>(null);
  const [expandedNavItems, setexpandedNavItems] = useState<string[]>([]);

  const { data: currentUserRoles, isError: currentUserRolesError } =
    useGetCurrentUserRolesQuery();
  const { data: rawNavData, isError: navItemsError } =
    useGetContentNavItemsQuery(null, { refetchOnMountOrArgChange: true });

  const [closedNavItems, setClosedNavItems] = useLocalStorage(
    "zesty:navContentItems:closed",
    []
  );
  const [hiddenNavItems, setHiddenNavItems] = useLocalStorage(
    "zesty:navContent:hidden",
    []
  );

  useDebounce(() => setDebouncedKeyword(keyword), 200, [keyword]);

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
    if (!!rawNavData?.length && !currentUserRolesError) {
      let filteredNavData = [...rawNavData];

      // Find and store the clippings zuid
      const clippingsModel = filteredNavData.find(
        (item) =>
          item.label.toLowerCase() === "clippings" ||
          item.label.toLowerCase() === "globals"
      );

      setClippingsZUID(clippingsModel?.ZUID ?? "");

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

      // Set path and icon, and initiate empty children and actions array
      return filteredNavData.map((navItem) => {
        let path = "";

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

        return {
          ...navItem,
          icon:
            navItem?.label?.toLowerCase() === "homepage"
              ? ICONS["homepage"]
              : ICONS[navItem.type],
          path,
          actions: [],
          children: [],
        };
      });
    }

    return [];
  }, [granularRoles, rawNavData, hiddenZUIDs, currentUserRolesError]);

  const filteredMapTree = useMemo(() => {
    if (mappedTree?.length) {
      if (!!debouncedKeyword) {
        return mappedTree.filter((navItem) => {
          return navItem.label
            .toLowerCase()
            .includes(debouncedKeyword.toLowerCase());
        });
      }

      return mappedTree;
    }

    return [];
  }, [mappedTree, debouncedKeyword]);

  const navTree: NavData = useMemo(() => {
    if (filteredMapTree?.length) {
      const _filteredTree = cloneDeep(filteredMapTree);

      // Convert nav item array to zuid:treeItem map
      const zuidTreeItemMap = _filteredTree.reduce(
        (acc: { [key: string]: TreeItem }, curr) => {
          // exclude dashboard widgets
          if (curr.label?.toLowerCase() === "dashboard widgets") {
            return acc;
          }

          const isHideMode = hiddenZUIDs.includes(curr.ZUID);
          let actions = [
            <IconButton
              data-cy="tree-item-hide"
              key="tree-item-hide"
              size="xxsmall"
              onClick={(e) => {
                e.stopPropagation();

                setItemToHide(curr);
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
            (curr.type === "dataset" || curr.type === "pageset") &&
            !["dashboard widgets", "clippings", "globals"].includes(
              curr.label.toLowerCase()
            )
          ) {
            actions.push(
              <IconButtonCustom
                data-cy="tree-item-add-new-content"
                key="tree-item-add-new-content"
                variant="contained"
                size="xxsmall"
                onClick={(e) => {
                  e.stopPropagation();
                  history.push(`/content/${curr.ZUID}/new`);
                }}
              >
                <AddRoundedIcon sx={{ fontSize: 16 }} />
              </IconButtonCustom>
            );
          }

          acc[curr.ZUID] = { ...curr, actions };

          return acc;
        },
        {}
      );

      const tree: TreeItem[] = [];
      const hidden: TreeItem[] = [];
      const parents: Record<string, TreeItem> = {};

      Object.values(zuidTreeItemMap).forEach((item) => {
        if (hiddenZUIDs.includes(item.ZUID)) {
          // Get all hidden items
          hidden.push(item);
        } else if (
          !!item.parentZUID &&
          !!zuidTreeItemMap[item.parentZUID] &&
          !hiddenZUIDs.includes(item.ZUID)
        ) {
          // Get parent zuids
          if (!parents[item.parentZUID]) {
            parents[item.parentZUID] = zuidTreeItemMap[item.parentZUID];
          }

          // Place children inside their respective parents except hidden items
          zuidTreeItemMap[item.parentZUID].children.push(item);
        } else {
          tree.push(item);
        }
      });

      const nav: TreeItem[] = [];
      const headless: TreeItem[] = [];

      tree.forEach((item) => {
        if (item.type === "dataset") {
          return headless.push(item);
        }

        // This pushes all the root nodes to the tree
        return nav.push(item);
      });

      return {
        nav,
        headless,
        hidden,
        parents,
      };
    }

    return {
      nav: [],
      headless: [],
      hidden: [],
      parents: {},
    };
  }, [filteredMapTree, hiddenZUIDs]);

  const pathExists = (tree: TreeItem[], path: string) => {
    return !!tree?.find((item) => item.path === path);
  };

  const activeNodeId = useMemo(() => {
    const pathnameArr = location?.pathname?.split("/");
    if (!pathnameArr?.length) {
      return "";
    }

    // Matches url /content/X-XXXXXX
    if (pathnameArr.length <= 3) {
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

  useEffect(() => {
    if (currentUserRolesError) {
      dispatch(
        notify({
          message: "Failed to load your user role.",
          kind: "error",
        })
      );
    }

    if (navItemsError) {
      dispatch(
        notify({
          message: "Failed to load content nav items.",
          kind: "error",
        })
      );
    }
  }, [currentUserRolesError, navItemsError]);

  // Sets the expanded navs
  useEffect(() => {
    if (Object.values(navTree.parents)?.length) {
      const paths = Object.values(navTree.parents)
        ?.map((item) => item.path)
        .filter((item) => !closedNavItems.includes(item));

      setexpandedNavItems(paths);
    }
  }, [navTree, closedNavItems]);

  const getClosedPath = (paths: string[]) => {
    if (!!Object.values(navTree.parents)?.length) {
      const matchedItem = Object.values(navTree.parents)
        .filter((item) => {
          return !paths.includes(item.path);
        })
        .map((item) => item.path);

      return matchedItem ?? [];
    }
  };

  const noMatchedItems =
    !navTree.nav.length &&
    !navTree.headless.length &&
    !navTree.hidden.length &&
    !!debouncedKeyword;

  return (
    <>
      <AppSideBar
        data-cy="contentNav"
        mode="dark"
        headerTitle="Content"
        searchPlaceholder="Filter Models"
        ref={sideBarChildrenContainerRef}
        subMenus={SUB_MENUS}
        onAddClick={() => setIsCreateContentDialogOpen(true)}
        onFilterChange={(keyword) => setKeyword(keyword)}
        titleButtonTooltip="Create Content"
      >
        {noMatchedItems ? (
          <Stack gap={1.5} alignItems="center" justifyContent="center" p={1.5}>
            <img
              src={noSearchResults}
              alt="No search results"
              width="70px"
              height="64px"
            />
            <Typography color="text.secondary" variant="body2" align="center">
              No results available for "{debouncedKeyword}"
            </Typography>
          </Stack>
        ) : (
          <>
            <NavTree
              id="pages_nav"
              tree={navTree.nav}
              expandedItems={expandedNavItems}
              selected={activeNodeId}
              onToggleCollapse={(paths) => {
                const path = getClosedPath(paths);

                setClosedNavItems(path);
              }}
              error={currentUserRolesError || navItemsError}
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
                      enterDelay={1000}
                      enterNextDelay={1000}
                    >
                      <InfoRoundedIcon
                        sx={{ width: 12, height: 12, color: "action.active" }}
                      />
                    </Tooltip>
                  </Stack>
                  <Stack direction="row" gap={1}>
                    <IconButton
                      data-cy="reorder_nav"
                      size="xxsmall"
                      onClick={() => setIsReorderDialogOpen(true)}
                    >
                      <ReorderRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setCreateContentDialogLimit(["pageset", "templateset"]);
                        setIsCreateContentDialogOpen(true);
                      }}
                      size="xxsmall"
                    >
                      <AddRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Stack>
                </Stack>
              }
              ErrorComponent={<NavError navName="models" />}
            />
            <NavTree
              id="dataset_nav"
              tree={navTree.headless}
              expandedItems={expandedNavItems}
              selected={activeNodeId}
              onToggleCollapse={(paths) => {
                const path = getClosedPath(paths);

                setClosedNavItems(path);
              }}
              error={currentUserRolesError || navItemsError}
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
                      enterDelay={1000}
                      enterNextDelay={1000}
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
                    size="xxsmall"
                  >
                    <AddRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>
              }
              ErrorComponent={<NavError navName="datasets" />}
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
                expandIcon={
                  <ArrowDropDownRoundedIcon sx={{ fontSize: "20px" }} />
                }
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
                  id="hidden_nav"
                  tree={navTree.hidden}
                  selected={activeNodeId}
                  expandedItems={expandedNavItems}
                  onToggleCollapse={(paths) => {
                    const path = getClosedPath(paths);

                    setClosedNavItems(path);
                  }}
                />
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </AppSideBar>
      {isCreateContentDialogOpen && (
        <CreateContentItemDialog
          limitTo={createContentDialogLimit}
          onClose={() => {
            setCreateContentDialogLimit([]);
            setIsCreateContentDialogOpen(false);
          }}
        />
      )}
      {isReorderDialogOpen && (
        <ReorderNav isOpen toggleOpen={() => setIsReorderDialogOpen(false)} />
      )}
      {isHideDialogOpen && (
        <HideContentItemDialog
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
              setHiddenNavItems([
                ...hiddenNavItems,
                {
                  ZUID: item.ZUID,
                  label: item.label,
                  sort: item.sort,
                  type: item.type,
                  contentModelZUID: item.contentModelZUID,
                  parentZUID: item.parentZUID,
                },
              ]);
            }
          }}
        />
      )}
    </>
  );
};
