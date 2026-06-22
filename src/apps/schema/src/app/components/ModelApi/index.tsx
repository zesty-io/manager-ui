import { Redirect, Route, Switch } from "react-router";
import { ApiCardList } from "./ApiCardList";
import { ApiDetails } from "./ApiDetails";

export const apiTypes = [
  "quick-access",
  "site-generators",
  "custom-endpoints",
  "graphql",
  "backend-coding",
  "visual-layout",
] as const;

export const apiTypeDocsMap: Record<ApiType, string> = {
  "quick-access": "https://zesty.org/apis/instant-content-api",
  "backend-coding": "https://instances-api.zesty.org",
  graphql: "https://zesty.org/apis/graphql",
  "site-generators": "https://zesty.org/?q=Routing%20toJSON",
  "custom-endpoints":
    "https://zesty.org/tools/guides/how-to-create-a-customizable-json-endpoint-for-content",
  "visual-layout": "https://zesty.org/?q=Visual%20Layout",
};

type TranslateFn = (key: string) => string;
export const getApiTypeLabelMap = (
  t: TranslateFn
): Record<ApiType, string> => ({
  "quick-access": t("schema.apiLabelQuickAccess"),
  "backend-coding": t("schema.apiLabelBackendCoding"),
  graphql: t("schema.apiLabelGraphql"),
  "site-generators": t("schema.apiLabelSiteGenerators"),
  "custom-endpoints": t("schema.apiLabelCustomEndpoints"),
  "visual-layout": t("schema.apiLabelVisualLayout"),
});

export type ApiType = (typeof apiTypes)[number];

export const ModelApi = () => {
  return (
    <Switch>
      <Route
        exact
        path="/schema/:contentModelZUID/api/:type"
        component={ApiDetails}
      />
      <Route
        exact
        path="/schema/:contentModelZUID/api"
        component={ApiCardList}
      />
      <Redirect to="/schema/:id/fields/api" />
    </Switch>
  );
};
