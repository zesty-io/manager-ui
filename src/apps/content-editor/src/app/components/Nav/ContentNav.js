import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useHistory } from "react-router";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsAlt,
  faCaretDown,
  faCaretLeft
} from "@fortawesome/free-solid-svg-icons";
import { ReorderNav } from "../ReorderNav";
import { Nav } from "@zesty-io/core/Nav";
import { Button } from "@zesty-io/core/Button";
import { Select, Option } from "@zesty-io/core/Select";

import { collapseNavItem, hideNavItem } from "../../../store/navContent";

import styles from "./ContentNav.less";
export function ContentNav(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const [selected, setSelected] = useState(location.pathname);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [hiddenOpen, setHiddenOpen] = useState(false);

  useEffect(() => {
    setSelected(location.pathname);
  }, [location]);

  const collapseNode = nodeProps => {
    dispatch(collapseNavItem(nodeProps.path));
  };

  const handleCreateSelect = ZUID => {
    if (ZUID && ZUID != "0") {
      history.push(`/content/${ZUID}/new`);
    }
  };

  const actions = [
    {
      icon: "fas fa-eye-slash",
      onClick: nodeProps => {
        dispatch(hideNavItem(nodeProps.path));
      }
    }
  ];

  return (
    <React.Fragment>
      <div className={styles.Actions}>
        <Select
          name="createItemFromModel"
          className={`${styles.CreateSelect} ${styles.Select} CreateItemDropdown`}
          onSelect={handleCreateSelect}
          value="0"
        >
          <Option value="0" text="— Create Item —" />
          <Option value="link" text="Internal/External Link" />
          {Object.keys(props.models)
            .filter(modelZUID => {
              return (
                props.models[modelZUID].label !==
                ("Dashboard Widgets" || "Widgets")
              );
            })
            .sort((a, b) => {
              return props.models[a].label >= props.models[b].label ? 1 : -1;
            })
            .map(modelZUID => (
              <Option
                key={modelZUID}
                value={modelZUID}
                text={props.models[modelZUID].label}
              />
            ))}
        </Select>
        <Button id="ReorderNavButton" onClick={() => setReorderOpen(true)}>
          <FontAwesomeIcon
            icon={faArrowsAlt}
            title="Re-order content navigation"
          />
        </Button>
      </div>

      <div className={styles.NavWrap}>
        <h1 className={styles.NavTitle}>Content</h1>
        <Nav
          id="MainNavigation"
          className={styles.Nav}
          tree={props.nav.nav}
          selected={selected}
          collapseNode={collapseNode}
          actions={actions}
        />

        <h1 className={styles.NavTitle}>Headless Content Models</h1>
        <Nav
          id="HeadlessNavigation"
          className={styles.Nav}
          tree={props.nav.headless}
          selected={selected}
          collapseNode={collapseNode}
          actions={actions}
        />

        <div className={styles.HiddenNav}>
          <h1
            className={styles.NavTitle}
            onClick={() => setHiddenOpen(!hiddenOpen)}
          >
            <span style={{ flex: 1 }}>Hidden Items</span>
            {hiddenOpen ? (
              <FontAwesomeIcon icon={faCaretDown} />
            ) : (
              <FontAwesomeIcon icon={faCaretLeft} />
            )}
          </h1>
          <Nav
            id="HiddenNav"
            className={(styles.Nav, hiddenOpen ? "" : styles.HiddenNavClosed)}
            tree={props.nav.hidden}
            selected={selected}
            collapseNode={collapseNode}
            actions={actions}
          />
        </div>
      </div>

      {reorderOpen && <ReorderNav handleClose={() => setReorderOpen(false)} />}
    </React.Fragment>
  );
}
