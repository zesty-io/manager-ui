import React from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { Notice } from "@zesty-io/core/Notice";
import { Button } from "@zesty-io/core/Button";

import { HeadTag } from "./HeadTag";
import { Preview } from "./Preview";

import { addHeadTag } from "../../../store/headTags";

import styles from "./Head.less";
export default connect(state => {
  return {
    instance: state.instance,
    tags: Object.values(state.headTags)
      .filter(tag => tag.resourceZUID === state.instance.ZUID)
      .sort((a, b) => a.sort > b.sort)
  };
})(function Head(props) {
  function onAdd() {
    props.dispatch(
      addHeadTag({
        ZUID: `${props.instance.ZUID}-${props.tags.length}`,
        type: "meta",
        resourceZUID: props.instance.ZUID,
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
        sort: props.tags.length || 0
      })
    );
  }

  return (
    <div className={styles.HeadWrap}>
      <div className={styles.Head}>
        <main className={styles.Tags}>
          <h1 className={styles.Warn}>
            <Button kind="secondary" onClick={onAdd} id="NewHeadtag">
              <FontAwesomeIcon icon={faPlus} />
              Create Head Tag
            </Button>

            <Notice>
              Head tags are not versioned or published. Changes to head tags
              take effect immediately on your live instance.
            </Notice>
          </h1>

          {props.tags.length ? (
            props.tags.map((tag, index) => {
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
          instanceName={props.instance.name}
          item={props.instance}
          instanceTags={props.tags}
        />
      </div>
    </div>
  );
});
