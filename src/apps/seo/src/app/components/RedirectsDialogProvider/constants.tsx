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

export const DEFAULT_COLUMN_PROPS = {
  resizable: false,
  disableReorder: true,
  filterable: false,
  hideable: false,
  hideSortIcons: true,
  disableColumnMenu: true,
  sortable: false,
};

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
  type?: string;
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
