import React from "react";

import { Header } from "../components/Header";
import { ItemVersioning } from "../components/Header/ItemVersioning";

import { ItemSettings } from "./ItemSettings";
import { DataSettings } from "./ItemSettings/DataSettings";

import styles from "./Meta.less";
export class Meta extends React.PureComponent {
  render() {
    return (
      <section className={styles.MetaEdit}>
        <Header
          instance={this.props.instance}
          modelZUID={this.props.modelZUID}
          model={this.props.model}
          itemZUID={this.props.itemZUID}
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
        </Header>

        {this.props.model && this.props.model.type === "dataset" ? (
          <DataSettings item={this.props.item} dispatch={this.props.dispatch} />
        ) : (
          <ItemSettings
            instance={this.props.instance}
            modelZUID={this.props.modelZUID}
            item={this.props.item}
            content={this.props.items}
            dispatch={this.props.dispatch}
          />
        )}
      </section>
    );
  }
}
