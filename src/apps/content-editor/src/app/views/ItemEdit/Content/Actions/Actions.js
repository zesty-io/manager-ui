import React, { PureComponent, Fragment } from "react";

import WidgetPublishHistory from "./Widgets/WidgetPublishHistory";
import WidgetDraftHistory from "./Widgets/WidgetDraftHistory";
import WidgetPurgeItem from "./Widgets/WidgetPurgeItem";
import { Unpublish } from "./Widgets/Unpublish";
import { QuickView } from "./Widgets/QuickView";
import { WidgetQuickShare } from "./Widgets/WidgetQuickShare";
import { WidgetListed } from "./Widgets/WidgetListed";
import { WidgetDeleteItem } from "./Widgets/WidgetDeleteItem";

import styles from "./Actions.less";
export class Actions extends PureComponent {
  render() {
    if (!this.props.item.meta || !this.props.item.web) {
      console.error("Actions:missing item");
      return <Fragment />;
    }

    const is_developer = this.props.userRole.name === "Developer";

    const { type } = this.props.model;
    const { publishing, scheduling, siblings } = this.props.item;
    const { listed, sort, updatedAt, version } = this.props.item.meta;
    const { path, metaTitle, metaLinkText } = this.props.item.web;
    const {
      live_domain,
      preview_domain,
      protocol,
      basicApi
    } = this.props.instance;

    return (
      <aside className={styles.Actions}>
        <QuickView
          fields={this.props.fields}
          itemZUID={this.props.itemZUID}
          modelZUID={this.props.modelZUID}
          metaTitle={metaTitle}
          version={version}
          updatedAt={updatedAt}
          publishing={publishing}
          scheduling={scheduling}
          siblings={siblings}
          live_domain={live_domain}
          preview_domain={preview_domain}
          protocol={protocol}
          basicApi={basicApi}
          is_developer={is_developer}
        />

        <WidgetPublishHistory
          dispatch={this.props.dispatch}
          ZUID={this.props.ZUID}
          itemZUID={this.props.itemZUID}
        />

        <WidgetDraftHistory
          dispatch={this.props.dispatch}
          ZUID={this.props.ZUID}
          itemZUID={this.props.itemZUID}
        />

        {this.props.set.type !== "dataset" && (
          <WidgetQuickShare
            live_domain={live_domain}
            preview_domain={preview_domain}
            path={path}
            metaLinkText={metaLinkText}
          />
        )}

        {this.props.userRole.name !== "Contributor" && (
          <WidgetListed
            dispatch={this.props.dispatch}
            itemZUID={this.props.itemZUID}
            listed={listed}
            sort={sort}
          />
        )}

        {(this.props.userRole.systemRole.publish || this.props.user.staff) && (
          <WidgetPurgeItem
            dispatch={this.props.dispatch}
            itemZUID={this.props.itemZUID}
            modelZUID={this.props.modelZUID}
          />
        )}
        {(this.props.userRole.systemRole.publish || this.props.user.staff) && (
          <Unpublish
            dispatch={this.props.dispatch}
            publishing={publishing}
            modelZUID={this.props.modelZUID}
            itemZUID={this.props.itemZUID}
          />
        )}

        {(this.props.userRole.systemRole.delete || this.props.user.staff) && (
          <WidgetDeleteItem
            dispatch={this.props.dispatch}
            itemZUID={this.props.itemZUID}
            modelZUID={this.props.modelZUID}
            metaTitle={metaTitle}
            modelType={type}
          />
        )}
      </aside>
    );
  }
}
