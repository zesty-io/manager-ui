import React, { useEffect } from "react";
import { connect } from "react-redux";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { MediaSidebar } from "./components/MediaSidebar";
import { MediaWorkspace } from "./components/MediaWorkspace";
import { MediaDetailsModal } from "./components/MediaDetailsModal";

import { fetchMediaBins } from "shell/store/media";

import styles from "./MediaApp.less";

export default connect(state => {
  return {
    media: state.media
  };
})(function MediaApp(props) {
  useEffect(() => {
    props.dispatch(fetchMediaBins());
  }, []);

  useEffect(() => {
    props.media.bins.forEach(bin => props.dispatch(fetchMediaGroups(bin.id)));
  }, [props.media.bins.length]);

  return (
    <main className={styles.MediaApp}>
      <WithLoader
        condition={props.media.bins.length && props.media.groups.length}
        message="Starting Digital Asset Manager"
        width="100vw"
      >
        <MediaSidebar />
        <MediaWorkspace />
        <MediaDetailsModal />
      </WithLoader>
    </main>
  );
});
