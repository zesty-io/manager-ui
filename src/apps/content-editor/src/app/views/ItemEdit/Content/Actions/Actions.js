import { Fragment } from "react";

import { usePermission } from "shell/hooks/use-permissions";
import { useDomain } from "shell/hooks/use-domain";

import WidgetPublishHistory from "./Widgets/WidgetPublishHistory";
import WidgetDraftHistory from "./Widgets/WidgetDraftHistory";
import WidgetPurgeItem from "./Widgets/WidgetPurgeItem";
import { WorkflowRequest } from "./Widgets/WorkflowRequest";
import { Unpublish } from "./Widgets/Unpublish";
import { QuickView } from "./Widgets/QuickView";
import { WidgetQuickShare } from "./Widgets/WidgetQuickShare";
import { WidgetListed } from "./Widgets/WidgetListed";
import { WidgetDeleteItem } from "./Widgets/WidgetDeleteItem";
import { ContentLinks } from "./Widgets/ContentLinks";
import { ContentInfo } from "./Widgets/ContentInfo";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";

export function Actions(props) {
  if (!props.item.meta || !props.item.web) {
    console.error("Actions:missing item");
    return <Fragment />;
  }

  const canPublish = usePermission("PUBLISH");
  const canDelete = usePermission("DELETE");
  const canUpdate = usePermission("UPDATE");
  const domain = useDomain();

  const { publishing, scheduling, siblings } = props.item;
  const { listed, sort, updatedAt, version } = props.item.meta;
  const { path, metaTitle, metaLinkText } = props.item.web;
  const { basicApi } = props.instance;
  const liveURL = domain ? `${domain}${path}` : "";

  return (
    <Fragment>
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
        basicApi={basicApi}
        liveURL={liveURL}
      />

      <ContentInfo modelZUID={props.modelZUID} itemZUID={props.itemZUID} />
      <ContentLinks item={props.item} />

      {/* <Release item={props.item} /> */}

      <Fragment>
        <Card
          sx={{ mx: 2, mb: 3, backgroundColor: "transparent" }}
          elevation={0}
        >
          <CardHeader
            sx={{
              p: 0,
              backgroundColor: "transparent",
              fontSize: "16px",
              color: "#10182866",
              borderBottom: 1,
              borderColor: "grey.200",
            }}
            titleTypographyProps={{
              sx: {
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "32px",
                color: "#101828",
              },
            }}
            title="Bounce Rate"
          ></CardHeader>
          <CardContent
            sx={{
              p: 0,
              pt: 2,
              "&:last-child": {
                pb: 0,
              },
            }}
          >
            <iframe src="https://apps-beta.zesty.io/google-analytics-4/#/content/card/bounce-rate"></iframe>
          </CardContent>
        </Card>
      </Fragment>

      <Fragment>
        <Card
          sx={{ mx: 2, mb: 3, backgroundColor: "transparent" }}
          elevation={0}
        >
          <CardHeader
            sx={{
              p: 0,
              backgroundColor: "transparent",
              fontSize: "16px",
              color: "#10182866",
              borderBottom: 1,
              borderColor: "grey.200",
            }}
            titleTypographyProps={{
              sx: {
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "32px",
                color: "#101828",
              },
            }}
            title="Bounce Rate"
          ></CardHeader>
          <CardContent
            sx={{
              p: 0,
              pt: 2,
              "&:last-child": {
                pb: 0,
              },
            }}
          >
            <iframe src="https://apps-beta.zesty.io/google-analytics-4/#/content/card/bounce-rate"></iframe>
          </CardContent>
        </Card>
      </Fragment>

      <Fragment>
        <Card
          sx={{ mx: 2, mb: 3, backgroundColor: "transparent" }}
          elevation={0}
        >
          <CardHeader
            sx={{
              p: 0,
              backgroundColor: "transparent",
              fontSize: "16px",
              color: "#10182866",
              borderBottom: 1,
              borderColor: "grey.200",
            }}
            titleTypographyProps={{
              sx: {
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "32px",
                color: "#101828",
              },
            }}
            title="Bounce Rate"
          ></CardHeader>
          <CardContent
            sx={{
              p: 0,
              pt: 2,
              "&:last-child": {
                pb: 0,
              },
            }}
          >
            <iframe src="https://apps-beta.zesty.io/google-analytics-4/#/content/card/bounce-rate"></iframe>
          </CardContent>
        </Card>
      </Fragment>

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
