import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useHistory } from "react-router";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faArrowsAlt } from "@fortawesome/free-solid-svg-icons";
import { ReorderNav } from "../ReorderNav";
import { Nav } from "@zesty-io/core/Nav";
import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Select, Option } from "@zesty-io/core/Select";

import { collapseNavItem, hideNavItem } from "store/navContent";

import styles from "./ContentNav.less";
export function ContentNav(props) {
  console.log("ContentNav:render", props);

  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const [selected, setSelected] = useState(location.pathname);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [hiddenOpen, setHiddenOpen] = useState(false);

  useEffect(() => {
    setSelected(location.pathname);
  }, [location]);

  const handleOpen = path => {
    dispatch(collapseNavItem(path));
  };

  const handleHide = path => {
    dispatch(hideNavItem(path));
  };

  const handleCreateSelect = (name, ZUID) => {
    if (ZUID && ZUID != "0") {
      history.push(`/content/${ZUID}/new`);
    }
  };

  return (
    <React.Fragment>
      <div className={styles.Actions}>
        <ButtonGroup className={styles.ButtonGroup}>
          <Button
            title="Open content search"
            onClick={() =>
              riot.mount(document.querySelector("#modalMount"), "z-spotlight")
            }
          >
            <FontAwesomeIcon icon={faSearch} />
            Search
          </Button>
          <Button id="ReorderNavButton" onClick={() => setReorderOpen(true)}>
            <FontAwesomeIcon
              icon={faArrowsAlt}
              title="Re-order content navigation"
            />
            Reorder
          </Button>
        </ButtonGroup>

        <Select
          name="createItemFromModel"
          className={`${styles.CreateSelect} ${styles.Select} CreateItemDropdown`}
          onSelect={handleCreateSelect}
          value="0"
        >
          <Option value="0" text="— Create New Item —" />
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
      </div>

      <div className={styles.NavWrap}>
        <h1 className={styles.NavTitle}>Content</h1>
        <Nav
          id="MainNavigation"
          className={styles.Nav}
          tree={props.nav.nav}
          selected={selected}
          handleOpen={handleOpen}
          handleHide={handleHide}
        />

        <h1 className={styles.NavTitle}>Headless Content Models</h1>
        <Nav
          id="HeadlessNavigation"
          className={styles.Nav}
          tree={props.nav.headless}
          selected={selected}
          handleOpen={handleOpen}
          handleHide={handleHide}
        />

        <div className={styles.HiddenNav}>
          <h1
            className={styles.NavTitle}
            onClick={() => setHiddenOpen(!hiddenOpen)}
          >
            <span style={{ flex: 1 }}>Hidden Items</span>
            <i
              className={hiddenOpen ? "fa fa-caret-down" : "fa fa-caret-left"}
            />
          </h1>
          <Nav
            id="HiddenNav"
            className={(styles.Nav, hiddenOpen ? "" : styles.HiddenNavClosed)}
            tree={props.nav.hidden}
            selected={selected}
            handleOpen={handleOpen}
            handleHide={handleHide}
          />
        </div>
      </div>

      {reorderOpen && <ReorderNav handleClose={() => setReorderOpen(false)} />}
    </React.Fragment>
  );
}
