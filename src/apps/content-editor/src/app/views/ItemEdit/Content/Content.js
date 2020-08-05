import React, { Component } from "react";

import { Editor } from "../../../components/Editor";
import { SubHeader } from "../components/SubHeader";
import { ItemVersioning } from "../components/SubHeader/ItemVersioning";

import { Actions } from "./Actions";

import styles from "./Content.less";
export default class Content extends Component {
  render() {
    return (
      <main className={styles.Content}>
        <SubHeader
          instance={this.props.instance}
          modelZUID={this.props.modelZUID}
          item={this.props.item}
        >
          <ItemVersioning
            instance={this.props.instance}
            modelZUID={this.props.modelZUID}
            itemZUID={this.props.itemZUID}
            item={this.props.item}
            userRole={this.props.userRole}
            user={this.props.user}
            saving={this.props.saving}
            onSave={this.props.onSave}
            dispatch={this.props.dispatch}
          />
        </SubHeader>

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
              userRole={this.props.userRole}
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
