import React from "react";
import { connect } from "react-redux";

import { ItemSettings } from "./ItemSettings";
import { DataSettings } from "./ItemSettings/DataSettings";

import styles from "./Meta.less";
export class Meta extends React.PureComponent {
  render() {
    return (
      <section className={styles.MetaEdit} id="ITEM_SETTINGS">
        {this.props.model && this.props.model.type === "dataset" ? (
          <DataSettings item={this.props.item} dispatch={this.props.dispatch} />
        ) : (
          <ItemSettings
            instance={this.props.instance}
            modelZUID={this.props.modelZUID}
            item={this.props.item}
            contentModelItems={this.props.items}
            dispatch={this.props.dispatch}
          />
        )}
      </section>
    );
  }
}
