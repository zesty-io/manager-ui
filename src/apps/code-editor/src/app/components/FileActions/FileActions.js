import { memo, Fragment } from "react";

import { Switch, Route, useRouteMatch } from "react-router";
import { Box, IconButton, Typography } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import StorageIcon from "@mui/icons-material/Storage";
import { CopyButton } from "@zesty-io/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faFileCode } from "@fortawesome/free-solid-svg-icons";
import Link from "@mui/material/Link";

import { AppLink } from "@zesty-io/core/AppLink";
import { Notice } from "@zesty-io/core/Notice";

import { DifferActions } from "./components/DifferActions";
import { EditorActions } from "./components/EditorActions";
import { Delete } from "./components/Delete";

export const FileActions = memo(function FileActions(props) {
  const match = useRouteMatch("/code/file/:fileType/:fileZUID");

  return (
    <Box
      component="header"
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      minHeight="42px"
      position="relative"
      zIndex={1}
      padding="8px 0 12px 0px"
      whiteSpace="nowrap"
    >
      <Box display="flex" alignItems="center" whiteSpace="nowrap" flexGrow={1}>
        {props.contentModelZUID ? (
          <Link
            underline="none"
            color="secondary"
            href={`${CONFIG.URL_PREVIEW_FULL}/-/instant/${props.contentModelZUID}.json`}
            target="_blank"
            title="Preview JSON"
            sx={{ m: 0, pr: 2, pl: 3.25, py: 0 }}
          >
            <FontAwesomeIcon icon={faBolt} />
          </Link>
        ) : (
          <Box sx={{ m: 0, pr: 2, pl: 3.25, py: 0 }}>
            <FontAwesomeIcon icon={faFileCode} />
          </Box>
        )}

        <Switch>
          <Route path={`${match.url}`}>
            <Box display="flex" flexDirection="row" alignItems="center">
              {props.contentModelZUID && (
                <Fragment>
                  <Delete
                    dispatch={props.dispatch}
                    fileZUID={props.fileZUID}
                    status={props.status}
                    fileName={props.fileName}
                  />
                  <AppLink
                    to={`/content/${props.contentModelZUID}`}
                    title="Edit Related Content"
                  >
                    <IconButton size="small" sx={{ color: "grey.400" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </AppLink>

                  <AppLink
                    to={`/schema/${props.contentModelZUID}`}
                    title="Edit Related Model"
                  >
                    <IconButton size="small" sx={{ color: "grey.400" }}>
                      <StorageIcon fontSize="small" />
                    </IconButton>
                  </AppLink>
                </Fragment>
              )}

              <AppLink
                to={`/code/file/${props.fileType}/${
                  props.fileZUID
                }/diff/local,${
                  props.publishedVersion
                    ? props.publishedVersion
                    : props.version
                }`}
                title="Diff Versions"
              >
                <IconButton size="small" sx={{ color: "grey.400" }}>
                  <HistoryIcon fontSize="small" />
                </IconButton>
              </AppLink>
            </Box>
          </Route>
        </Switch>

        <Box display="flex" alignItems="center" whiteSpace="nowrap">
          <CopyButton
            variant="text"
            value={props.fileZUID}
            sx={{
              color: "grey.400",
              fontSize: "12px",
            }}
          />
          <Typography variant="body2" noWrap>
            {props.fileName}
          </Typography>
        </Box>
      </Box>

      {!props.synced && (
        <Notice>
          There is a new remote version ahead of your local changes
        </Notice>
      )}

      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        flexGrow={0}
        px={1}
      >
        <Switch>
          <Route path={`${match.url}/diff`}>
            <DifferActions
              dispatch={props.dispatch}
              fileZUID={props.fileZUID}
              fileType={props.fileType}
              publishedVersion={props.publishedVersion}
              status={props.status}
              synced={props.synced}
              setVersionCodeLeft={props.setVersionCodeLeft}
              setVersionCodeRight={props.setVersionCodeRight}
              setLoading={props.setLoading}
              currentCode={props.currentCode}
            />
          </Route>

          <Route path={`${match.url}`}>
            <EditorActions
              dispatch={props.dispatch}
              fileZUID={props.fileZUID}
              fileType={props.fileType}
              version={props.version}
              synced={props.synced}
              status={props.status}
            />
          </Route>
        </Switch>
      </Box>
    </Box>
  );
});
