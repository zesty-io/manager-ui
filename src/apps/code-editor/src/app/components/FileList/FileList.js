import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import cx from "classnames";

import { Nav } from "@zesty-io/core/Nav";
import { Infotip } from "@zesty-io/core/Infotip";

import { CreateFile } from "./components/CreateFile";
import { OrderFiles } from "./components/OrderFiles";
import { FilterFiles } from "./components/FilterFiles";
// import { PublishAll } from "./components/PublishAll";
// import { SelectBranch } from "./components/SelectBranch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";
import { resolvePathPart, publishFile } from "../../../store/files";
import { collapseNavItem } from "../../../store/navCode";

import styles from "./FileList.less";
export const FileList = React.memo(function FileList(props) {
  // const [branch, setBranch] = useState(props.branch);
  const [shownFiles, setShownFiles] = useState(
    props.navCode.tree.sort(byLabel)
  );

  let { pathname } = useLocation();
  let hashPath = `/${pathname}`;

  useEffect(() => {
    setShownFiles(props.navCode.tree.sort(byLabel));
  }, [props.navCode]);

  const views = shownFiles.filter(file => {
    let pathPart = resolvePathPart(file.type);
    return pathPart !== "scripts" && pathPart !== "stylesheets";
  });

  const js = shownFiles
    .filter(file => resolvePathPart(file.type) === "scripts")
    .sort(byOrder);

  const css = shownFiles
    .filter(file => resolvePathPart(file.type) === "stylesheets")
    .sort(byOrder);

  const collapseNode = node => {
    props.dispatch(collapseNavItem(node.path));
  };

  const actions = [
    <FontAwesomeIcon
      title="Publish file"
      icon={faCloudUploadAlt}
      className={styles.Action}
      showIcon={true}
      available={file => !file.isLive}
      onClick={file => props.dispatch(publishFile(file.ZUID, file.status))}
    />
  ];

  return (
    <section className={styles.FileList}>
      <header className={styles.NavActions}>
        <div className={styles.Actions}>
          <div className={cx(styles.Action, styles.FilterFiles)}>
            <FilterFiles setShownFiles={setShownFiles} nav={props.navCode} />
          </div>

          {/* <div className={cx(styles.Action, styles.PublishAll)}>
              <PublishAll dispatch={props.dispatch} branch={branch} />
            </div> */}

          {/* hidden until we have API branch support */}
          {/* <div className={cx(styles.Action, styles.Branch)}>
              <SelectBranch
                setBranch={setBranch}
                branch={branch}
                branches={[]}
              />
            </div> */}

          <CreateFile
            className={cx(styles.Action, styles.CreateFile)}
            dispatch={props.dispatch}
          />
        </div>
      </header>

      <main className={styles.List}>
        <div className={styles.Files}>
          <Nav
            name="views"
            selected={hashPath}
            tree={views}
            actions={actions}
            collapseNode={collapseNode}
          />

          <header className={styles.Title}>
            <Infotip>
              Site.css is a dynamically created file from the instance
              stylesheet files
            </Infotip>
            &nbsp;
            <h1>site.css</h1>
            <OrderFiles type="text/css" />
          </header>
          <Nav
            name="css"
            selected={hashPath}
            tree={css}
            actions={actions}
            collapseNode={collapseNode}
          />

          <header className={styles.Title}>
            <Infotip>
              Site.js is a dynamically created file from the instance JavaScript
              files
            </Infotip>
            &nbsp;
            <h1>site.js</h1>
            <OrderFiles type="text/javascript" />
          </header>
          <Nav
            name="js"
            selected={hashPath}
            tree={js}
            actions={actions}
            collapseNode={collapseNode}
          />
        </div>
      </main>
    </section>
  );
});

const byLabel = (a, b) => {
  let labelA = a.label.toLowerCase().trim(); // ignore upper and lowercase
  let labelB = b.label.toLowerCase().trim(); // ignore upper and lowercase
  if (labelA < labelB) {
    return -1;
  }
  if (labelA > labelB) {
    return 1;
  }

  // names must be equal
  return 0;
};

const byOrder = (a, b) => {
  let sortA = Number(a.sort);
  let sortB = Number(b.sort);

  if (sortA < sortB) {
    return -1;
  }
  if (sortA > sortB) {
    return 1;
  }

  // names must be equal
  return 0;
};
