import React from "react";
import { connect } from "react-redux";
// import { notify } from "../../../../../shell/store/notifications";
import { addHeadTag } from "../../../store/headTags";

import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

// import { SubHeader } from "../components/SubHeader";

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
  console.log(Object.values(props.tags));
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

    // props
    //   .dispatch(
    //     createHeadTag({
    //       type: "meta",
    //       resourceZUID: props.itemZUID,
    //       custom: true,
    //       attributes: {
    //         name: "",
    //         content: ""
    //       },
    //       sort: props.tags.length || 0
    //     })
    //   )
    //   .then(res => {
    //     props.dispatch(
    //       notify({
    //         message: res.data.error ? res.data.error : "New head tag created",
    //         kind: res.data.error ? "warn" : "success"
    //       })
    //     );
    //   });
  }

  return (
    <>
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
            {Object.values(props.tags).filter(item => {
              if (item.attributes.some(el => el.key === "custom")) {
                return item;
              }
            }).length ? (
              Object.values(props.tags)
                .filter(item => {
                  if (item.attributes.some(el => el.key === "custom")) {
                    return item;
                  }
                })
                .sort(
                  (a, b) =>
                    Object.values(props.tags).indexOf(b) -
                    Object.values(props.tags).indexOf(a)
                )
                .map((tag, index) => {
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
            tags={Object.values(props.tags)}
          />
        </div>
      </div>
    </>
  );
});
