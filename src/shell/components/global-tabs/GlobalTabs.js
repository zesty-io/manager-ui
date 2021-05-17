import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import cx from "classnames";
import usePrevious from "react-use/lib/usePrevious";
import debounce from "lodash/debounce";

import { AppLink } from "@zesty-io/core/AppLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

import { closeTab, openTab, loadTabs } from "shell/store/ui";

import styles from "./GlobalTabs.less";

export default React.memo(function GlobalTabs() {
  const history = useHistory();
  const dispatch = useDispatch();
  const tabs = useSelector(state => state.ui.tabs);
  const instanceZUID = useSelector(state => state.instance.ZUID);
  const loadedTabs = useSelector(state => state.ui.loadedTabs);
  const prevPath = usePrevious(history.location.pathname);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const models = useSelector(state => state.models);
  const content = useSelector(state => state.content);
  const files = useSelector(state => state.files);
  const mediaGroups = useSelector(state => state.mediaGroups);

  console.log("render GlobalTabs");

  useEffect(() => {
    const debouncedResize = debounce(function handleResize() {
      setWindowWidth(window.innerWidth);
    }, 300);

    window.addEventListener("resize", debouncedResize);
    return () => window.removeEventListener("resize", debouncedResize);
  }, []);

  useEffect(() => {
    dispatch(loadTabs(instanceZUID, history.location.pathname));
  }, [instanceZUID]);

  useEffect(() => {
    if (loadedTabs) {
      console.log("openTab");
      dispatch(openTab({ path: history.location.pathname, prevPath }));
    }
  }, [history.location.pathname, loadedTabs, models, content, files, mediaGroups]);

  const tabContainerRef = useRef(null);
  const tabRefs = useRef([]);
  useLayoutEffect(() => {
    if (tabContainerRef.current) {
      console.log(
        "useLayoutEffect: updating tab widths, numRoutes: ",
        tabs.length
      );
      const { width } = tabContainerRef.current.getBoundingClientRect();
      const NUM_TABS = tabs.length;
      const TAB_BAR_WIDTH = Math.floor(width);
      const MIN_TAB_WIDTH = 100;
      const MAX_TAB_WIDTH = 200;
      const TAB_PADDING = 16;
      const TAB_BORDER = 1;
      const TAB_WIDTH = Math.floor(
        Math.min(
          Math.max(TAB_BAR_WIDTH / NUM_TABS, MIN_TAB_WIDTH),
          MAX_TAB_WIDTH
        )
      );
      const INNER_TAB_WIDTH = TAB_WIDTH - TAB_PADDING - TAB_BORDER;
      tabRefs.current.forEach((ref, index) => {
        // sometimes tabs[index] is stale reference
        if (tabs[index]) {
          console.log(tabs[index], ref, INNER_TAB_WIDTH);
          ref.style.width = `${INNER_TAB_WIDTH}px`;
        }
      });
    }
  }, [tabs.length, windowWidth]);

  return (
    <nav ref={tabContainerRef} className={styles.QuickLinks}>
      <ol className={styles.Links}>
        {tabs.map((tab, i) => (
          <li
            key={i}
            ref={element => {
              if (element) {
                tabRefs.current[i] = element;
              }
            }}
            className={cx(
              styles.Route,
              tab.pathname === history.location.pathname ? styles.active : null
            )}
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
        ))}
      </ol>
    </nav>
  );
});
