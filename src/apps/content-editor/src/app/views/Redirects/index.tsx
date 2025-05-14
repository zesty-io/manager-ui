import { useMemo } from "react";
import { Typography, Box, Stack } from "@mui/material";
import { MoreHoriz } from "@mui/icons-material";
import {
  DataGridPro,
  GridActionsCellItem,
  GridRowParams,
} from "@mui/x-data-grid-pro";

import { useGetRedirectsQuery } from "../../../../../../shell/services/instance";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { useParams } from "react-router";

const COLUMNS = [
  {
    field: "incomingPath",
    headerName: "Incoming Path",
    flex: 1,
  },
  {
    field: "httpCode",
    headerName: "HTTP Code",
    width: 120,
  },
  {
    field: "targetPath",
    headerName: "Target Path",
    flex: 1,
  },
  {
    field: "actions",
    type: "actions",
    width: 52,
    getActions: (params: GridRowParams) => [
      <GridActionsCellItem icon={<MoreHoriz />} label="More" />,
    ],
  },
] as const;

export const Redirects = () => {
  const { itemZUID } = useParams<{
    itemZUID: string;
  }>();
  const { data: redirects, isLoading: isLoadingRedirects } =
    useGetRedirectsQuery();
  const { web } = useSelector((state: AppState) => state.content[itemZUID]);

  const redirectsHere = useMemo(() => {
    if (!redirects?.length || !web?.path) return [];

    return redirects.filter(
      (redirect) =>
        redirect.targetType === "path" && redirect.target === web.path
    );
  }, [redirects, web]);

  const rows = useMemo(() => {
    if (!redirectsHere?.length) return [];

    return redirectsHere.map((redirect) => ({
      id: redirect.ZUID,
      incomingPath: redirect.path,
      httpCode: redirect.code,
      targetPath: redirect.target,
    }));
  }, [redirectsHere]);

  return (
    <Stack height="100%" my={2} mx={4}>
      <Typography variant="h5" fontWeight={700} color="text.primary" mb={0.5}>
        Incoming Redirects
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={1.5}>
        Manage redirects that point to this content item
      </Typography>
      <DataGridPro
        columns={COLUMNS}
        rows={rows}
        hideFooter
        loading={isLoadingRedirects}
      />
    </Stack>
  );
};
