import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import cx from "classnames";
import usePrevious from "react-use/lib/usePrevious";
import debounce from "lodash/debounce";

import { AppLink } from "@zesty-io/core/AppLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

import { closeTab, openTab, loadTabs, rebuildTabs } from "shell/store/ui";

import styles from "./GlobalTabs.less";

const MIN_TAB_WIDTH = 150;
const MAX_TAB_WIDTH = 200;
const TAB_PADDING = 16;
const TAB_BORDER = 1;

export default memo(function GlobalTabs() {
  const location = useLocation();
  const dispatch = useDispatch();
  const tabs = useSelector((state) => state.ui.tabs);
  const instanceZUID = useSelector((state) => state.instance.ZUID);
  const loadedTabs = useSelector((state) => state.ui.loadedTabs);
  const prevPath = usePrevious(location.pathname);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const models = useSelector((state) => state.models);
  const content = useSelector((state) => state.content);
  const files = useSelector((state) => state.files);
  const mediaGroups = useSelector((state) => state.media.groups);
  const [tabBarWidth, setTabBarWidth] = useState(0);

  // update state if window is resized (debounced)
  useEffect(() => {
    const debouncedResize = debounce(function handleResize() {
      setWindowWidth(window.innerWidth);
    }, 300);

    window.addEventListener("resize", debouncedResize);
    return () => window.removeEventListener("resize", debouncedResize);
  }, []);

  // load tabs from Indexeddb
  useEffect(() => {
    dispatch(loadTabs(instanceZUID));
  }, [instanceZUID]);

  // openTab every time path changes
  useEffect(() => {
    if (loadedTabs) {
      dispatch(openTab({ path: location.pathname, prevPath }));
    }
  }, [loadedTabs, location.pathname]);

  // rebuild tabs if any of the store slices changes
  // slices could include tab.name updates
  useEffect(() => {
    if (loadedTabs) {
      dispatch(rebuildTabs());
    }
  }, [loadedTabs, models, content, files, mediaGroups]);

  const activeTabRef = useRef();
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView();
    }
  }, [tabs]);

  // measure the tab bar width and set state
  // to trigger a synchronous re-render before paint
  // recalculate tab bar width if window is resized
  const tabContainerRef = useRef(null);
  useLayoutEffect(() => {
    if (tabContainerRef.current) {
      setTabBarWidth(
        Math.floor(tabContainerRef.current.getBoundingClientRect().width)
      );
    }
  }, [windowWidth]);

  // we want to synchronize tabs.length with tab width
  // if we used useEffect here, we would get new tabs.length
  // with old tab width
  // cheap enough to run every render
  let tabWidth = 0;
  if (tabs.length) {
    tabWidth =
      Math.floor(
        Math.min(
          Math.max(tabBarWidth / tabs.length, MIN_TAB_WIDTH),
          MAX_TAB_WIDTH
        )
      ) -
      TAB_PADDING -
      TAB_BORDER;
  }

  return (
    <nav ref={tabContainerRef} className={styles.QuickLinks}>
      <ol className={styles.Links}>
        {tabs.map((tab, i) => {
          const isActiveTab = tab.pathname === location.pathname;
          const tabProps = {};
          if (isActiveTab) {
            tabProps.ref = activeTabRef;
          }
          return (
            <li
              {...tabProps}
              key={i}
              style={{ width: `${tabWidth}px` }}
              className={cx(styles.Route, isActiveTab ? styles.active : null)}
            >
              <AppLink to={`${tab.pathname}`}>
                {tab.icon && <FontAwesomeIcon icon={tab.icon} />}
                &nbsp;
                {tab.name ? tab.name : `${tab.pathname.slice(1)}`}
              </AppLink>
              <span
                className={styles.Close}
                onClick={() => dispatch(closeTab(tab.pathname))}
              >
                <FontAwesomeIcon icon={faTimesCircle} />
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
