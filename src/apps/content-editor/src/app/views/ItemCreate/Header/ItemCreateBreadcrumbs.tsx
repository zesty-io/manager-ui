import { FC } from "react";
import { Box, SvgIcon, Typography, Tooltip } from "@mui/material";
import {
  useGetContentModelQuery,
  useGetContentNavItemsQuery,
} from "../../../../../../../shell/services/instance";
import { Home } from "@zesty-io/material";
import { useHistory, useParams } from "react-router";
import { useMemo } from "react";
import { ContentNavItem } from "../../../../../../../shell/services/types";
import { MODEL_ICON } from "../../../../../../../shell/constants";
import { Link } from "react-router-dom";
import { CustomBreadcrumbs } from "../../../../../../../shell/components/CustomBreadcrumbs";

export const ItemCreateBreadcrumbs = () => {
  const { data: nav } = useGetContentNavItemsQuery();
  const { modelZUID } = useParams<{
    modelZUID: string;
  }>();
  const history = useHistory();

  const breadcrumbData = useMemo(() => {
    const activeModelZUID = nav?.find(
      (item) => item.contentModelZUID === modelZUID
    );
    let crumbs: ContentNavItem[] = [];

    if (activeModelZUID) {
      crumbs.push(activeModelZUID);
    }

    let parent = activeModelZUID?.parentZUID;

    while (parent) {
      const parentItem = nav?.find((item) => item.ZUID === parent);
      if (parentItem) {
        crumbs.unshift(parentItem);
        parent = parentItem.parentZUID;
      } else {
        parent = undefined;
      }
    }

    return crumbs.map((item) => ({
      node: <Crumb contentNavItem={item} />,
      onClick: () => {
        if (item.type === "item") {
          history.push(`/content/${item.contentModelZUID}/${item.ZUID}`);
        } else {
          history.push(`/content/${item.contentModelZUID}`);
        }
      },
    }));
  }, [nav, modelZUID]);

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

interface CrumbProps {
  contentNavItem: ContentNavItem;
}
export const Crumb: FC<CrumbProps> = ({ contentNavItem }) => {
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
