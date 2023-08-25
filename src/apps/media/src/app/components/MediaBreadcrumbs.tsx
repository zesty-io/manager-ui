import { FC, useMemo } from "react";
import { useSelector } from "react-redux";
import { Stack, Typography, SvgIcon } from "@mui/material";
import { FolderGlobal } from "@zesty-io/material";
import { FolderRounded } from "@mui/icons-material";
import { useHistory } from "react-router-dom";

import { CustomBreadcrumbs } from "../../../../../shell/components/CustomBreadcrumbs";
import {
  useGetAllBinGroupsQuery,
  useGetBinsQuery,
} from "../../../../../shell/services/mediaManager";
import { Group } from "../../../../../shell/services/types";

interface Props {
  id: string;
}
export const MediaBreadcrumbs: FC<Props> = ({ id }) => {
  const history = useHistory();
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const { data: bins } = useGetBinsQuery({ instanceId, ecoId });
  const { data: binGroups } = useGetAllBinGroupsQuery(
    bins?.map((bin) => bin.id),
    {
      skip: !bins?.length,
    }
  );

  const crumbs = useMemo(() => {
    if (binGroups?.length) {
      const items = [];

      if (id.startsWith("1")) {
        const binFolder = bins?.find((bin) => bin.id === id);

        items.push({
          node: <Crumb id={id} name={binFolder.name} />,
          onClick: () => history.push(`/media/folder/${id}`),
        });
      } else {
        const activeFolder = binGroups.flat().find((group) => group.id === id);

        let parentFolder = activeFolder?.group_id;

        while (parentFolder) {
          const parent = parentFolder.startsWith("1")
            ? bins?.find((bin) => bin.id === parentFolder)
            : binGroups.flat().find((group) => group.id === parentFolder);

          if (parent) {
            items.unshift({
              node: <Crumb id={parent?.id} name={parent?.name} />,
              onClick: () => history.push(`/media/folder/${parent?.id}`),
            });

            parentFolder = parent?.id.startsWith("1")
              ? null
              : (parent as Group)?.group_id;
          } else {
            parentFolder = null;
          }
        }
      }

      return items;
    }

    return [];
  }, [id, binGroups]);

  return <CustomBreadcrumbs items={crumbs} />;
};

interface CrumbProps {
  id: string;
  name: string;
}
const Crumb: FC<CrumbProps> = ({ id, name }) => {
  return (
    <Stack direction="row" gap={0.5}>
      <SvgIcon
        component={id.startsWith("1") ? FolderGlobal : FolderRounded}
        fontSize="small"
        color="action"
      />
      <Typography variant="body2" color="text.secondary" noWrap maxWidth={100}>
        {name}
      </Typography>
    </Stack>
  );
};
