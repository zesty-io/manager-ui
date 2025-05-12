import { Box, Skeleton, Typography } from "@mui/material";

import {
  RedirectsCodes,
  RedirectsTargetType,
} from "../../../../../../shell/services/types";

export const HTTP_CODE_OPTIONS = [
  { value: 301, label: "301 - Permanent Redirect" },
  { value: 302, label: "302 - Temporary Redirect" },
] as const;
export const TARGET_OPTIONS = [
  {
    value: "page",
    label: "Internal - link to a published item within your instance",
  },
  { value: "external", label: "External - link to an external webpage" },
  {
    value: "path",
    label: "Wildcard - can handle multiple redirects with a single rule",
  },
] as const;

export const TOOL_TIPS = {
  code: (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      rowGap={1}
    >
      <Typography variant="caption">
        <span style={{ fontWeight: 600 }}>[301]</span> - Permanent Redirect: Use
        this when content has moved permanently to a new location. Search
        engines will update their index.
      </Typography>
      <Typography variant="caption">
        <span style={{ fontWeight: 600 }}>[302]</span> - Temporary Redirect: Use
        this when content is temporarily located elsewhere, and you intend to
        move it back. Search engines typically don't update their index for the
        new location.
      </Typography>
    </Box>
  ),
  targetType: (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      rowGap={0.25}
    >
      <Typography variant="caption" noWrap>
        Internal E.g. /about
      </Typography>
      <Typography variant="caption" noWrap>
        External E.g. https://zesty.org/
      </Typography>
      <Typography variant="caption" noWrap>
        Wildcard E.g. /blog/*/*/
      </Typography>
    </Box>
  ),
};

export const FORM_LABELS = {
  create: {
    header: "Create Redirect",
    subHeader:
      "Your new redirects will go live immediately after they're created.",
    incomingPath:
      "Incoming paths are case-insensitive and trailing slashes are automatically handled",
  },
  edit: {
    header: "Edit Redirect",
    subHeader: "Changes you make will be immediately go live on saving",
    incomingPath:
      "Trailing slashes and casing variations in paths are automatically handled in WebEngine.",
  },
};

export const TARGET_ERRORS = {
  unpublished:
    "This item isn't published yet. Any incoming paths will lead to your 404 page until it goes live.",
  invalidUrl: "Invalid URL. Please enter a valid URL.",
};

export const validateUrl = (url: string) => {
  const validProtocols = ["http://", "https://"];

  const hasValidProtocol = validProtocols.some((protocol) =>
    url.startsWith(protocol)
  );
  if (!hasValidProtocol) return false;
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

export type PathProps = {
  id: number;
  path: string;
};

export type ErrorPathProps = {
  error: string;
  path: string;
};

export type ContentItemProps = {
  ZUID: string;
  label?: string;
  path: string;
  publishAt?: string;
  langCode?: string;
  isPublished?: boolean;
  isLoading?: boolean;
  isListItem?: boolean;
  onDelete?: () => void;
};

export type CreateRedirectErrors = {
  errors: { error: string; path: string }[];
  code: RedirectsCodes;
  target: string;
  targetType: RedirectsTargetType;
  ZUID?: string;
};

export type CreateRedirectDefaultValues = {
  data?: {
    paths: string[];
    code: RedirectsCodes;
    target: ContentItemProps;
    targetType: RedirectsTargetType;
  };
  isEdit?: boolean;
};

export const parseRedirectError = (error: string): string => {
  if (error?.toLowerCase()?.includes("already exists")) return "Already exists";
  if (error?.toLowerCase()?.includes("validation error: redirect item"))
    return "Not Published";
  return "Error";
};

export const ListOptionSkeleton = ({ count = 4 }: { count: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          data-cy="RedirectsTargetListLoadingSkeleton"
          key={index}
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          columnGap="12px"
          py="8px"
        >
          <Skeleton
            variant="circular"
            sx={{
              width: "24px",
              height: "24px",
              flexShrink: 0,
            }}
          />

          <Box
            display="flex"
            flexDirection="column"
            justifyContent="cennter"
            alignItems="flex-start"
            width="100%"
            flexGrow={1}
            rowGap="10px"
          >
            <Skeleton width="45%" height="12px" variant="rounded" />
            <Skeleton width="90%" height="12px" variant="rounded" />
          </Box>
        </Box>
      ))}
    </>
  );
};

export const CreateRedirectFormSkeleton = () => {
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      rowGap="20px"
      py={2.25}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        sx={{
          rowGap: 1,
          width: "100%",
        }}
      >
        <Skeleton variant="rounded" width="100px" height="12px" />
        <Skeleton variant="rounded" width="90%" height="12px" />
        <Box
          sx={{
            display: "flex",
            flexDiretion: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            columnGap: 2,
          }}
        >
          <Skeleton
            variant="rounded"
            width="100px"
            height="36px"
            sx={{ flexGrow: 1 }}
          />
          <Skeleton variant="circular" width="25px" height="25px" />
        </Box>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        sx={{
          rowGap: 0.5,
          width: "100%",
        }}
      >
        <Skeleton variant="rounded" width="125px" height="36px" />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        sx={{
          rowGap: 1,
          width: "100%",
        }}
      >
        <Skeleton
          variant="rounded"
          width="91px"
          height="12px"
          sx={{ flexGrow: 1 }}
        />
        <Skeleton variant="rounded" width="100%" height="36px" />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        sx={{
          rowGap: 1,
          width: "100%",
        }}
      >
        <Skeleton
          variant="rounded"
          width="48px"
          height="12px"
          sx={{ flexGrow: 1 }}
        />
        <Skeleton variant="rounded" width="100%" height="36px" />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        sx={{
          rowGap: 1,
          width: "100%",
        }}
      >
        <Skeleton
          variant="rounded"
          width="115px"
          height="12px"
          sx={{ flexGrow: 1 }}
        />
        <Skeleton variant="rounded" width="100%" height="36px" />
      </Box>
    </Box>
  );
};
