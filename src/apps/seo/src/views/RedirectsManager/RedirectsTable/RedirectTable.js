import { useMemo, useCallback, useState } from "react";
import { DataGridPro, GridActionsCellItem } from "@mui/x-data-grid-pro";
import { Box, Tooltip, Typography } from "@mui/material";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";

import { removeRedirect } from "../../../store/redirects";

import { RedirectCreator } from "./RedirectCreator";
import { RedirectTargetCell } from "./RedirectTargetCell";
import { DeleteDialog } from "./DeleteDialog";

export const CellWrapper = ({ color = "", children, type = "text" }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        position: "relative",
        overflow: "hidden",
        "& svg, & span": {
          color: color || "action.active",
          flexGrow: 0,
        },
        "& .MuiTypography-root": (theme) => ({
          ...theme.typography.body2,
          color: color || "text.primary",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          flexGrow: 1,
        }),
        "&:hover": {
          ...(type !== "text" && {
            textDecorationLine: "underline",
            color: color,
          }),
        },
      }}
    >
      {children}
    </Box>
  );
};

export default function RedirectTable(props) {
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const [deleteRedirect, setDeleteRedirect] = useState(null);
  const handleRemoveRedirect = useCallback((item) => {
    // if (item?.targetType === "page") {
    //   const targetPath = Object.values(props?.content).find(
    //     (item) => item?.meta?.ZUID === item?.target
    //   );
    //   redirect.target = targetPath?.web?.path;
    //   redirect.targetType = "internal";
    // }

    // console.debug("item: ", { item, redirects: props.redirects, redirect });

    // const redirect = { ...item };

    // if (redirect?.targetType === "page") {
    //   redirect.targetType = "internal";
    // }

    // if (redirect?.targetType === "path") {
    //   redirect.targetType = "wildcard";
    // }

    setDeleteRedirect(item);
    setDeleteDialogIsOpen(true);
  }, []);

  const columns = useMemo(
    () => [
      { field: "id", headerName: "Id", hide: true },
      {
        field: "path",
        flex: 2,
        renderHeader: () => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              Incoming Path
            </Typography>
            <Tooltip title="File Path Only" arrow placement="top-start">
              <InfoIcon fontSize="small" sx={{ color: "action.disabled" }} />
            </Tooltip>
          </Box>
        ),
        renderCell: ({ value }) => (
          <Box
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {value}
          </Box>
        ),
      },
      {
        field: "code",
        width: 185,
        renderHeader: () => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              HTTP Code
            </Typography>
            <Tooltip
              title={
                <>
                  301: Moved Permanently <br />
                  302: Temporarily Moved
                </>
              }
              arrow
              placement="top-start"
            >
              <InfoIcon fontSize="small" sx={{ color: "action.disabled" }} />
            </Tooltip>
          </Box>
        ),
        renderCell: ({ value }) => {
          return (
            <CellWrapper>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {value}
              </Typography>
              <ArrowForwardRoundedIcon fontSize="small" />
            </CellWrapper>
          );
        },
      },
      {
        field: "targetType",
        width: 195,
        renderHeader: () => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              Redirect Type
            </Typography>
            <Tooltip
              title={
                <>
                  Internal E.g. /about <br />
                  External E.g. https://zesty.org/ <br />
                  Wildcard E.g. /blog/*/*/
                </>
              }
              arrow
              placement="top-start"
            >
              <InfoIcon fontSize="small" sx={{ color: "action.disabled" }} />
            </Tooltip>
          </Box>
        ),
        renderCell: ({ value }) => {
          return (
            <CellWrapper>
              {value === "external" ? (
                <>
                  <OpenInNewRoundedIcon fontSize="small" />
                  External&nbsp;
                </>
              ) : value === "path" ? (
                <>
                  <InsertDriveFileRoundedIcon fontSize="small" />
                  Wildcard&nbsp;
                </>
              ) : (
                <>
                  <DescriptionRoundedIcon fontSize="small" />
                  Internal&nbsp;
                </>
              )}
            </CellWrapper>
          );
        },
      },
      {
        field: "target",
        headerName: (
          <Typography variant="body2" fontWeight={600} color="text.primary">
            Redirect Target
          </Typography>
        ),
        flex: 2,
        renderCell: ({ value, row }) => (
          <RedirectTargetCell
            wrapper={CellWrapper}
            target={value}
            targetType={row.targetType}
          />
        ),
      },
      {
        field: "actions",
        type: "actions",
        width: 40,
        getActions: ({ row }) => [
          <GridActionsCellItem
            icon={<DeleteIcon />}
            color="action.secondary"
            label="Delete"
            onClick={() => handleRemoveRedirect(row)}
          />,
        ],
      },
    ],
    []
  );

  const rows = useMemo(
    () =>
      // case insensitive search on path, code, target, and ZUID
      Object.values(props.redirects)
        .filter((redirect) => {
          const normalizedFilter = props.redirectsFilter?.toLowerCase() || "";
          return (
            redirect.path.toLowerCase().includes(normalizedFilter) ||
            String(redirect.code).toLowerCase().includes(normalizedFilter) ||
            redirect.ZUID.toLowerCase().includes(normalizedFilter) ||
            redirect.target.toLowerCase().includes(normalizedFilter)
          );
        })
        .map((redirect) => ({
          ...redirect,
          id: redirect.ZUID,
        })),
    [props.redirects, props.redirectsFilter]
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      justifyContent="space-between"
      alignItems="stretch"
      width="100%"
      position="relative"
      rowGap="24px"
    >
      <RedirectCreator
        options={props.paths}
        siteZuid={props.siteZuid}
        dispatch={props.dispatch}
      />

      <DataGridPro
        columns={columns}
        rows={rows}
        rowHeight={60}
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          fontSize: "typography.body2.fontSize",
        }}
        hideFooter
      />
      <DeleteDialog
        open={deleteDialogIsOpen}
        onClose={() => setDeleteDialogIsOpen(false)}
        ZUID={deleteRedirect?.ZUID}
        path={deleteRedirect?.path}
        type={deleteRedirect?.targetType}
        target={deleteRedirect?.target}
        code={deleteRedirect?.code}
      />
    </Box>
  );
}
