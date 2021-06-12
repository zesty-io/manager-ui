import React, { useEffect } from "react";
import { connect } from "react-redux";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { Notice } from "@zesty-io/core/Notice";
import { Button } from "@zesty-io/core/Button";
import { HeadTag } from "./HeadTag";
import { Preview } from "./Preview";
import { fetchHeadTags, addHeadTag } from "shell/store/headTags";
import { useDomain } from "shell/hooks/use-domain";
import styles from "./Head.less";
import { useGetInstanceQuery } from "shell/services/accounts";

export default connect((state, props) => {
  return {
    tags: Object.values(state.headTags)
      .filter(tag => tag.resourceZUID === props.resourceZUID)
      .sort((a, b) => a.sort > b.sort)
  };
})(function Head({ resourceZUID }) {
  const domain = useDomain();
  const { data: instance } = useGetInstanceQuery();
  let item;
  if (resourceZUID) {
    // TODO: model level tags. Currently not supported by API
    if (resourceZUID.charAt(0) === "6") {
    }

    // item level tags
    if (resourceZUID.charAt(0) === "7") {
      item = state.content[resourceZUID];
    }
    // instance level tags
    if (resourceZUID.charAt(0) === "8") {
      item = instance;
    }
  }

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
            Head tags are not versioned or published. Saved changes to head tags
            take effect immediately on your live instance.
          </Notice>
        </h1>

        {props.tags.length ? (
          props.tags.map((tag, index) => {
            return <HeadTag key={index} tag={tag} dispatch={props.dispatch} />;
          })
        ) : (
          <h3 className={cx(styles.headline, styles.NoTags)}>
            No head tags have been created for this item.
          </h3>
        )}
      </main>

      <Preview
        item={item}
        instanceName={instance.name}
        domain={domain}
        tags={props.tags}
      />
    </div>
  );
});
