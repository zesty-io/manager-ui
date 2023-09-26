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

const EditorTypes: Record<string, string> = {
  markdown: "Markdown",
  wysiwyg_basic: "WYSIWYG",
  article_writer: "Inline",
  html: "HTML",
};

type FieldShellProps = {
  data: ContentModelField;
  value: any;
  endLabel?: JSX.Element;
  maxLength?: number;
  withLengthCounter?: boolean;
  missingRequired?: boolean;
  onEditorChange?: (editorType: string) => void;
  editorType?: string;
  customTooltip?: string;
  children: JSX.Element;
};

export const FieldShell = (props: any) => {
  console.log("re-rendered text field");
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);

  // Set default values
  const withLengthCounter = props.withLengthCounter ?? false;
  const maxLength = props.maxLength ?? 150;

  useEffect(() => {
    if (props.valueLength > maxLength) {
      if (withLengthCounter) {
        const amountExceeded = props.valueLength - maxLength;

        setError(`Exceeding by ${amountExceeded} characters.`);
      }
    } else if (!props.valueLength && props.missingRequired) {
      setError("Required Field. Please enter a value.");
    } else {
      setError("");
    }
  }, [props.valueLength, props.missingRequired]);

  return (
    <Stack gap={0.5}>
      <Stack direction="row" justifyContent="space-between">
        <FieldLabel
          settings={props.settings}
          customTooltip={props.customTooltip}
        />
        <Stack direction="row" gap={0.5}>
          {["article_writer", "markdown"].includes(props.data?.datatype) && (
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
                {EditorTypes[props.editorType ?? "markdown"]}
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
                      props.onEditorChange?.(key);
                    }}
                  >
                    {value}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          {props.endLabel}
        </Stack>
      </Stack>
      {props.settings?.description && (
        <Typography variant="body2" color="text.secondary">
          {props.settings?.description}
        </Typography>
      )}
      {props.children}
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="error">
          {error}
        </Typography>
        {maxLength && withLengthCounter && (
          <Typography variant="body2" color="text.disabled">
            {props.valueLength}/{maxLength}
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
