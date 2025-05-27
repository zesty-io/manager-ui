import { useEffect, useMemo, useState } from "react";
import { Typography, Stack, Link, Box, Button, Skeleton } from "@mui/material";
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
import ContentRedirects from "./ContentRedirects";
import { useTargetListOptions } from "../../../../../seo/src/app/components/RedirectsDialogProvider/useTargetListOptions";
import StopRoundedIcon from "@mui/icons-material/StopRounded";

const ADD_SECTION_HEIGHT = 70;
const CONTENT_REDIRECTS_HEIGHT = 200;

const idMap: Record<number, string> = {
  1: "incomingPath",
  2: "httpCode",
  3: "targetPath",
};

const LOADING_ROWS = Array.from({ length: 3 }).map((_, index) => ({
  id: idMap[index + 1],
  incomingPath: "...",
  httpCode: 301,
  targetPath: "...",
}));

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
  const {
    data: redirects,
    isLoading: isLoadingRedirects,
    isFetching: isFetchingRedirects,
  } = useGetRedirectsQuery();
  const { options, isLoading: isLoadingOptions } = useTargetListOptions();
  const { web } = useSelector((state: AppState) => state.content[itemZUID]);

  const isLoading = isLoadingRedirects || isLoadingOptions;

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
      renderHeader: () =>
        isLoading ? <Skeleton width="200px" height={24} /> : "Incoming Path",
      flex: 1,
      renderCell: (params) => {
        if (isLoading) return <Skeleton width="100%" height={24} />;
        return (
          <Typography variant="body2">{params.row.incomingPath}</Typography>
        );
      },
    },
    {
      field: "httpCode",
      renderHeader: () =>
        isLoading ? <Skeleton width="150px" height={24} /> : "HTTP Code",
      width: 150,
      renderCell: (params) => {
        if (isLoading) return <Skeleton width="100%" height={24} />;
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
      renderHeader: () =>
        isLoading ? <Skeleton width="186px" height={24} /> : "Target Path",
      flex: 1,
      renderCell: () => {
        if (isLoading) return <Skeleton width="100%" height={24} />;
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
        minHeight="510px"
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
              const containerHeight =
                height - ADD_SECTION_HEIGHT - CONTENT_REDIRECTS_HEIGHT;
              const tableHeight = (rows.length + 1) * 52;
              return (
                <>
                  <DataGridPro
                    data-cy="ContentRedirectsTable"
                    rowHeight={52}
                    columns={columns}
                    rows={isLoading ? (LOADING_ROWS as any) : rows}
                    hideFooter
                    disableRowSelectionOnClick
                    scrollbarSize={0}
                    slots={{
                      moreActionsIcon: () =>
                        isLoading ? (
                          <Skeleton variant="rounded" height={18} width={18} />
                        ) : (
                          <MoreHoriz />
                        ),
                    }}
                    sx={{
                      height: isLoading
                        ? (LOADING_ROWS?.length + 1) * 52 + 6
                        : Math.min(containerHeight, tableHeight) + 6,
                      minHeight: 108,
                      width: width,
                      "& .MuiDataGrid-row": {
                        "& .MuiDataGrid-cell": {
                          outline: "none!important",
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          alignItems: "center",
                        },
                        '& .MuiDataGrid-cell[data-field="actions"]': {
                          position: "absolute!important",
                          right: "5px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        },
                      },
                    }}
                  />
                  <Box
                    width={width}
                    flexGrow={0}
                    py={2}
                    height={ADD_SECTION_HEIGHT}
                  >
                    {isLoading ? (
                      <Skeleton
                        variant="rounded"
                        height={38}
                        width={224}
                        sx={{ mb: 1 }}
                      />
                    ) : (
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
                    )}
                  </Box>
                  <Box
                    width={width}
                    flexGrow={0}
                    // py={2}
                    height={CONTENT_REDIRECTS_HEIGHT}
                  >
                    <ContentRedirects
                      itemZUID={itemZUID}
                      isLoading={isLoading || isFetchingRedirects}
                      options={options}
                      redirects={redirects}
                    />
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
