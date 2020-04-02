import React from "react";
import { connect } from "react-redux";
import { addHeadTag } from "../../../store/headTags";

import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

import { HeadTag } from "./HeadTag";
import { Preview } from "./Preview";

import styles from "./Head.less";

export default connect(state => {
  console.log("Head::", state);
  return {
    itemZUID: state.instance.ZUID,
    tags: state.headTags,
    item: state.instance
  };
})(function Head(props) {
  function onAdd() {
    const idTag = Object.values(props.tags).length;
    props.dispatch(
      addHeadTag({
        ZUID: `${props.itemZUID}-${idTag}`,
        type: "meta",
        resourceZUID: props.itemZUID,
        custom: true,
        attributes: [
          {
            key: "content",
            value: ""
          },
          {
            key: "name",
            value: ""
          },
          {
            key: "custom",
            value: "true"
          }
        ],
        sort: Object.values(props.tags).length || 0
      })
    );
  }

  const filteredTags = Object.values(props.tags).filter(item => {
    if (item.attributes.some(el => el.key === "custom")) {
      return item;
    }
  });

  const sortedTags = filteredTags.sort(
    (a, b) =>
      Object.values(props.tags).indexOf(b) -
      Object.values(props.tags).indexOf(a)
  );

  const instanceTags = Object.values(props.tags).filter(item => {
    if (
      !item.attributes.some(el => el.key === "custom") &&
      item.resourceZUID === window.zesty.site.zuid
    ) {
      return item;
    }
  });

  return (
    <div className={styles.HeadWrap}>
      <div className={styles.Head}>
        <main className={styles.Tags}>
          <h1 className={styles.Warn}>
            <Button kind="secondary" onClick={onAdd}>
              <i className="fa fa-plus" />
              New head tag
            </Button>
            <i className="fa fa-exclamation-triangle" aria-hidden="true" />
            &nbsp; Head tags are not versioned or published. Changes to head
            tags take effect immediately on your live instance.
          </h1>
          {filteredTags.length ? (
            sortedTags.map((tag, index) => {
              return (
                <HeadTag key={index} tag={tag} dispatch={props.dispatch} />
              );
            })
          ) : (
            <h3 className={styles.NoTags}>
              No head tags have been created for this item.
            </h3>
          )}
        </main>
        <Preview
          instanceName={props.item.name}
          item={props.item}
          instanceTags={instanceTags}
          tags={sortedTags}
        />
      </div>
    </div>
  );
});
