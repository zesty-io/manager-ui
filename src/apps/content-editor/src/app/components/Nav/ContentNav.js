import { Fragment, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useHistory } from "react-router";
import { Link } from "react-router-dom";
import cx from "classnames";
import { ContentNavToggle } from "./components/ContentNavToggle";

import { actions as uiActions } from "../../../../../../shell/store/ui";

import { Select, MenuItem, Button } from "@mui/material";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import HomeIcon from "@mui/icons-material/Home";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretLeft,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { ReorderNav } from "../ReorderNav";
import { Nav } from "@zesty-io/core/Nav";

import { Notice } from "@zesty-io/core/Notice";

import ItemsFilter from "./ItemsFilter";
import { collapseNavItem, hideNavItem } from "../../../store/navContent";

import styles from "./ContentNav.less";

export function ContentNav(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const ui = useSelector((state) => state.ui);

  const [selected, setSelected] = useState(location.pathname);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [hiddenOpen, setHiddenOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [filteredItems, setFilteredItems] = useState(
    props.nav.nav.sort(bySort)
  );

  const [mouseEnterTimer, setMouseEnterTimer] = useState(null);
  const [mouseLeaveTimer, setMouseLeaveTimer] = useState(null);

  const handleMouseEnter = () => {
    const enterTimer = setTimeout(() => {
      dispatch(uiActions.setContentNavHover(true));
    }, 500);

    setMouseEnterTimer(enterTimer);
  };

  const handleMouseLeave = () => {
    const leaveTimer = setTimeout(() => {
      dispatch(uiActions.setContentNavHover(false));
    }, 500);
    setMouseLeaveTimer(leaveTimer);

    clearTimeout(mouseEnterTimer);
    clearTimeout(mouseLeaveTimer);
  };

  useEffect(() => {
    setFilteredItems(props.nav.nav.sort(byLabel));
  }, [props.nav]);

  useEffect(() => {
    setSelected(location.pathname);
  }, [location]);

  const collapseNode = (nodeProps) => {
    dispatch(collapseNavItem(nodeProps.path));
  };

  const handleCreateSelect = (e) => {
    const ZUID = e.target.value;
    if (ZUID && ZUID != "0") {
      history.push(`/content/${ZUID}/new`);
    }
  };

  const actions = [
    <FontAwesomeIcon
      title="Hide from nav"
      icon={faEyeSlash}
      onClick={(props) => {
        dispatch(hideNavItem(props.path));
      }}
    />,
  ];

  const toggleModal = () => {
    setReorderOpen(!reorderOpen);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cx(
        styles.NavContainer,
        ui.contentNavHover && !ui.contentNav ? styles.ContentNavHover : "",
        ui.contentNav ? styles.ContentNavOpen : ""
      )}
    >
      <div className={styles.Actions}>
        <Select
          name="createItemFromModel"
          className={`${styles.CreateSelect} ${styles.Select} CreateItemDropdown`}
          onChange={handleCreateSelect}
          defaultValue="0"
          size="small"
        >
          <MenuItem value="0">— Create Item —</MenuItem>
          <MenuItem value="link">Internal/External Link</MenuItem>
          {Object.keys(props.models)
            .filter((modelZUID) => {
              // exclude these special models from the create item list
              return !["widgets", "clippings", "globals"].includes(
                props?.models[modelZUID]?.name.toLowerCase()
              );
            })
            .sort((a, b) => {
              return props.models[a].label >= props.models[b].label ? 1 : -1;
            })
            .map((modelZUID) => (
              <MenuItem key={modelZUID} value={modelZUID}>
                {props.models[modelZUID].label}
              </MenuItem>
            ))}
        </Select>
        <Button variant="contained" id="ReorderNavButton" onClick={toggleModal}>
          <ZoomOutMapIcon
            fontSize="small"
            title="Re-order content navigation"
          />
        </Button>
      </div>
      <ItemsFilter
        setFilteredItems={setFilteredItems}
        nav={props.nav}
        setSearchTerm={setSearchTerm}
        searchTerm={searchTerm}
      />
      <div
        className={cx(
          styles.NavWrap,
          !ui.contentNav ? styles.NavWrapClosed : " "
        )}
      >
        <div className={styles.NavTitle}>
          <h1>Content</h1>

          <Link to="/content">
            <Button variant="outlined" size="small">
              <HomeIcon title="Dashboard" fontSize="small" />
            </Button>
          </Link>
        </div>
        {searchTerm && filteredItems.length === 0 && (
          <>
            <Notice>No Search Results for "{searchTerm}"</Notice>

            <Button
              variant="contained"
              color="secondary"
              onClick={() => setSearchTerm("")}
              startIcon={<DoDisturbAltIcon title="Clear Search" />}
              sx={{
                mt: 1,
                ml: 1,
              }}
            >
              clear filter
            </Button>
          </>
        )}
        {searchTerm && (
          <Nav
            id="MainNavigation"
            className={styles.Nav}
            lightMode="true"
            tree={filteredItems}
            selected={selected}
            collapseNode={collapseNode}
            actions={actions}
          />
        )}
        {!searchTerm && (
          <Nav
            id="MainNavigation"
            lightMode="true"
            className={styles.Nav}
            tree={props.nav.nav}
            selected={selected}
            collapseNode={collapseNode}
            actions={actions}
          />
        )}
        {!searchTerm && (
          <h1 className={styles.NavTitle}>Headless Content Models</h1>
        )}
        {!searchTerm && (
          <Nav
            id="HeadlessNavigation"
            lightMode="true"
            className={styles.Nav}
            tree={props.nav.headless}
            selected={selected}
            collapseNode={collapseNode}
            actions={actions}
          />
        )}
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
            lightMode="true"
            selected={selected}
            collapseNode={collapseNode}
            actions={actions}
          />
        </div>
      </div>

      <ReorderNav isOpen={reorderOpen} toggleOpen={toggleModal} />
      <ContentNavToggle />
    </div>
  );
}

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

const bySort = (a, b) => {
  let aSort = a.sort == null ? 1000 : a.sort;
  let bSort = b.sort == null ? 1000 : b.sort;
  return aSort - bSort;
};
