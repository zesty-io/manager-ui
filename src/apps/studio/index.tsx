import { useEffect, useMemo, useState } from "react";
import { Alert, CircularProgress, Stack, Typography } from "@mui/material";
import { Route, Switch, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { StudioWrapper } from "../content-editor/src/app/views/ItemEdit/StudioWrapper";
import { AppState } from "../../shell/store/types";
import { normalizePath, resolveItemByPath } from "./utils/pathResolver";

const StudioLanding = () => {
  const { search } = useLocation();
  const dispatch = useDispatch();
  const contentItems = useSelector((state: AppState) => state.content);
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const rawPathParam = searchParams.get("path") || "/";
  const normalizedPathParam = useMemo(
    () => normalizePath(rawPathParam || "/"),
    [rawPathParam]
  );

  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [resolvedItem, setResolvedItem] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    setHasError(false);
    setIsSearching(true);

    resolveItemByPath({
      path: normalizedPathParam,
      contentItems,
      dispatch,
    })
      .then((item) => {
        if (!isMounted) return;
        setResolvedItem(item || null);
      })
      .catch(() => {
        if (!isMounted) return;
        setHasError(true);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsSearching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [contentItems, dispatch, normalizedPathParam]);

  const targetModelZUID = resolvedItem?.meta?.contentModelZUID || null;
  const targetItemZUID = resolvedItem?.meta?.ZUID || null;

  const isLoading = isSearching;
  const notFound = !isSearching && !resolvedItem && !!normalizedPathParam;

  if (isLoading) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        height="100%"
        spacing={1.5}
      >
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary">
          Loading Studio…
        </Typography>
      </Stack>
    );
  }

  if (hasError) {
    return (
      <Alert severity="error">
        Unable to load Studio. Please refresh to try again.
      </Alert>
    );
  }

  if (notFound) {
    return (
      <Alert severity="warning">
        No item found for path &quot;{normalizedPathParam}&quot;. Double-check
        the path and try again.
      </Alert>
    );
  }

  if (!targetModelZUID || !targetItemZUID) {
    return (
      <Alert severity="warning">
        No item found. Add a page with path "/" to open Studio.
      </Alert>
    );
  }

  return (
    <StudioWrapper modelZUID={targetModelZUID} itemZUID={targetItemZUID} />
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
