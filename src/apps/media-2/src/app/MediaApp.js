import React, { useEffect } from "react";
import { connect } from "react-redux";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { MediaSidebar } from "./components/MediaSidebar";
import { MediaWorkspace } from "./components/MediaWorkspace";
import { MediaDetailsModal } from "./components/MediaDetailsModal";

import { fetchMediaBins, fetchMediaGroups } from "shell/store/media";

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
        condition={true}
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
