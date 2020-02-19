import React, { Component } from "react";

import { Editor } from "../../../components/Editor";

import { Actions } from "./Actions";

import styles from "./Content.less";
export default class Content extends Component {
  render() {
    return (
      <main className={styles.Content}>
        <div className={styles.MainEditor}>
          <div className={styles.Editor}>
            <Editor
              // active={this.state.makeActive}
              // scrolled={() => this.setState({ makeActive: "" })}
              model={this.props.model}
              itemZUID={this.props.itemZUID}
              item={this.props.item}
              fields={this.props.fields}
              dispatch={this.props.dispatch}
              isDirty={this.props.item.dirty}
              onSave={this.props.onSave}
            />
          </div>
          <div className={styles.Actions}>
            <Actions
              {...this.props}
              user={this.props.user}
              site={{}}
              set={{
                type: this.props.model.type
              }}
            />
          </div>
        </div>
      </main>
    );
  }
}
