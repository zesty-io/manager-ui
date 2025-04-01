import { memo, useState, useEffect, Fragment } from "react";
import { connect } from "react-redux";
import { Switch, Route } from "react-router";
import { Redirect } from "react-router-dom";

// TODO implement multitab: https://github.com/Microsoft/monaco-editor/issues/604#issuecomment-344214706

import { fetchFile } from "../../../store/files";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { Editor } from "../Editor";
import { LockedView } from "../LockedView";

import { tabLocationEquality } from "../../../../../../shell/store/ui";
import { LocalDirtyCodeModal } from "../LocalDirtyCodeModal";
import { Box, Typography } from "@mui/material";
import BottomDrawer from "../BottomDrawer";
import { Differ } from "../Differ";
import { fetchFields } from "../../../../../../shell/store/fields";
import { notify } from "../../../../../../shell/store/notifications";
import moment from "moment-timezone";

const BOTTOM_DRAWER_HEIGHT = "48px";

const Workspace = connect((state, props) => {
  console.debug("state, props: ", { state, props, audit: state?.auditTrail });
  const file = state.files.find(
    (file) => file.ZUID === props?.match.params.fileZUID
  );
  const fileUser = state?.users.find((user) => user?.ID === file?.lastEditedID);

  const publishing = state?.auditTrail
    ?.filter(
      (log) =>
        log?.action === 4 && log?.meta?.version === file?.publishedVersion
    )
    .sort((a, b) =>
      moment(a.createdAt).unix() > moment(b.createdAt).unix() ? -1 : 1
    )?.[0];

  const fields =
    file && file?.contentModelZUID
      ? Object.keys(state.fields)
          .filter(
            (fieldZUID) =>
              state.fields[fieldZUID].contentModelZUID ===
              file?.contentModelZUID
          )
          .reduce((acc, fieldZUID) => {
            acc.push(state.fields[fieldZUID]);
            return acc;
          }, [])
      : [];

  const fileType = props?.match.params.fileType;
  const pinnedTabs = state.ui.pinnedTabs;
  const fileIsPinned =
    file &&
    file.ZUID &&
    Boolean(
      pinnedTabs.find((tab) =>
        tabLocationEquality(tab, {
          search: "",
          pathname: `/code/file/${fileType}/${file.ZUID}`,
        })
      )
    );
  const fileInfo = file && {
    ...file,
    updatedBy: `${fileUser?.firstName || ""} ${
      fileUser?.lastName || ""
    }`.trim(),
    publishedAt: publishing?.happenedAt,
    publishedBy: `${publishing?.firstName || ""} ${
      publishing?.lastName || ""
    }`.trim(),
  };
  return {
    file: fileInfo ? fileInfo : {},
    fields,
    fileIsPinned,
  };
})(
  memo(function Workspace(props) {
    const { match, location, file, fields, fileIsPinned } = props;
    const [loading, setLoading] = useState(false);

    let lineNumber = 0;
    if (location.search) {
      const params = new URLSearchParams(location.search);
      lineNumber = params.get("line");
    }

    // If we don't have the file on hand, fetch it from the api
    useEffect(() => {
      // If we already have the file on hand let the refresh happen in the background
      if (!file) {
        setLoading(true);
      }

      props
        .dispatch(fetchFile(match.params.fileZUID, match.params.fileType))
        .then((res) => {
          if (file?.contentModelZUID) {
            return props?.dispatch(fetchFields(file?.contentModelZUID));
          } else {
            res;
          }
        })
        .catch((err) => {
          if (err !== "duplicate request") {
            console.error(err);
            props?.dispatch(
              notify({
                kind: "warn",
                message: `Could not load ${match.params.fileType} ${match.params.fileZUID}`,
              })
            );
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }, [match.params.fileZUID]);

    return (
      <WithLoader condition={!loading} message="Finding File">
        {file && file.ZUID ? (
          <Fragment>
            <LockedView ZUID={file.ZUID} name={file.fileName} />
            <LocalDirtyCodeModal
              show={file.dirty && !fileIsPinned}
              title="Unsaved Changes"
              content="You have unsaved changes that will be lost if you leave this page."
              dirtyCodeFileType={match.params.fileType}
              dirtyCodeZuid={match.params.fileZUID}
              dirtyCodeStatus={props?.status}
            />

            <Box
              display="block"
              boxSizing="border-box"
              position="relative"
              width="100%"
              height={`calc(100% - ${BOTTOM_DRAWER_HEIGHT})`}
              overflow="hidden"
              zIndex={0}
            >
              <Switch>
                <Route path={`${match.url}/diff`}>
                  <Differ
                    dispatch={props.dispatch}
                    fileName={file?.fileName}
                    fileZUID={file?.ZUID}
                    fileType={file?.fileType}
                    contentModelZUID={file?.contentModelZUID}
                    currentCode={file?.code}
                    publishedVersion={file?.publishedVersion}
                    status={props.status}
                    synced={file?.synced}
                    lineNumber={lineNumber}
                  />
                </Route>
                <Route path={`${match.url}`}>
                  {/* Force Sync */}
                  {!file.synced && (
                    <Redirect push to={`${location.pathname}/diff/`} />
                  )}

                  <Editor
                    fileZUID={match.params.fileZUID}
                    fileType={match.params.fileType}
                    dispatch={props?.dispatch}
                    fileName={file.fileName}
                    contentModelZUID={file?.contentModelZUID}
                    publishedVersion={file.publishedVersion}
                    fields={fields}
                    code={file?.code}
                    synced={file.synced}
                    status={props?.status}
                    version={file.version}
                    lineNumber={lineNumber}
                    isLive={file?.isLive}
                    isDirty={!!file?.dirty}
                    updatedAt={file?.updatedAt}
                    updatedBy={file?.updatedBy}
                    publishedAt={file?.publishedAt}
                    publishedBy={file?.publishedBy}
                  />
                </Route>
              </Switch>
            </Box>
            <Box
              flexGrow={0}
              height={BOTTOM_DRAWER_HEIGHT}
              width="100%"
              position="relative"
              boxSizing="border-box"
              display="flex"
              flexDirection="column"
              justifyContent="flex-end"
              bgcolor="background.editor"
            >
              <BottomDrawer file={file} match={match} />
            </Box>
          </Fragment>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeContent: "center",
            }}
          >
            <Typography variant="h2" color="text.secondary">
              File Not Found
            </Typography>
          </Box>
        )}
      </WithLoader>
    );
  })
);

export default Workspace;
