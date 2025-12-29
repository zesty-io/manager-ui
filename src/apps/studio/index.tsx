import { useMemo } from "react";
import { Alert } from "@mui/material";
import { Route, Switch, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { StudioWrapper } from "../content-editor/src/app/views/ItemEdit/StudioWrapper";
import { AppState } from "../../shell/store/types";
import { normalizePath, findItemByPath } from "./utils/pathResolver";

const StudioLanding = () => {
  const { search } = useLocation();
  const contentItems = useSelector((state: AppState) => state.content);
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const rawPathParam = searchParams.get("path") || "/";
  const normalizedPathParam = useMemo(
    () => normalizePath(rawPathParam || "/"),
    [rawPathParam]
  );

  const resolvedFromCache = findItemByPath(normalizedPathParam, contentItems);
  const allItems = Object.values(contentItems || {}) as any[];
  const fallbackItem = resolvedFromCache || allItems?.[0] || null;

  const targetModelZUID = fallbackItem?.meta?.contentModelZUID || null;
  const targetItemZUID = fallbackItem?.meta?.ZUID || null;

  return (
    <StudioWrapper
      modelZUID={targetModelZUID}
      itemZUID={targetItemZUID}
      initialPreviewPath={normalizedPathParam}
      initialUnresolved={!resolvedFromCache}
    />
  );
};

export const StudioApp = () => {
  return (
    <Switch>
      <Route path="/studio" component={StudioLanding} />
    </Switch>
  );
};

export default StudioApp;
