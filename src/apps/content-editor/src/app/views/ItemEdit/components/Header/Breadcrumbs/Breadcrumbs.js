import React, { Fragment } from "react";
import { connect } from "react-redux";

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
  const flatNav = state.contentNav.raw.reduce((acc, navItem) => {
    acc[navItem.ZUID] = navItem;
    return acc;
  }, {});
  return {
    flatNav,
    contentModelItems: state.contentModelItems,
    contentModels: state.contentModels
  };
})(props => {
  const initialItem = props.contentModelItems[props.itemZUID];
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
    label: <i className="fas fa-tachometer-alt" aria-hidden="true" />,
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
            <i style={{ color: "white" }} className="fa fa-angle-right" />
          )}
          <Url className={styles.Breadcrumb} href={url}>
            {item.label}
          </Url>
        </Fragment>
      );
    });
});
