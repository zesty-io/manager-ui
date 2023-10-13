import { memo, useState } from "react";
import {
  Stack,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

import { InteractiveTooltip } from "../../../../../../../shell/components/InteractiveTooltip";
import { FieldTooltipBody } from "./FieldTooltipBody";
import { ContentModelField } from "../../../../../../../shell/services/types";

export type EditorType =
  | "markdown"
  | "wysiwyg_basic"
  | "article_writer"
  | "html";
const EditorTypes: Record<EditorType, string> = {
  markdown: "Markdown",
  wysiwyg_basic: "WYSIWYG",
  article_writer: "Inline",
  html: "HTML",
};
export type Error = {
  MISSING_REQUIRED?: boolean;
  EXCEEDING_MAXLENGTH?: number;
  CUSTOM_ERROR?: string;
};

type FieldShellProps = {
  settings: Partial<ContentModelField>;
  valueLength?: number;
  endLabel?: JSX.Element;
  maxLength?: number;
  withLengthCounter?: boolean;
  missingRequired?: boolean;
  onEditorChange?: (editorType: string) => void;
  editorType?: EditorType;
  customTooltip?: string;
  children: JSX.Element;
  errors: Error;
  withInteractiveTooltip?: boolean;
};
export const FieldShell = ({
  settings,
  endLabel,
  valueLength,
  maxLength = 150,
  withLengthCounter = false,
  onEditorChange,
  editorType = "markdown",
  customTooltip,
  children,
  errors,
  withInteractiveTooltip = true,
}: FieldShellProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);

  const getErrorMessage = (errors: Error) => {
    if (errors?.MISSING_REQUIRED) {
      return "Required Field. Please enter a value.";
    }

    if (errors?.EXCEEDING_MAXLENGTH > 0) {
      return `Exceeding by ${errors.EXCEEDING_MAXLENGTH} characters.`;
    }

    if (errors?.CUSTOM_ERROR) {
      return errors.CUSTOM_ERROR;
    }

    return "";
  };

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
                {EditorTypes[editorType]}
              </Button>
              <Menu
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
              >
                {Object.entries(EditorTypes).map(([key, value]) => (
                  <MenuItem
                    key={key}
                    onClick={() => {
                      setAnchorEl(null);
                      onEditorChange?.(key);
                    }}
                  >
                    {value}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          {endLabel}
        </Stack>
      </Stack>
      {settings?.description && (
        <Typography variant="body2" color="text.secondary">
          {settings?.description}
        </Typography>
      )}
      {children}
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="error.dark">
          {getErrorMessage(errors)}
        </Typography>
        {maxLength && withLengthCounter && (
          <Typography variant="body2" color="text.disabled">
            {valueLength}/{maxLength}
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
            placement="top"
          >
            <InfoRoundedIcon color="action" sx={{ fontSize: 12 }} />
          </Tooltip>
        )}
      </Stack>
    );
  }
);
