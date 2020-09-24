import React, { Fragment } from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faAngleRight
} from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core";

import styles from "./Breadcrumbs.less";
const crawlParents = (nav, ZUID, crumbs) => {
  const parent = nav[ZUID];

  if (parent) {
    crumbs.push(parent);
    if (
      parent.parentZUID &&
      !crumbs.filter(crumb => crumb.ZUID === parent.parentZUID).length
    ) {
      crawlParents(nav, parent.parentZUID, crumbs);
    }
  }

  return crumbs;
};

export default connect(state => {
  const flatNav = state.navContent.raw.reduce((acc, navItem) => {
    acc[navItem.ZUID] = navItem;
    return acc;
  }, {});
  return {
    flatNav,
    content: state.content,
    contentModels: state.models
  };
})(props => {
  const initialItem = props.content[props.itemZUID];
  const initialModel =
    props.contentModels[initialItem.meta.contentModelZUID] || {};
  const initialZUID =
    initialModel.type === "templateset"
      ? initialItem.meta.ZUID
      : initialItem.meta.contentModelZUID;

  const arr =
    initialModel.type !== "templateset"
      ? [
          {
            ZUID: initialItem.meta.ZUID,
            contentModelZUID: initialItem.meta.contentModelZUID,
            label: initialItem.web.metaLinkText || initialItem.web.metaTitle,
            type: "item"
          }
        ]
      : [];

  const crumbs = crawlParents(props.flatNav, initialZUID, arr);

  // Content Dashboard
  crumbs.push({
    ZUID: "home",
    contentModelZUID: "home",
    label: <FontAwesomeIcon icon={faTachometerAlt} />,
    type: "home"
  });

  return crumbs
    .filter(item => item)
    .reverse()
    .map((item, i) => {
      const url =
        item.type === "item"
          ? `/content/${item.contentModelZUID}/${item.ZUID}`
          : `/content/${item.contentModelZUID}`;

      return (
        <Fragment key={item.ZUID}>
          {i !== 0 && (
            <FontAwesomeIcon icon={faAngleRight} style={{ color: "white" }} />
          )}
          <Url className={styles.Breadcrumb} href={url}>
            {item.label}
          </Url>
        </Fragment>
      );
    });
});
