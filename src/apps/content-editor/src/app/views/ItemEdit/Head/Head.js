import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";
import { Notice } from "@zesty-io/core/Notice";

import { HeadTag } from "./HeadTag";
import { Preview } from "./Preview";

import { fetchGlobalItem } from "shell/store/content";
import { createHeadTag } from "../../../../store/headTags";
import { notify } from "shell/store/notifications";

import { Header } from "../components/Header";

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
      <div className={styles.ContentHead}>
        <Header
          instance={this.props.instance}
          modelZUID={this.props.modelZUID}
          model={this.props.model}
          itemZUID={this.props.itemZUID}
          item={this.props.item}
        ></Header>

        <div className={styles.Head}>
          <main className={styles.Tags}>
            <div className={styles.Warn}>
              <Button
                className={styles.Button}
                kind="secondary"
                onClick={this.onCreate}
              >
                <FontAwesomeIcon icon={faPlus} />
                Create Head Tag
              </Button>
              <Notice>
                Head tags are not versioned or published. Changes to head tags
                take effect immediately on your live instance.
              </Notice>
            </div>
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
              <h3 className={styles.title}>
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
    );
  }
}
