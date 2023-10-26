import { FC, useMemo } from "react";
import { Tooltip, Stack, SvgIcon, Typography } from "@mui/material";
import { Link, useHistory } from "react-router-dom";
import { DatabaseSearch } from "@zesty-io/material";

import {
  useGetContentModelsQuery,
  useGetContentNavItemsQuery,
} from "../../../../../shell/services/instance";
import { CustomBreadcrumbs } from "../../../../../shell/components/CustomBreadcrumbs";
import { modelIconMap } from "../utils";
import { ContentModel } from "../../../../../shell/services/types";

interface Props {
  modelZUID: string;
}
export const ModelBreadcrumbs: FC<Props> = ({ modelZUID }) => {
  const history = useHistory();
  const { data: models } = useGetContentModelsQuery();
  const { data: navItems } = useGetContentNavItemsQuery();

  const crumbs = useMemo(() => {
    if (models?.length && navItems?.length) {
      const items = [];

      const activeModel = models.find((model) => model.ZUID === modelZUID);
      let parentNavZUID = activeModel?.parentZUID;

      while (parentNavZUID) {
        const parentNavData = navItems.find(
          (navItem) => navItem.ZUID === parentNavZUID
        );

        if (parentNavData) {
          const parentContentModel = models.find(
            (model) => model.ZUID === parentNavData.contentModelZUID
          );

          items.unshift({
            node: <Crumb model={parentContentModel} />,
            onClick: () =>
              history.push(`/schema/${parentNavData.contentModelZUID}/fields`),
          });

          // Prevent infinite loop if the model's parent is itself
          parentNavZUID =
            parentContentModel?.parentZUID !== parentNavZUID
              ? parentContentModel?.parentZUID
              : null;
        } else {
          parentNavZUID = null;
        }
      }

      return items;
    }

    return [];
  }, [modelZUID, models, navItems]);

  return (
    <CustomBreadcrumbs
      items={[
        {
          node: (
            <Link
              style={{
                display: "flex",
              }}
              to="/schema"
            >
              <DatabaseSearch color="action" fontSize="small" />
            </Link>
          ),
          onClick: () => {
            history.push("/schema");
          },
        },
        ...crumbs,
      ]}
    />
  );
};

interface CrumbProps {
  model: ContentModel;
}
const Crumb: FC<CrumbProps> = ({ model }) => {
  return (
    <Tooltip
      title={model?.label}
      placement="top"
      enterDelay={800}
      enterNextDelay={800}
    >
      <Stack direction="row" gap={0.5}>
        <SvgIcon
          component={modelIconMap[model?.type]}
          fontSize="small"
          color="action"
        />
        <Typography
          variant="body2"
          color="text.secondary"
          noWrap
          maxWidth={100}
        >
          {model?.label}
        </Typography>
      </Stack>
    </Tooltip>
  );
};
