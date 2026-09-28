import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import {
  ContentItemWithDirtyAndPublishing,
  RedirectsTargetType,
} from "../../../../../../shell/services/types";
import { useRedirectsDialog } from "../../../../../seo/src/app/components/RedirectsDialogProvider";
import AddIcon from "@mui/icons-material/Add";
import AutoSizer from "react-virtualized-auto-sizer";
import ContentRedirects, { ContentRedirectsSkeleton } from "./ContentRedirects";

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
  const { t } = useTranslation();
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

  const { web } = useSelector((state: AppState) => state.content[itemZUID]);
  const contentItems = useSelector((state: AppState) => state.content);
  const contentModels = useSelector((state: AppState) => state.models);
  const languages = useSelector((state: any) => state.languages);

  const options = useMemo(() => {
    return Object.values(contentItems)
      .filter((item) => item?.meta?.ZUID && item?.web?.path)
      .sort((a, b) => {
        const dateA = new Date(a.meta.createdAt).getTime();
        const dateB = new Date(b.meta.createdAt).getTime();
        return dateB - dateA;
      })
      .map((item: ContentItemWithDirtyAndPublishing) => {
        const web = item.web;
        const meta = item.meta;
        const publishing = item.publishing;
        return {
          ZUID: meta?.ZUID,
          label: web?.metaTitle || web?.metaLinkText || web?.path || "",
          langCode:
            languages.find((lang: any) => lang.ID === meta?.langID)?.code ||
            "en-US",
          path: web?.path,
          type: contentModels[meta?.contentModelZUID]?.type || "",
          isPublished: publishing?.isPublished || false,
        };
      });
  }, [contentItems, contentModels, languages]);

  const isLoading = isLoadingRedirects;

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
        isLoading ? (
          <Skeleton width="200px" height={24} />
        ) : (
          t("content.itemEditMetaIncomingPath")
        ),
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">{params.row.incomingPath}</Typography>
      ),
    },
    {
      field: "httpCode",
      renderHeader: () =>
        isLoading ? (
          <Skeleton width="150px" height={24} />
        ) : (
          t("content.itemEditMetaHttpCode")
        ),
      width: 150,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" gap={1.5} height="100%">
          <Typography variant="body2">{params.row.httpCode}</Typography>
          <ArrowForwardRounded fontSize="small" color="action" />
        </Stack>
      ),
    },
    {
      field: "targetPath",
      renderHeader: () =>
        isLoading ? (
          <Skeleton width="186px" height={24} />
        ) : (
          t("content.redirectTargetPath")
        ),
      flex: 1,
      renderCell: () => (
        <Link
          variant="body2"
          href={`${domain}${web?.path}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {web?.path}
        </Link>
      ),
    },
    {
      field: "actions",
      type: "actions",
      width: 56,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          data-cy="EditRedirect"
          icon={<EditRounded />}
          label={t("content.itemEditMetaEditRedirect")}
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
          label={t("content.itemEditMetaDeleteRedirect")}
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
            {t("content.itemEditMetaIncomingRedirects")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("content.itemEditMetaIncomingRedirectsDescription")}
          </Typography>
        </Box>
        <Box
          width="100%"
          flexGrow={1}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              width: "100%",
              minHeight: 158,
              height: rows.length * 52 + 58,
              maxHeight: 318,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <AutoSizer>
              {({ width, height }: { width: number; height: number }) => (
                <DataGridPro
                  data-cy="ContentRedirectsTable"
                  rowHeight={52}
                  columns={columns}
                  rows={isLoading ? [] : rows}
                  hideFooter
                  loading={isLoading}
                  disableRowSelectionOnClick
                  slots={{
                    moreActionsIcon: () => <MoreHoriz />,
                  }}
                  slotProps={{
                    loadingOverlay: {
                      variant: "skeleton",
                      noRowsVariant: "skeleton",
                    },
                  }}
                  sx={{
                    width: width,
                    height: height,
                    "& .MuiDataGrid-columnHeaderTitleContainerContent": {
                      fontWeight: 600,
                    },
                    "& .MuiDataGrid-row": {
                      "& .MuiDataGrid-cell": {
                        outline: "none!important",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        "& .MuiTypography-root": {
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          width: "100%",
                        },
                      },
                    },
                    "& .MuiDataGrid-cellSkeleton .MuiSkeleton-root": {
                      width: "95%!important",
                      height: "18px!important",
                    },
                    '& .MuiDataGrid-cellSkeleton[data-field="actions"] .MuiSkeleton-root':
                      {
                        height: "18px!important",
                        width: "18px!important",
                      },
                  }}
                />
              )}
            </AutoSizer>
          </Box>
          <Box
            sx={{
              width: "100%",
              height: 262,
              flexGrow: 1,
            }}
          >
            {isLoading ? (
              <ContentRedirectsSkeleton />
            ) : (
              <>
                <Box flexGrow={0} py={2}>
                  <Button
                    data-cy="AddIncomingRedirectButton"
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      openCreateForm({ target: itemZUID }, true);
                    }}
                  >
                    {t("content.redirectAddIncoming")}
                  </Button>
                </Box>

                <ContentRedirects
                  itemZUID={itemZUID}
                  isLoading={isLoading}
                  options={options}
                  redirects={redirects}
                />
              </>
            )}
          </Box>
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
