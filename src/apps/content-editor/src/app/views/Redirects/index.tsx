import { useMemo, useState } from "react";
import { Typography, Stack, Link } from "@mui/material";
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
import { Redirects as RedirectsType } from "../../../../../../shell/services/types";
import { useRedirectsDialog } from "../../../../../seo/src/app/components/RedirectsDialogProvider";

export type RedirectRowType = {
  httpCode: number;
  incomingPath: string;
  targetPath: string;
  id: string;
};
export const Redirects = () => {
  const [redirectToDelete, setRedirectToDelete] =
    useState<RedirectsType | null>(null);
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

  const handleAction = (zuid: string, action: "edit" | "delete") => {
    const matchedRedirect = redirectsHere.find(
      (redirect) => redirect.ZUID === zuid
    );

    if (!matchedRedirect) return;

    switch (action) {
      case "edit":
        openCreateForm({
          ZUID: matchedRedirect?.ZUID,
          targetType: matchedRedirect?.targetType,
          code: matchedRedirect?.code,
          target: matchedRedirect?.target,
          path: matchedRedirect?.path,
        });
        break;
      case "delete":
        setRedirectToDelete(matchedRedirect);
        break;

      default:
        break;
    }
  };

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
      width: 52,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          data-cy="EditRedirect"
          icon={<EditRounded />}
          label="Edit Redirect"
          onClick={() => handleAction(params.row.id, "edit")}
          showInMenu
          sx={{
            width: 240,
          }}
        />,
        <GridActionsCellItem
          data-cy="DeleteRedirect"
          icon={<DeleteRounded />}
          label="Delete Redirect"
          onClick={() => handleAction(params.row.id, "delete")}
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

    return redirectsHere.map((redirect) => ({
      id: redirect.ZUID,
      incomingPath: redirect.path,
      httpCode: redirect.code,
      targetPath: redirect.target,
    }));
  }, [redirectsHere]);

  return (
    <>
      <Stack height="100%" my={2} mx={4}>
        <Typography variant="h5" fontWeight={700} color="text.primary" mb={0.5}>
          Incoming Redirects
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1.5}>
          Manage redirects that point to this content item
        </Typography>
        <DataGridPro
          columns={columns}
          rows={rows}
          hideFooter
          disableRowSelectionOnClick
          loading={isLoadingRedirects}
          slots={{
            moreActionsIcon: MoreHoriz,
          }}
        />
      </Stack>
      {!!redirectToDelete && (
        <DeleteRedirectModal
          data={redirectToDelete}
          targetPath={web?.path}
          onClose={() => setRedirectToDelete(null)}
        />
      )}
    </>
  );
};
