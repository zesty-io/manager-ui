import { memo, useState, useEffect, Fragment } from "react";
import { connect } from "react-redux";
import { Switch, Route } from "react-router";
import { Redirect } from "react-router-dom";

// TODO implement multitab: https://github.com/Microsoft/monaco-editor/issues/604#issuecomment-344214706

import { notify } from "shell/store/notifications";
import { fetchFields } from "shell/store/fields";
import { fetchFile } from "../../../store/files";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { Editor } from "../Editor";
import { LockedView } from "../LockedView";

import { tabLocationEquality } from "../../../../../../shell/store/ui";
import { LocalDirtyCodeModal } from "../LocalDirtyCodeModal";
import { Box, Typography } from "@mui/material";
import BottomDrawer from "../BottomDrawer";
import { Differ } from "../Differ";

const BOTTOM_DRAWER_HEIGHT = "48px";

const Workspace = connect((state, props) => {
  const file = state.files.find(
    (file) => file.ZUID === props?.match.params.fileZUID
  );
  const fields =
    file && file.contentModelZUID
      ? Object.keys(state.fields)
          .filter(
            (fieldZUID) =>
              state.fields[fieldZUID].contentModelZUID === file.contentModelZUID
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
  return {
    file: file ? file : {},
    fields,
    fileIsPinned,
  };
})(
  memo(function Workspace(props) {
    const { match, location } = props;
    const [loading, setLoading] = useState(false);

    let lineNumber = 0;
    if (location.search) {
      const params = new URLSearchParams(location.search);
      lineNumber = params.get("line");
    }

    // If we don't have the file on hand, fetch it from the api
    useEffect(() => {
      // If we already have the file on hand let the refresh happen in the background
      if (!props?.file || !props?.file.ZUID) {
        setLoading(true);
      }
      if (props?.file.contentModelZUID && !props?.fields.length) {
        setLoading(true);
      }

      props
        .dispatch(fetchFile(match.params.fileZUID, match.params.fileType))
        .then((res) => {
          if (props?.file.contentModelZUID) {
            return props?.dispatch(fetchFields(props?.file.contentModelZUID));
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
        {props?.file && props?.file.ZUID ? (
          <Fragment>
            <LockedView ZUID={props?.file.ZUID} name={props?.file.fileName} />
            <LocalDirtyCodeModal
              show={props?.file.dirty && !props?.fileIsPinned}
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
              bgcolor="#1e1e1e"
              height={`calc(100% - ${BOTTOM_DRAWER_HEIGHT})`}
              overflow="hidden"
            >
              <Switch>
                <Route path={`${match.url}/diff`}>
                  <Differ
                    dispatch={props.dispatch}
                    fileName={props.file.fileName}
                    fileZUID={match.params.fileZUID}
                    fileType={match.params.fileType}
                    contentModelZUID={props.file.contentModelZUID}
                    currentCode={props.file.code}
                    publishedVersion={props.file.publishedVersion}
                    status={props.status}
                    synced={props.file.synced}
                    lineNumber={lineNumber}
                  />
                </Route>
                <Route path={`${match.url}`}>
                  {/* Force Sync */}
                  {!props?.file.synced && (
                    <Redirect push to={`${location.pathname}/diff/`} />
                  )}

                  <Editor
                    fileZUID={match.params.fileZUID}
                    fileType={match.params.fileType}
                    dispatch={props?.dispatch}
                    fileName={props?.file.fileName}
                    contentModelZUID={props?.file.contentModelZUID}
                    publishedVersion={props?.file.publishedVersion}
                    fields={props?.fields}
                    code={props?.file.code}
                    synced={props?.file.synced}
                    status={props?.status}
                    version={props?.file.version}
                    lineNumber={lineNumber}
                    isLive={props?.file?.isLive}
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
              zIndex={10}
              bgcolor="grey.900"
            >
              <BottomDrawer file={props?.file} match={match} />
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
