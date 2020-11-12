import React, { useEffect } from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { Notice } from "@zesty-io/core/Notice";
import { Button } from "@zesty-io/core/Button";

import { HeadTag } from "./HeadTag";
import { Preview } from "./Preview";

import { fetchHeadTags, addHeadTag } from "shell/store/headTags";

import styles from "./Head.less";
export default connect((state, props) => {
  return {
    instance: state.instance,
    tags: Object.values(state.headTags)
      .filter(tag => tag.resourceZUID === props.resourceZUID)
      .sort((a, b) => a.sort > b.sort)
  };
})(function Head(props) {
  useEffect(() => {
    props.dispatch(fetchHeadTags());
  }, []);

  function handleAdd() {
    props.dispatch(addHeadTag(props.resourceZUID, props.tags.length));
  }

  return (
    <div className={styles.Head}>
      <main className={styles.Tags}>
        <h1 className={styles.Notice}>
          <Button kind="secondary" onClick={handleAdd} data-cy="CreateHeadTag">
            <FontAwesomeIcon icon={faPlus} />
            Create Head Tag
          </Button>

          <Notice>
            Head tags are not versioned or published. Changes to head tags take
            effect immediately on your live instance.
          </Notice>
        </h1>

        {props.tags.length ? (
          props.tags.map((tag, index) => {
            return <HeadTag key={index} tag={tag} dispatch={props.dispatch} />;
          })
        ) : (
          <h3 className={styles.NoTags}>
            No head tags have been created for this item.
          </h3>
        )}
      </main>

      <Preview
        item={props.instance}
        instanceName={props.instance.name}
        instanceTags={props.tags}
      />
    </div>
  );
});
