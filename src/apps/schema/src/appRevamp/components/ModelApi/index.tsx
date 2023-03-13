import { Redirect, Route, Switch } from "react-router";
import { ApiCardList } from "./ApiCardList";
import { ApiDetails } from "./ApiDetails";

export const apiTypes = [
  "quick-access",
  "backend-coding",
  "graphql",
  "site-generators",
  "custom-endpoints",
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

export const apiTypeLabelMap: Partial<Record<ApiType, string>> = {
  "quick-access": "Quick Access",
  "backend-coding": "Back-End Coding",
  graphql: "GraphQL",
  "site-generators": "Site Generators",
  "custom-endpoints": "Custom Endpoints",
  "visual-layout": "Visual Layout",
};

export type ApiType = typeof apiTypes[number];

export const ModelApi = () => {
  return (
    <Switch>
      <Route exact path="/schema/:id/api/:type" component={ApiDetails} />
      <Route exact path="/schema/:id/api" component={ApiCardList} />
      <Redirect to="/schema/:id/fields/api" />
    </Switch>
  );
};
