import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";

import { HeadTag } from "./HeadTag";
import { Preview } from "./Preview";

import { fetchGlobalItem } from "shell/store/content";
import { createHeadTag } from "../../../../store/headTags";
import { notify } from "shell/store/notifications";

import styles from "./Head.less";
export default class Head extends React.Component {
  state = {
    globals: this.props.dispatch(fetchGlobalItem())
  };

  onCreate = () => {
    this.props
      .dispatch(
        createHeadTag({
          type: "meta",
          resourceZUID: this.props.itemZUID,
          attributes: {
            name: "",
            content: ""
          },
          sort: this.props.tags.length || 0
        })
      )
      .then(res => {
        this.props.dispatch(
          notify({
            message: res.data.error ? res.data.error : "New head tag created",
            kind: res.data.error ? "warn" : "success"
          })
        );
      });
  };

  render() {
    return (
      <React.Fragment>
        <div className={styles.HeadWrap}>
          <div className={styles.Head}>
            <main className={styles.Tags}>
              <h1 className={styles.Warn}>
                <Button kind="secondary" onClick={this.onCreate}>
                  <FontAwesomeIcon icon={faPlus} />
                  New head tag
                </Button>
                <FontAwesomeIcon icon={faExclamationTriangle} /> &nbsp; Head
                tags are not versioned or published. Changes to head tags take
                effect immediately on your live instance.
              </h1>
              {this.props.tags.length ? (
                this.props.tags.map((tag, index) => {
                  return (
                    <HeadTag
                      key={index}
                      tag={tag}
                      dispatch={this.props.dispatch}
                    />
                  );
                })
              ) : (
                <h3 className={styles.NoTags}>
                  No head tags have been created for this item.
                </h3>
              )}
            </main>
            <Preview
              instanceName={this.state.globals.site_name}
              item={this.props.item}
              tags={this.props.tags}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}
