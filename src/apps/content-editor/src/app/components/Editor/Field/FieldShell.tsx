import { memo, useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Tooltip,
  FormLabel,
  TextField,
  Menu,
  MenuItem,
  ButtonGroup,
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
export type Error = "MISSING_REQUIRED" | "EXCEEDING_MAXLENGTH";
// const Errors: Record<string, string> = {
//   MISSING_REQUIRED: "",
//   EXCEEDING_MAXLENGTH: "",
// }

type FieldShellProps = {
  settings: ContentModelField;
  valueLength?: number;
  endLabel?: JSX.Element;
  maxLength?: number;
  withLengthCounter?: boolean;
  missingRequired?: boolean;
  onEditorChange?: (editorType: string) => void;
  editorType?: EditorType;
  customTooltip?: string;
  children: JSX.Element;
  errors: Error[];
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
}: FieldShellProps) => {
  // console.log("re-rendered text field");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);

  const getErrorMessage = (errors: Error[]) => {
    if (errors?.length) {
      const errorCode = errors[errors.length - 1];

      if (errorCode === "MISSING_REQUIRED") {
        return "Required Field. Please enter a value.";
      }

      if (errorCode === "EXCEEDING_MAXLENGTH") {
        return "xxx";
      }
    }

    return "";
  };

  return (
    <Stack gap={0.5}>
      <Stack direction="row" justifyContent="space-between">
        <FieldLabel settings={settings} customTooltip={customTooltip} />
        <Stack direction="row" gap={0.5}>
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
        <Typography variant="body2" color="error">
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
  settings: ContentModelField;
  customTooltip?: string;
};
const FieldLabel = memo(({ settings, customTooltip }: FieldLabelProps) => {
  console.log("re-rendered field label");
  return (
    <Stack direction="row" gap={0.5} alignItems="center">
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
});
