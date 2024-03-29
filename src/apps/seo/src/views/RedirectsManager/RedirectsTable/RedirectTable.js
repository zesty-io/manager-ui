import { useMemo, useCallback } from "react";
import { DataGridPro, GridActionsCellItem } from "@mui/x-data-grid-pro";
import { Box, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./RedirectTable.less";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faExternalLinkAlt,
  faFile,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";

import { removeRedirect } from "../../../store/redirects";

import { RedirectCreator } from "./RedirectCreator";
import { RedirectTargetCell } from "./RedirectTargetCell";

export default function RedirectTable(props) {
  const handleRemoveRedirect = useCallback((zuid) => {
    props.dispatch(removeRedirect(zuid));
  }, []);

  const columns = useMemo(
    () => [
      { field: "id", headerName: "Id", hide: true },
      {
        field: "path",
        flex: 2,
        renderHeader: () => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title="File Path Only" arrow placement="top-start">
              <InfoIcon fontSize="small" />
            </Tooltip>
            Incoming Path
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
        width: 135,
        renderHeader: () => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
              <InfoIcon fontSize="small" />
            </Tooltip>
            HTTP Code
          </Box>
        ),
        renderCell: ({ value }) => {
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {value} <FontAwesomeIcon icon={faArrowRight} />
            </Box>
          );
        },
      },
      {
        field: "targetType",
        width: 140,
        renderHeader: () => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
              <InfoIcon fontSize="small" />
            </Tooltip>
            Redirect Type
          </Box>
        ),
        renderCell: ({ value }) => {
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {value === "external" ? (
                <>
                  <FontAwesomeIcon
                    icon={faExternalLinkAlt}
                    className={styles.mr}
                  />
                  External&nbsp;
                </>
              ) : value === "path" ? (
                <>
                  <FontAwesomeIcon icon={faFile} className={styles.mr} />
                  Wildcard&nbsp;
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faFileAlt} className={styles.mr} />
                  Internal&nbsp;
                </>
              )}
            </Box>
          );
        },
      },
      {
        field: "target",
        headerName: "Redirect Target",
        flex: 2,
        renderCell: ({ value, row }) => (
          <RedirectTargetCell target={value} targetType={row.targetType} />
        ),
      },
      {
        field: "actions",
        type: "actions",
        width: 40,
        getActions: ({ row }) => [
          <GridActionsCellItem
            icon={<DeleteIcon />}
            color="warning"
            label="Delete"
            sx={{ "&:hover": { color: "error.main" } }}
            onClick={() => handleRemoveRedirect(row.ZUID)}
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
    <section className={styles.RedirectsTable}>
      <main className={styles.TableBody}>
        <RedirectCreator
          options={props.paths}
          siteZuid={props.siteZuid}
          dispatch={props.dispatch}
        />
      </main>
      <div style={{ height: "100%" }}>
        <DataGridPro
          columns={columns}
          rows={rows}
          rowHeight={60}
          initialState={{ pinnedColumns: { right: ["actions"] } }}
          hideFooter
        />
      </div>
    </section>
  );
}
