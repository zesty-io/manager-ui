import { Box, SvgIcon, Tabs, Tab, Typography } from "@mui/material";
import {
  useGetContentItemQuery,
  useGetContentModelQuery,
  useGetContentNavItemsQuery,
} from "../../../../../../../../shell/services/instance";
import { Home, theme } from "@zesty-io/material";
import { useHistory, useLocation, useParams } from "react-router";
import { useMemo } from "react";
import { ContentNavItem } from "../../../../../../../../shell/services/types";
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

export const Header2 = () => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const location = useLocation();
  const history = useHistory();

  const { data: contentItem } = useGetContentItemQuery(itemZUID);
  const { data: model } = useGetContentModelQuery(modelZUID);

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
          {contentItem?.web?.metaTitle || contentItem?.web?.metaLinkText}
        </Typography>
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
    return crumbs;
  }, [nav, itemZUID]);

  return (
    <CustomBreadcrumbs>
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
      {breadcrumbData.map((item) => (
        <Breadcrumb key={item.ZUID} contentNavItem={item} />
      ))}
    </CustomBreadcrumbs>
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
      {/* @ts-ignore */}
      <Typography
        component={Link}
        to={`/content/${contentNavItem.contentModelZUID}/${
          contentNavItem?.type === "dataset" ? "" : contentNavItem.ZUID
        }`}
        variant="body2"
        color="text.secondary"
        sx={{
          textDecoration: "none",
        }}
      >
        {contentNavItem.label}
      </Typography>
    </Box>
  );
};
