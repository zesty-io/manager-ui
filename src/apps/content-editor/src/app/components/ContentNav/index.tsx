import { FC, useMemo } from "react";
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
  Box,
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
import DocumentScannerRounded from "@mui/icons-material/DocumentScannerRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { useLocation, useHistory } from "react-router-dom";
import { useLocalStorage } from "react-use";

import { AppSideBar } from "../../../../../../shell/components/AppSidebar";
import { Nav } from "../../../../../../shell/components/NavTree";
import {
  NavTree,
  TreeItem,
} from "../../../../../../shell/components/NavTreeV2";
import { modelIconMap } from "../../../../../schema/src/app/utils";
import { useGetCurrentUserRolesQuery } from "../../../../../../shell/services/accounts";
import { useGetContentNavItemsQuery } from "../../../../../../shell/services/instance";

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

interface Props {
  navData: NavData;
}
export const ContentNav: FC<Readonly<Props>> = ({ navData }) => {
  const location = useLocation();
  const history = useHistory();
  const { data: currentUserRoles, isError: currentUserRolesFailed } =
    useGetCurrentUserRolesQuery();
  const { data: rawNavData, isError: navItemsFailed } =
    useGetContentNavItemsQuery();
  const [expandedNavItems] = useLocalStorage("zesty:navContent:open", []);
  const [hiddenNavItems] = useLocalStorage("zesty:navContent:hidden");

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

  const navTree: NavData = useMemo(() => {
    if (!!rawNavData?.length) {
      let filteredNavData = [...rawNavData];

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

      // Set path and icon
      filteredNavData = filteredNavData.map((navItem) => {
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
        };
      });

      console.log(filteredNavData);
    }

    return {
      nav: [],
      headless: [],
      hidden: [],
    };
  }, [granularRoles, rawNavData]);

  const actions: JSX.Element[] = useMemo(() => {
    return [
      <IconButton
        data-cy="tree-item-hide"
        sx={{
          borderRadius: 0.5,
        }}
        size="xSmall"
        onClick={(e) => {
          e.stopPropagation();
          // onHideItem(nodeId);
        }}
      >
        <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
      </IconButton>,
      <IconButton
        data-cy="tree-item-add-new-content"
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
          // onAddContent(nodeId);
        }}
      >
        <AddRoundedIcon sx={{ fontSize: 16 }} />
      </IconButton>,
    ];
  }, []);

  // console.log(navData.nav);

  const pages: TreeItem[] = useMemo(() => {
    // TODO: Add actions during tree creation
    return navData?.nav?.map((item) => {
      // const actions = [
      //   <IconButton
      //     data-cy="tree-item-hide"
      //     sx={{
      //       borderRadius: 0.5,
      //     }}
      //     size="xSmall"
      //     onClick={(e) => {
      //       e.stopPropagation();
      //       // onHideItem(nodeId);
      //       console.log("hide item:", item.path);
      //     }}
      //   >
      //     <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
      //   </IconButton>,
      // ];

      // if (item.type === "pageset" || item.type === "dataset") {
      //   actions.push(
      //     <IconButton
      //       data-cy="tree-item-add-new-content"
      //       sx={{
      //         borderRadius: 0.5,
      //         backgroundColor: "primary.dark",
      //         "&:hover": {
      //           backgroundColor: "primary.dark",
      //         },
      //         "& svg.MuiSvgIcon-root": {
      //           color: "common.white",
      //         },
      //       }}
      //       size="xSmall"
      //       onClick={(e) => {
      //         e.stopPropagation();
      //         // onAddContent(nodeId);
      //         console.log("add new item:", item.path);
      //       }}
      //     >
      //       <AddRoundedIcon sx={{ fontSize: 16 }} />
      //     </IconButton>
      //   );
      // }

      return {
        type: item.type,
        icon: item.icon,
        ZUID: item.ZUID,
        children: item.children,
        contentModelZUID: item.contentModelZUID,
        label: item.label,
        path: item.path,
        sort: item.sort,
        // hidden?: boolean,
        // closed?: boolean,
        // actions,
      };
    });
  }, [navData]);

  return (
    <AppSideBar
      data-cy="contentNav"
      mode="dark"
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
          />
          <List disablePadding>
            {SUB_MENUS.map((menu) => {
              const isActive = location.pathname === menu.path;

              return (
                <ListItem
                  key={menu.name}
                  disablePadding
                  selected={isActive}
                  sx={{
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
        </Stack>
      }
    >
      <NavTree
        tree={pages}
        expandedItems={expandedNavItems}
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
    </AppSideBar>
  );
};
