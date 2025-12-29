import { useEffect, useMemo, useState } from "react";
import { Alert, CircularProgress, Stack, Typography } from "@mui/material";
import { Route, Switch, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { StudioWrapper } from "../content-editor/src/app/views/ItemEdit/StudioWrapper";
import { searchItems } from "../../shell/store/content";
import { AppState } from "../../shell/store/types";

const normalizePath = (path: string) => {
  if (!path) return "/";
  const decoded = decodeURIComponent(path.trim());
  if (!decoded) return "/";
  if (decoded === "/") return "/";
  return decoded.startsWith("/") ? decoded : `/${decoded}`;
};

const getItemPath = (item: any) => {
  const path = item?.web?.path;
  const pathPart = item?.web?.pathPart;
  if (path) return path;
  if (pathPart === "zesty_home") return "/";
  if (pathPart) return pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  return null;
};

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
  const [hasSearched, setHasSearched] = useState(false);
  const [hasError, setHasError] = useState(false);

  const contentItemByPath = useMemo(() => {
    const items = Object.values(contentItems || {});
    return (
      items.find((item: any) => getItemPath(item) === normalizedPathParam) ||
      null
    );
  }, [contentItems, normalizedPathParam]);

  useEffect(() => {
    setHasSearched(false);
    setHasError(false);
    setIsSearching(false);
  }, [normalizedPathParam]);

  useEffect(() => {
    if (contentItemByPath || hasSearched) return;
    setIsSearching(true);
    setHasSearched(true);

    Promise.resolve(dispatch(searchItems(normalizedPathParam)))
      .catch(() => setHasError(true))
      .finally(() => setIsSearching(false));
  }, [contentItemByPath, dispatch, normalizedPathParam, hasSearched]);

  const targetModelZUID = contentItemByPath?.meta?.contentModelZUID || null;
  const targetItemZUID = contentItemByPath?.meta?.ZUID || null;

  const isLoading = isSearching;
  const notFound =
    hasSearched && !isSearching && !contentItemByPath && !!normalizedPathParam;

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
