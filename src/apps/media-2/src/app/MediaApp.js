import React, { useEffect } from "react";
import { connect } from "react-redux";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { MediaSidebar } from "./components/MediaSidebar";
import { MediaWorkspace } from "./components/MediaWorkspace";
import { MediaDetailsModal } from "./components/MediaDetailsModal";

import {
  fetchMediaBins,
  fetchMediaGroups,
  fetchBinFiles,
  fetchGroupFiles
} from "shell/store/media";

import styles from "./MediaApp.less";

export default connect((state, props) => {
  let files;
  if (props.match.params.groupID) {
    files = state.media.files.filter(
      file => file.group_id === props.match.params.groupID
    );
  } else if (props.match.params.binID) {
    files = state.media.files.filter(
      file => file.group_id === props.match.params.binID
    );
  } else {
    files = [];
  }
  return {
    files,
    media: state.media
  };
})(function MediaApp(props) {
  useEffect(() => {
    props.dispatch(fetchMediaBins());
  }, []);

  useEffect(() => {
    props.media.bins.forEach(bin => props.dispatch(fetchMediaGroups(bin.id)));
  }, [props.media.bins.length]);

  useEffect(() => {
    if (props.match.params.groupID) {
      props.dispatch(fetchGroupFiles(props.match.params.groupID));
    }
  }, [props.match.params.groupID]);

  useEffect(() => {
    if (props.match.params.binID) {
      props.dispatch(fetchBinFiles(props.match.params.binID));
    }
  }, [props.match.params.binID]);

  return (
    <main className={styles.MediaApp}>
      <WithLoader
        condition={true}
        message="Starting Digital Asset Manager"
        width="100vw"
      >
        <MediaSidebar nav={props.media.nav} />
        <MediaWorkspace files={props.files} />
        <MediaDetailsModal />
      </WithLoader>
    </main>
  );
});
