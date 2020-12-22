import React, { Fragment } from "react";

import { usePermission } from "shell/hooks/use-permissions";
import { useDomain } from "shell/hooks/use-domain";

import WidgetPublishHistory from "./Widgets/WidgetPublishHistory";
import WidgetDraftHistory from "./Widgets/WidgetDraftHistory";
import WidgetPurgeItem from "./Widgets/WidgetPurgeItem";
import { Unpublish } from "./Widgets/Unpublish";
import { QuickView } from "./Widgets/QuickView";
import { WidgetQuickShare } from "./Widgets/WidgetQuickShare";
import { WidgetListed } from "./Widgets/WidgetListed";
import { WidgetDeleteItem } from "./Widgets/WidgetDeleteItem";

import styles from "./Actions.less";
export function Actions(props) {
  if (!props.item.meta || !props.item.web) {
    console.error("Actions:missing item");
    return <Fragment />;
  }

  const canPublish = usePermission("PUBLISH");
  const canDelete = usePermission("DELETE");
  const canUpdate = usePermission("UPDATE");

  const domain = useDomain();

  const { type } = props.model;
  const { publishing, scheduling, siblings } = props.item;
  const { listed, sort, updatedAt, version } = props.item.meta;
  const { path, metaTitle, metaLinkText } = props.item.web;
  const { preview_domain, basicApi } = props.instance;

  return (
    <aside className={styles.Actions}>
      <QuickView
        fields={props.fields}
        itemZUID={props.itemZUID}
        modelZUID={props.modelZUID}
        metaTitle={metaTitle}
        version={version}
        updatedAt={updatedAt}
        publishing={publishing}
        scheduling={scheduling}
        siblings={siblings}
        preview_domain={preview_domain}
        basicApi={basicApi}
      />

      <WidgetPublishHistory
        dispatch={props.dispatch}
        ZUID={props.ZUID}
        itemZUID={props.itemZUID}
      />

      <WidgetDraftHistory
        dispatch={props.dispatch}
        ZUID={props.ZUID}
        itemZUID={props.itemZUID}
      />

      {props.set.type !== "dataset" && domain && (
        <WidgetQuickShare
          url={`${domain}/${path}`}
          metaLinkText={metaLinkText}
        />
      )}

      {canUpdate && (
        <WidgetListed
          dispatch={props.dispatch}
          itemZUID={props.itemZUID}
          listed={listed}
          sort={sort}
        />
      )}

      {canPublish && (
        <WidgetPurgeItem
          dispatch={props.dispatch}
          itemZUID={props.itemZUID}
          modelZUID={props.modelZUID}
        />
      )}
      {canPublish && (
        <Unpublish
          dispatch={props.dispatch}
          publishing={publishing}
          modelZUID={props.modelZUID}
          itemZUID={props.itemZUID}
        />
      )}

      {canDelete && (
        <WidgetDeleteItem
          dispatch={props.dispatch}
          itemZUID={props.itemZUID}
          modelZUID={props.modelZUID}
          metaTitle={metaTitle}
          modelType={type}
        />
      )}
    </aside>
  );
}
