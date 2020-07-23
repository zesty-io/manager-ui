import React, { useState } from "react";
import { connect } from "react-redux";

import { Notice } from "@zesty-io/core/Notice";
import { Button } from "@zesty-io/core/Button";
import { CardContent, CardFooter } from "@zesty-io/core/Card";
import { CollapsibleCard } from "@zesty-io/core/CollapsibleCard";
import { AppLink } from "@zesty-io/core/AppLink";

import {
  publishFile,
  resolvePathPart,
  fetchFiles
} from "../../../../../store/files";

import { notify } from "shell/store/notifications";

import styles from "./PublishAll.less";
export default connect(state => {
  return {
    files: state.files.filter(file => file.isLive === false)
  };
})(function PublishAll(props) {
  const [loading, setLoading] = useState(false);

  const handlePublishAll = () => {
    setLoading(true);

    const requests = props.files.map(file => {
      return props.dispatch(publishFile(file.ZUID, file.status));
    });

    Promise.all(requests)
      .then(res => {
        if (res) {
          props.dispatch(
            notify({
              kind: "success",
              message: "All files has been published"
            })
          );
        }
      })
      .catch(err => {
        props.dispatch(
          notify({
            kind: "warn",
            message: err.message
          })
        );
      })
      .finally(() => {
        setLoading(false);

        props.dispatch(fetchFiles("views"));
        props.dispatch(fetchFiles("stylesheets"));
        props.dispatch(fetchFiles("scripts"));
      });
  };

  return (
    <CollapsibleCard
      className={styles.PublishAll}
      header={
        <h1>
          <i className="fas fa-cloud-upload-alt"></i> Publish All
        </h1>
      }
    >
      <CardContent>
        <ul>
          {props.files.map(file => (
            <li key={file.ZUID}>
              <AppLink
                to={`/code/file/${resolvePathPart(file.type)}/${
                  file.ZUID
                }/diff`}
              >
                {file.fileName}
              </AppLink>
            </li>
          ))}
        </ul>

        <Notice className={styles.PublishNotice}>
          This action will publish all files in the {props.status} environment.
          Triggering a full instance cache purge. Files can only be reverted
          individually.
        </Notice>
      </CardContent>
      <CardFooter>
        <Button kind="save" onClick={handlePublishAll} disabled={loading}>
          {loading ? (
            <i className="fas fa-spinner"></i>
          ) : (
            <i className="fas fa-check-circle"></i>
          )}{" "}
          Publish All Files
        </Button>
      </CardFooter>
    </CollapsibleCard>
  );
});
