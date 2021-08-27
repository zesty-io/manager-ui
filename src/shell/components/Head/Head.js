import { useEffect } from "react";
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
export default connect((state, props) => {
  let item;
  if (props.resourceZUID) {
    // TODO: model level tags. Currently not supported by API
    if (props.resourceZUID.charAt(0) === "6") {
    }

    // item level tags
    if (props.resourceZUID.charAt(0) === "7") {
      item = state.content[props.resourceZUID];
    }
    // instance level tags
    if (props.resourceZUID.charAt(0) === "8") {
      item = state.instance;
    }
  }

  return {
    item,
    instanceName: state.instance.name,
    tags: Object.values(state.headTags)
      .filter((tag) => tag.resourceZUID === props.resourceZUID)
      .sort((a, b) => a.sort > b.sort),
  };
})(function Head(props) {
  const domain = useDomain();

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
            Head tags are not versioned. Once saved they will take effect when
            the page(s) are next cached. Caching occurs on publish or every 24
            hours.
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
        item={props.item}
        instanceName={props.instanceName}
        domain={domain}
        tags={props.tags}
      />
    </div>
  );
});
