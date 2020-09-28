import React, { useMemo } from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faAngleRight
} from "@fortawesome/free-solid-svg-icons";

import { AppLink } from "@zesty-io/core/AppLink";
import { Url } from "@zesty-io/core/Url";

import styles from "./Breadcrumbs.less";
const crawlParents = (nav, ZUID, crumbs, content) => {
  const parent = nav[ZUID];

  if (parent) {
    crumbs.push(parent);
    if (
      parent.parentZUID &&
      !crumbs.filter(crumb => crumb.ZUID === parent.parentZUID).length
    ) {
      crawlParents(nav, parent.parentZUID, crumbs, content);
    }
  }
  // multipage set item
  else if (ZUID) {
    const item = content[ZUID];
    if (item) {
      const parentZUID = item.meta.contentModelZUID;
      crumbs.push({
        ZUID,
        contentModelZUID: parentZUID,
        label: item.web.metaLinkText,
        type: "item"
      });
      crawlParents(nav, parentZUID, crumbs, content);
    }
  }

  return crumbs;
};

export default connect(state => {
  return {
    navContent: state.navContent,
    content: state.content,
    models: state.models
  };
})(
  React.memo(function Breadcrumbs(props) {
    const trail = useMemo(() => {
      const normalizedNav = props.navContent.raw.reduce((acc, item) => {
        acc[item.ZUID] = item;
        return acc;
      }, {});

      // const initialItem = props.content[props.itemZUID];
      // const initialModel =
      //   props.models[initialItem.meta.contentModelZUID] || {};

      // // Setup initial item
      // let crumbs =
      //   initialModel.type !== "templateset"
      //     ? [
      //         {
      //           ZUID: initialItem.meta.ZUID,
      //           contentModelZUID: initialItem.meta.contentModelZUID,
      //           label:
      //             initialItem.web.metaLinkText || initialItem.web.metaTitle,
      //           type: "item"
      //         }
      //       ]
      //     : [];

      let crumbs = [];

      // recursively build bread crumb trail
      crawlParents(normalizedNav, props.itemZUID, crumbs, props.content);

      // Add Start: Content Dashboard
      crumbs.push({
        ZUID: "home",
        contentModelZUID: "home",
        label: <FontAwesomeIcon icon={faTachometerAlt} />,
        type: "home"
      });

      // Cleanup
      // crumbs.filter(el => el).reverse();

      return crumbs;
    }, [props.itemZUID, props.navContent]);

    return (
      <ol className={styles.Breadcrumbs}>
        {trail
          .filter(el => el)
          .reverse()
          .map((item, i) => {
            const url =
              item.type === "item"
                ? `/content/${item.contentModelZUID}/${item.ZUID}`
                : `/content/${item.contentModelZUID}`;

            return (
              <li key={item.ZUID} className={styles.crumb}>
                {i !== 0 && (
                  <FontAwesomeIcon
                    icon={faAngleRight}
                    style={{ color: "#afbcd4" }}
                  />
                )}
                <Url href={url}>{item.label}</Url>
              </li>
            );
          })}
      </ol>
    );
  })
);
