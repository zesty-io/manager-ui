import { Box, Skeleton, Typography } from "@mui/material";
import { TFunction } from "i18next";

import {
  RedirectsCodes,
  RedirectsTargetType,
} from "../../../../../../shell/services/types";

export const HTTP_CODE_OPTIONS = [
  { value: 301, label: "seo.httpCode301Label" },
  { value: 302, label: "seo.httpCode302Label" },
] as const;
export const TARGET_OPTIONS = [
  {
    value: "page",
    label: "seo.targetOptionInternalLabel",
  },
  { value: "external", label: "seo.targetOptionExternalLabel" },
  {
    value: "path",
    label: "seo.targetOptionWildcardLabel",
  },
] as const;

export const getToolTips = (t: TFunction) => ({
  code: (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      rowGap={1}
    >
      <Typography variant="caption">{t("seo.tooltipCode301")}</Typography>
      <Typography variant="caption">{t("seo.tooltipCode302")}</Typography>
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
        {t("seo.tooltipTargetTypeInternal")}
      </Typography>
      <Typography variant="caption" noWrap>
        {t("seo.tooltipTargetTypeExternal")}
      </Typography>
      <Typography variant="caption" noWrap>
        {t("seo.tooltipTargetTypeWildcard")}
      </Typography>
    </Box>
  ),
});

export const FORM_LABELS = {
  create: {
    header: "seo.createRedirectHeader",
    subHeader: "seo.createRedirectSubHeader",
    incomingPath: "seo.createRedirectIncomingPath",
  },
  edit: {
    header: "seo.editRedirectHeader",
    subHeader: "seo.editRedirectSubHeader",
    incomingPath: "seo.editRedirectIncomingPath",
  },
};

export const TARGET_ERRORS = {
  unpublished: "seo.targetErrorUnpublished",
  invalidUrl: "seo.targetErrorInvalidUrl",
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
