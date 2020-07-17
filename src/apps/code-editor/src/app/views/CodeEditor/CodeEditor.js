import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useRouteMatch } from "react-router-dom";

import { WithLoader } from "@zesty-io/core/WithLoader";

import AppError from "../../AppError";

import { FileList } from "../../components/FileList";
import { FileTabs } from "../../components/FileTabs";
import { Workspace } from "../../components/Workspace/";

import { fetchFiles } from "../../../store/files";

import styles from "./CodeEditor.less";
export default connect(state => {
  return {
    files: state.files,
    codeNav: state.codeNav,
    status: "dev"
  };
})(function CodeEditor(props) {
  const match = useRouteMatch("/code/file/:fileType/:fileZUID");

  // On initial render load files: Templates, Stylesheets, Scripts
  useEffect(() => {
    props.dispatch(fetchFiles("views"));
    props.dispatch(fetchFiles("stylesheets"));
    props.dispatch(fetchFiles("scripts"));
  }, []);

  useEffect(() => {
    const handleEditorClose = evt => {
      if (props.files.find(f => f.dirty)) {
        // Cancel the event
        evt.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
        // Chrome requires returnValue to be set
        evt.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleEditorClose);

    return () => {
      window.removeEventListener("beforeunload", handleEditorClose);
    };
  });

  return (
    <AppError>
      <main className={styles.CodeEditor}>
        <WithLoader
          condition={props.files.length}
          message="Starting Code Editor"
          width="100vw"
        >
          <nav className={styles.Nav}>
            <FileList
              branch={props.status}
              codeNav={props.codeNav}
              dispatch={props.dispatch}
              openFileZUID={match && match.params.fileZUID}
            />
          </nav>
          <section className={styles.FileEditor}>
            <FileTabs
              dispatch={props.dispatch}
              files={props.files}
              openFileZUID={match && match.params.fileZUID}
              status={props.status}
            />
            <Workspace
              dispatch={props.dispatch}
              files={props.files}
              status={props.status}
            />
          </section>
        </WithLoader>
      </main>
    </AppError>
  );
});
