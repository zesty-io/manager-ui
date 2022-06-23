import { memo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import cx from "classnames";

import { Nav } from "@zesty-io/core/Nav";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/InfoOutlined";

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
export const FileList = memo(function FileList(props) {
  // const [branch, setBranch] = useState(props.branch);
  const [shownFiles, setShownFiles] = useState(
    props.navCode.tree.sort(byLabel)
  );

  const [stylesheetsShownFiles, setStylesheetsShownFiles] = useState(
    props.navCode.stylesheetsTree.sort(byOrder)
  );

  const [scriptsShownFiles, setScriptsShownFiles] = useState(
    props.navCode.scriptsTree.sort(byOrder)
  );

  let { pathname } = useLocation();
  let hashPath = `/${pathname}`;

  useEffect(() => {
    setShownFiles(props.navCode.tree.sort(byLabel));
    setStylesheetsShownFiles(props.navCode.stylesheetsTree.sort(byOrder));
    setScriptsShownFiles(props.navCode.scriptsTree.sort(byOrder));
  }, [props.navCode]);

  const collapseNode = (node) => {
    props.dispatch(collapseNavItem(node.path));
  };

  const actions = [
    <FontAwesomeIcon
      title="Publish file"
      icon={faCloudUploadAlt}
      className={styles.Action}
      showIcon={true}
      available={(file) => !file.isLive}
      onClick={(file) => props.dispatch(publishFile(file.ZUID, file.status))}
    />,
  ];

  return (
    <section className={styles.FileList}>
      <header className={styles.NavActions}>
        <div className={styles.Actions}>
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
          <div className={cx(styles.Action, styles.FilterFiles)}>
            <FilterFiles setShownFiles={setShownFiles} nav={props.navCode} />
          </div>
        </div>
      </header>

      <main className={styles.List}>
        <div className={styles.Files}>
          <Nav
            name="views"
            selected={hashPath}
            tree={shownFiles}
            actions={actions}
            collapseNode={collapseNode}
          />

          <header className={styles.Title}>
            <h1>
              <Tooltip
                title="Site.css is a dynamically created file from the instance
                stylesheet files"
                arrow
                placement="top-start"
              >
                <InfoIcon fontSize="small" />
              </Tooltip>
              &nbsp;site.css
            </h1>
            <OrderFiles type="text/css" />
          </header>
          <Nav
            name="css"
            selected={hashPath}
            tree={stylesheetsShownFiles}
            actions={actions}
            collapseNode={collapseNode}
          />

          <header className={styles.Title}>
            <h1>
              <Tooltip
                title="Site.js is a dynamically created file from the instance JavaScript files"
                arrow
                placement="top-start"
              >
                <InfoIcon fontSize="small" color="asdf" />
              </Tooltip>
              &nbsp;site.js
            </h1>
            <OrderFiles type="text/javascript" />
          </header>
          <Nav
            name="js"
            selected={hashPath}
            tree={scriptsShownFiles}
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
