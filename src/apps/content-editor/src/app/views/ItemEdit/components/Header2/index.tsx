import { Box, SvgIcon, Tabs, Tab, Typography, Tooltip } from "@mui/material";
import {
  useGetContentModelQuery,
  useGetContentNavItemsQuery,
} from "../../../../../../../../shell/services/instance";
import { Home, theme } from "@zesty-io/material";
import { useHistory, useLocation, useParams } from "react-router";
import { useMemo } from "react";
import {
  ContentItem,
  ContentNavItem,
  Publishing,
} from "../../../../../../../../shell/services/types";
import { MODEL_ICON } from "../../../../../../../../shell/constants";
import { Link } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import {
  VerticalSplitRounded,
  QueryStatsRounded,
  BarChartRounded,
  CodeRounded,
  ApiRounded,
  ManageAccountsRounded,
} from "@mui/icons-material";
import { CustomBreadcrumbs } from "../../../../../../../../shell/components/CustomBreadcrumbs";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../../../shell/store/types";
import { ItemEditHeaderActions } from "./ItemEditHeaderActions";

const tabs = [
  {
    label: "Content",
    icon: VerticalSplitRounded,
    value: "",
  },
  {
    label: "SEO",
    icon: QueryStatsRounded,
    value: "meta",
  },
  {
    label: "Analytics",
    icon: BarChartRounded,
    value: "analytics",
  },
  {
    label: "Head Tags",
    icon: CodeRounded,
    value: "head",
  },
  {
    label: "APIs",
    icon: ApiRounded,
    value: "api",
  },
  {
    label: "Publish Status",
    icon: ManageAccountsRounded,
    value: "publishings",
  },
];

type ContentItemWithDirtyAndPublishing = ContentItem & {
  dirty: boolean;
  publishing: Publishing;
};

type HeaderProps = {
  saving: boolean;
  onSave: () => void;
};
export const Header2 = ({ saving, onSave }: HeaderProps) => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const location = useLocation();
  const history = useHistory();

  const { data: model } = useGetContentModelQuery(modelZUID);
  const item = useSelector(
    (state: AppState) =>
      state.content[itemZUID] as ContentItemWithDirtyAndPublishing
  );

  return (
    <ThemeProvider theme={theme}>
      <Box
        px={4}
        pt={4}
        sx={{
          backgroundColor: "background.paper",
          color: "text.primary",
          borderBottom: (theme) => `2px solid ${theme?.palette?.divider} `,
          "*": {
            boxSizing: "border-box",
          },
        }}
      >
        <Box display="flex" justifyContent="space-between">
          <Box>
            <ContentBreadcrumbs />
            <Typography
              variant="h3"
              fontWeight="700"
              sx={{
                display: "-webkit-box",
                "-webkit-line-clamp": "2",
                "-webkit-box-orient": "vertical",
                wordBreak: "break-all",
                overflow: "hidden",
                mb: 2,
              }}
            >
              {item?.web?.metaTitle || item?.web?.metaLinkText}
            </Typography>
          </Box>
          <ItemEditHeaderActions saving={saving} onSave={onSave} />
        </Box>
        <Tabs
          value={
            location.pathname.split("/")?.pop()?.includes("7-")
              ? ""
              : location.pathname.split("/")?.pop()
          }
          onChange={(event, value) =>
            history.push(`/content/${modelZUID}/${itemZUID}/${value}`)
          }
          sx={{
            position: "relative",
            top: "2px",
          }}
        >
          {tabs.map((tab) => {
            if (tab.value === "meta" && model?.type === "dataset") return;
            return (
              <Tab
                key={tab.value}
                disableRipple
                label={tab.label}
                value={tab.value}
                icon={<tab.icon fontSize="small" />}
                iconPosition="start"
              />
            );
          })}
        </Tabs>
      </Box>
    </ThemeProvider>
  );
};

const ContentBreadcrumbs = () => {
  const { data: nav } = useGetContentNavItemsQuery();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const history = useHistory();

  const breadcrumbData = useMemo(() => {
    let activeItem = nav?.find((item) => item.ZUID === itemZUID);
    const crumbs = [];

    // If nav item is not found that means that it is part of a dataset so we push that dataset onto the breadcrumb
    if (!activeItem) {
      activeItem = nav?.find((item) => item.ZUID === modelZUID);
      if (activeItem) {
        crumbs.push(activeItem);
      } else {
        return [];
      }
    }

    let parent = activeItem.parentZUID;
    while (parent) {
      const parentItem = nav?.find((item) => item.ZUID === parent);
      if (parentItem) {
        crumbs.unshift(parentItem);
        parent = parentItem.parentZUID;
      } else {
        parent = null;
      }
    }
    return crumbs.map((item) => ({
      node: <Breadcrumb contentNavItem={item} />,
      onClick: () => {
        if (item.type === "item") {
          history.push(`/content/${item.contentModelZUID}/${item.ZUID}`);
        } else {
          history.push(`/content/${item.contentModelZUID}`);
        }
      },
    }));
  }, [nav, itemZUID]);

  return (
    <CustomBreadcrumbs
      items={[
        {
          node: (
            <Link
              style={{
                display: "flex",
              }}
              to={`/content/${
                nav?.find((item) => item.label === "Homepage")?.contentModelZUID
              }/${nav?.find((item) => item.label === "Homepage")?.ZUID}`}
            >
              <Home color="action" fontSize="small" />
            </Link>
          ),
          onClick: () => {
            history.push(
              `/content/${
                nav?.find((item) => item.label === "Homepage")?.contentModelZUID
              }/${nav?.find((item) => item.label === "Homepage")?.ZUID}`
            );
          },
        },
        ...breadcrumbData,
      ]}
    />
  );
};

type BreadcrumbProps = {
  contentNavItem: ContentNavItem;
};

export const Breadcrumb = ({ contentNavItem }: BreadcrumbProps) => {
  const { data: model } = useGetContentModelQuery(
    contentNavItem.contentModelZUID
  );

  return (
    <Box display="flex" gap={0.5}>
      <SvgIcon
        color="action"
        fontSize="small"
        component={MODEL_ICON[model?.type]}
      />
      <Typography variant="body2" color="text.secondary" noWrap maxWidth={100}>
        {contentNavItem.label}
      </Typography>
    </Box>
  );
};
