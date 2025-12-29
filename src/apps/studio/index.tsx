import { useMemo } from "react";
import { Alert, CircularProgress, Stack, Typography } from "@mui/material";
import { Route, Switch, useLocation } from "react-router-dom";

import { StudioWrapper } from "../content-editor/src/app/views/ItemEdit/StudioWrapper";
import { useGetContentItemByPathQuery } from "../../shell/services/instance";

const normalizePath = (path: string) => {
  if (!path) return "/";
  const decoded = decodeURIComponent(path.trim());
  if (!decoded) return "/";
  if (decoded === "/") return "/";
  return decoded.startsWith("/") ? decoded : `/${decoded}`;
};

const StudioLanding = () => {
  const { search } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const rawPathParam = searchParams.get("path") || "/";
  const normalizedPathParam = useMemo(
    () => normalizePath(rawPathParam || "/"),
    [rawPathParam]
  );

  const {
    data: contentItemByPath,
    isFetching: isFetchingPathItem,
    isError: isPathError,
  } = useGetContentItemByPathQuery(normalizedPathParam);

  const targetModelZUID = contentItemByPath?.meta?.contentModelZUID || null;
  const targetItemZUID = contentItemByPath?.meta?.ZUID || null;

  const isLoading = isFetchingPathItem;
  const hasError = isPathError;
  const notFound =
    !isFetchingPathItem &&
    !isPathError &&
    !contentItemByPath &&
    !!normalizedPathParam;

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
    <StudioWrapper
      modelZUID={targetModelZUID}
      itemZUID={targetItemZUID}
      path={normalizedPathParam}
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
