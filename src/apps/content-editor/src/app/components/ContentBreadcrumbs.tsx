import { Box, SvgIcon, Typography, Tooltip } from "@mui/material";
import {
  useGetContentModelQuery,
  useGetContentNavItemsQuery,
} from "../../../../../shell/services/instance";
import { Home } from "@zesty-io/material";
import { useHistory, useParams, useLocation } from "react-router";
import { useMemo } from "react";
import { ContentNavItem } from "../../../../../shell/services/types";
import { MODEL_ICON } from "../../../../../shell/constants";
import { Link } from "react-router-dom";
import { CustomBreadcrumbs } from "../../../../../shell/components/CustomBreadcrumbs";

export const ContentBreadcrumbs = () => {
  const { data: nav } = useGetContentNavItemsQuery();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const history = useHistory();
  const location = useLocation();

  const breadcrumbData = useMemo(() => {
    const isInMultipageTableView = !["new", "import"].includes(
      location?.pathname?.split("/")?.pop()
    );
    let activeItem: ContentNavItem;
    const crumbs = [];

    if (itemZUID) {
      // Edit content item
      activeItem = nav?.find((item) => item.ZUID === itemZUID);
    } else {
      // Create content item
      activeItem = nav?.find((item) => item.contentModelZUID === modelZUID);
      crumbs.push(activeItem);
    }

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

    if (!itemZUID && isInMultipageTableView) {
      // Remove the model as a breadcrumb item when viewing in multipage table view
      crumbs?.pop();
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
  }, [nav, itemZUID, modelZUID, location]);

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
    <Tooltip
      title={contentNavItem.label}
      placement="top"
      enterDelay={800}
      enterNextDelay={800}
    >
      <Box display="flex" gap={0.5}>
        <SvgIcon
          color="action"
          fontSize="small"
          component={MODEL_ICON[model?.type]}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          noWrap
          maxWidth={100}
        >
          {contentNavItem.label}
        </Typography>
      </Box>
    </Tooltip>
  );
};
