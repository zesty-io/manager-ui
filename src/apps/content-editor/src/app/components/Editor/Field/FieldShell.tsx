import { memo, useState } from "react";
import {
  Stack,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  Button,
  Box,
} from "@mui/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { useLocation } from "react-router";

import { useTranslation } from "react-i18next";
import { InteractiveTooltip } from "../../../../../../../shell/components/InteractiveTooltip";
import { FieldTooltipBody } from "./FieldTooltipBody";
import { ContentModelField } from "../../../../../../../shell/services/types";
import { getFieldErrorMessages } from "./getFieldErrorMessages";
import { Comment } from "../../../../../../../shell/components/Comment";

export type EditorType =
  | "markdown"
  | "wysiwyg_basic"
  | "article_writer"
  | "html";
// English source map, still consumed by schema's DefaultValueInput. FieldShell
// renders localized labels via EDITOR_TYPE_LABEL_KEYS below.
export const EditorTypes: Record<EditorType, string> = {
  markdown: "Markdown",
  wysiwyg_basic: "WYSIWYG",
  article_writer: "Inline",
  html: "HTML",
};
const EDITOR_TYPE_LABEL_KEYS: Record<EditorType, string> = {
  markdown: "content.editorTypeMarkdown",
  wysiwyg_basic: "content.editorTypeWysiwyg",
  article_writer: "content.editorTypeInline",
  html: "content.editorTypeHtml",
};
export type Error = {
  MISSING_REQUIRED?: boolean;
  EXCEEDING_MAXLENGTH?: number;
  LACKING_MINLENGTH?: number;
  CUSTOM_ERROR?: string;
  REGEX_PATTERN_MISMATCH?: string;
  REGEX_RESTRICT_PATTERN_MATCH?: string;
  INVALID_RANGE?: string;
  INVALID_BLOCK_VARIANT?: boolean;
};

type FieldShellProps = {
  settings: Partial<ContentModelField>;
  valueLength?: number;
  endLabel?: JSX.Element;
  maxLength?: number;
  minLength?: number;
  withLengthCounter?: boolean;
  missingRequired?: boolean;
  onEditorChange?: (editorType: string) => void;
  editorType?: EditorType;
  customTooltip?: string;
  children: JSX.Element;
  errors: Error;
  withInteractiveTooltip?: boolean;
  withComment?: boolean;
};
export const FieldShell = ({
  settings,
  endLabel,
  valueLength,
  maxLength = 150,
  minLength = 0,
  withLengthCounter = false,
  onEditorChange,
  editorType = "markdown",
  customTooltip,
  children,
  errors,
  withInteractiveTooltip = true,
  withComment = true,
}: FieldShellProps) => {
  const { t } = useTranslation("content");
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);

  const errorMessages = getFieldErrorMessages(errors, t);

  const isCreateNewItemPage = location?.pathname?.split("/")?.pop() === "new";

  return (
    <Stack gap={0.5}>
      <Stack direction="row" justifyContent="space-between">
        <FieldLabel
          settings={settings}
          customTooltip={customTooltip}
          withInteractiveTooltip={withInteractiveTooltip}
        />
        <Stack
          direction="row"
          gap={0.5}
          flexWrap="wrap"
          justifyContent="flex-end"
        >
          {["article_writer", "markdown"].includes(settings?.datatype) && (
            <>
              <Button
                size="xsmall"
                variant="contained"
                color="inherit"
                endIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: 20 }} />}
                sx={{
                  height: 20,
                  backgroundColor: "common.white",
                  p: 0,
                  color: "text.disabled",

                  "&:hover": {
                    backgroundColor: "common.white",
                    boxShadow: "none",
                  },

                  "&:active": {
                    boxShadow: "none",
                  },
                  "& .MuiButton-endIcon": {
                    ml: 0.5,
                  },
                }}
                onClick={(evt) => {
                  setAnchorEl(evt.currentTarget);
                }}
              >
                {t(EDITOR_TYPE_LABEL_KEYS[editorType])}
              </Button>
              <Menu
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
              >
                {Object.keys(EDITOR_TYPE_LABEL_KEYS).map((key) => (
                  <MenuItem
                    key={key}
                    onClick={() => {
                      setAnchorEl(null);
                      onEditorChange?.(key);
                    }}
                  >
                    {t(EDITOR_TYPE_LABEL_KEYS[key as EditorType])}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          {endLabel}
          {!isCreateNewItemPage && withComment && (
            <Comment resourceZUID={settings.ZUID} />
          )}
        </Stack>
      </Stack>
      {settings?.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ overflowWrap: "break-word", wordBreak: "break-word" }}
        >
          {settings?.description}
        </Typography>
      )}
      {children}
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="error.dark">
          {errorMessages.length === 0 ? (
            ""
          ) : errorMessages.length === 1 ? (
            errorMessages[0]
          ) : (
            <Box component="ul" ml={3}>
              {errorMessages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </Box>
          )}
        </Typography>
        {withLengthCounter && (
          <Typography variant="body2" color="text.disabled">
            {valueLength}
            {!!minLength &&
              t("content.minCharacterCounter", { count: minLength })}
            {!!maxLength && `/${maxLength}`}
          </Typography>
        )}
        {settings?.settings?.minValue !== undefined &&
          settings?.settings?.maxValue !== undefined && (
            <Typography variant="body2" color="text.disabled">
              {t("content.minMaxLabel", {
                min: settings?.settings?.minValue,
                max: settings?.settings?.maxValue,
              })}
            </Typography>
          )}
      </Stack>
    </Stack>
  );
};

type FieldLabelProps = {
  settings: Partial<ContentModelField>;
  customTooltip?: string;
  withInteractiveTooltip?: boolean;
};
const FieldLabel = memo(
  ({
    settings,
    customTooltip,
    withInteractiveTooltip = true,
  }: FieldLabelProps) => {
    return (
      <Stack direction="row" gap={0.5} alignItems="center">
        {withInteractiveTooltip ? (
          <InteractiveTooltip
            slots={{
              title: (
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                  sx={{
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {settings?.label} {settings?.required && "*"}
                </Typography>
              ),
              body: <FieldTooltipBody data={settings} />,
            }}
            TooltipProps={{
              placement: "top-start",
            }}
            PaperProps={{
              sx: {
                width: 400,
                mb: 1.25,
                borderRadius: 2,
              },
            }}
          />
        ) : (
          <Typography variant="body2" fontWeight={600} color="text.primary">
            {settings?.label} {settings?.required && "*"}
          </Typography>
        )}
        {(!!customTooltip || settings?.settings?.tooltip) && (
          <Tooltip
            title={customTooltip ?? settings.settings.tooltip}
            placement="right"
          >
            <InfoRoundedIcon color="action" sx={{ fontSize: 12 }} />
          </Tooltip>
        )}
      </Stack>
    );
  }
);
