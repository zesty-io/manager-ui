import { useMemo, useState } from "react";
import { Typography, Stack, Link, Box, Button } from "@mui/material";
import {
  MoreHoriz,
  ArrowForwardRounded,
  EditRounded,
  DeleteRounded,
} from "@mui/icons-material";
import {
  DataGridPro,
  GridActionsCellItem,
  GridRowParams,
  GridColDef,
} from "@mui/x-data-grid-pro";

import { useGetRedirectsQuery } from "../../../../../../shell/services/instance";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { useParams } from "react-router";
import { useDomain } from "../../../../../../shell/hooks/use-domain";
import { DeleteRedirectModal } from "./DeleteRedirectModal";
import { RedirectsTargetType } from "../../../../../../shell/services/types";
import { useRedirectsDialog } from "../../../../../seo/src/app/components/RedirectsDialogProvider";
import AddIcon from "@mui/icons-material/Add";
import AutoSizer from "react-virtualized-auto-sizer";

const BOTTOM_SECTION_HEIGHT = 70;

type Row = {
  id: string;
  incomingPath: string;
  httpCode: number;
  targetPath: string;
  targetType: RedirectsTargetType;
};
export type RedirectRowType = {
  httpCode: number;
  incomingPath: string;
  targetPath: string;
  id: string;
};
export const Redirects = () => {
  const [redirectToDelete, setRedirectToDelete] = useState<Row | null>(null);
  const domain = useDomain();
  const { openCreateForm } = useRedirectsDialog();
  const { itemZUID } = useParams<{
    itemZUID: string;
  }>();
  const { data: redirects, isLoading: isLoadingRedirects } =
    useGetRedirectsQuery();
  const { web } = useSelector((state: AppState) => state.content[itemZUID]);

  const redirectsHere = useMemo(() => {
    if (!redirects?.length || !web?.path) return [];

    // We get wildcard and internal redirects
    return redirects.filter(
      (redirect) =>
        (redirect.targetType === "path" && redirect.target === web.path) ||
        (redirect.targetType === "page" && redirect.target === itemZUID)
    );
  }, [redirects, web]);

  const columns: GridColDef[] = [
    {
      field: "incomingPath",
      headerName: "Incoming Path",
      flex: 1,
    },
    {
      field: "httpCode",
      headerName: "HTTP Code",
      width: 120,
      renderCell: (params) => {
        return (
          <Stack direction="row" alignItems="center" gap={1.5} height="100%">
            <Typography variant="body2">{params.row.httpCode}</Typography>
            <ArrowForwardRounded fontSize="small" color="action" />
          </Stack>
        );
      },
    },
    {
      field: "targetPath",
      headerName: "Target Path",
      flex: 1,
      renderCell: (params) => {
        return (
          <Link
            variant="body2"
            href={`${domain}${web?.path}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {web?.path}
          </Link>
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      width: 56,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          data-cy="EditRedirect"
          icon={<EditRounded />}
          label="Edit Redirect"
          onClick={() => {
            openCreateForm(
              {
                ZUID: params.row?.id,
                targetType: params.row?.targetType,
                code: params.row?.httpCode,
                target: params.row?.targetPath,
                path: params.row?.incomingPath,
              },
              true
            );
          }}
          showInMenu
          sx={{
            width: 240,
          }}
        />,
        <GridActionsCellItem
          data-cy="DeleteRedirect"
          icon={<DeleteRounded />}
          label="Delete Redirect"
          onClick={() => setRedirectToDelete(params.row)}
          showInMenu
          sx={{
            width: 240,
          }}
        />,
      ],
    },
  ];

  const rows = useMemo(() => {
    if (!redirectsHere?.length) return [];

    return redirectsHere
      .map((redirect) => ({
        id: redirect.ZUID,
        incomingPath: redirect.path,
        httpCode: redirect.code,
        targetPath: redirect.target,
        targetType: redirect.targetType,
        createdAt: redirect.createdAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [redirectsHere]);

  return (
    <>
      <Box
        height="100%"
        width="100%"
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        boxSizing="border-box"
        rowGap={2}
        py={2}
        px={4}
      >
        <Box width="100%" flexGrow={0}>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            Incoming Redirects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage redirects that point to this content item
          </Typography>
        </Box>
        <Box
          width="100%"
          height="100%"
          flexGrow={1}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => {
              const containerHeight = height - BOTTOM_SECTION_HEIGHT;
              const tableHeight = (rows.length + 1) * 52;
              return (
                <>
                  <DataGridPro
                    data-cy="ContentRedirectsTable"
                    rowHeight={52}
                    columns={columns}
                    rows={rows}
                    hideFooter
                    disableRowSelectionOnClick
                    loading={isLoadingRedirects}
                    scrollbarSize={0}
                    slots={{
                      moreActionsIcon: MoreHoriz,
                    }}
                    sx={{
                      height: Math.min(containerHeight, tableHeight) + 6,
                      minHeight: 104,
                      width: width,
                    }}
                  />
                  <Box
                    width={width}
                    flexGrow={0}
                    py={2}
                    height={BOTTOM_SECTION_HEIGHT}
                  >
                    <Button
                      data-cy="AddIncomingPathButton"
                      variant="outlined"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        openCreateForm({ target: itemZUID }, true);
                      }}
                    >
                      Add Incoming Redirect
                    </Button>
                  </Box>
                </>
              );
            }}
          </AutoSizer>
        </Box>
      </Box>
      {!!redirectToDelete && (
        <DeleteRedirectModal
          ZUID={redirectToDelete.id}
          incomingPath={redirectToDelete.incomingPath}
          httpCode={redirectToDelete.httpCode}
          targetType={redirectToDelete.targetType}
          targetPath={web?.path}
          onClose={() => setRedirectToDelete(null)}
        />
      )}
    </>
  );
};
