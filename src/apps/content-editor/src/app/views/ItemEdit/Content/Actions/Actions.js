import { Fragment } from "react";

import { usePermission } from "shell/hooks/use-permissions";
import { useDomain } from "shell/hooks/use-domain";

import WidgetPublishHistory from "./Widgets/WidgetPublishHistory";
import WidgetDraftHistory from "./Widgets/WidgetDraftHistory";
import WidgetPurgeItem from "./Widgets/WidgetPurgeItem";
import { WorkflowRequest } from "./Widgets/WorkflowRequest";
import { Unpublish } from "./Widgets/Unpublish";
import { WidgetQuickShare } from "./Widgets/WidgetQuickShare";
import { WidgetListed } from "./Widgets/WidgetListed";
import { WidgetDeleteItem } from "./Widgets/WidgetDeleteItem";
import { ContentLinks } from "./Widgets/ContentLinks";
import { ContentInfo } from "./Widgets/ContentInfo";

export function Actions(props) {
  if (!props.item.meta || !props.item.web) {
    console.error("Actions:missing item");
    return <Fragment />;
  }

  const canPublish = usePermission("PUBLISH", props.itemZUID);
  const canDelete = usePermission("DELETE", props.itemZUID);
  const canUpdate = usePermission("UPDATE", props.itemZUID);
  const domain = useDomain();

  const { publishing } = props.item;
  const { listed, sort } = props.item.meta;
  const { path, metaTitle, metaLinkText } = props.item.web;
  const liveURL = domain ? `${domain}${path}` : "";

  return (
    <Fragment>
      <ContentInfo modelZUID={props.modelZUID} itemZUID={props.itemZUID} />
      <ContentLinks item={props.item} />

      {/* <Release item={props.item} /> */}

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

      {canUpdate && (
        <WidgetListed
          dispatch={props.dispatch}
          itemZUID={props.itemZUID}
          listed={listed}
          sort={sort}
        />
      )}

      <WorkflowRequest itemTitle={metaTitle} fields={props.fields} />

      {props.set.type !== "dataset" && domain && (
        <WidgetQuickShare url={liveURL} metaLinkText={metaLinkText} />
      )}

      {canPublish && (
        <WidgetPurgeItem
          dispatch={props.dispatch}
          itemZUID={props.itemZUID}
          modelZUID={props.modelZUID}
          instanceZUID={props.instance.ZUID}
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
        />
      )}
    </Fragment>
  );
}
