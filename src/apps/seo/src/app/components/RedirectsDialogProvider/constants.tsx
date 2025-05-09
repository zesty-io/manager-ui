import { Box, Skeleton } from "@mui/material";
import Typography from "@mui/material/Typography";
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

export const REDIRECT_TARGET_ERRORS = {
  unpublished:
    "This item isn't published yet. Any incoming paths will lead to your 404 page until it goes live.",
};

export const LOADING_DATA = [
  ...Array.from({ length: 3 }).map((_, index) => ({
    id: `loading-${index}`,
    itemZUID: "",
    label: "",
    path: "",
    publishAt: "",
    langCode: "",
    isPublished: false,
  })),
];

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

export const ListOptionSkeleton = ({ count = 4 }: { count: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box
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

export type PathProps = {
  id: number;
  path: string;
};

export type ErrorPathProps = {
  error: string;
  path: string;
};

export type ContentItemProps = {
  id: string;
  itemZUID?: string;
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
