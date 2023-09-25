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
import { EditorActions } from "../../../../../../code-editor/src/app/components/FileActions/components/EditorActions";

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
export const FieldShell = ({
  data,
  endLabel,
  value,
  maxLength = 150,
  withLengthCounter = false,
  onEditorChange,
  editorType = "markdown",
  missingRequired,
  customTooltip,
  children,
}: FieldShellProps) => {
  console.log("re-rendered text field");
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);

  useEffect(() => {
    if (value?.length > maxLength) {
      if (withLengthCounter) {
        const exceedAmount = value?.length - maxLength;

        setError(`Exceeding by ${exceedAmount} characters.`);
      }
    } else if (!value?.length && missingRequired) {
      setError("Required Field. Please enter a value.");
    } else {
      setError("");
    }
  }, [value, missingRequired]);

  return (
    <Stack gap={0.5}>
      <Stack direction="row" justifyContent="space-between">
        <FieldLabel data={data} customTooltip={customTooltip} />
        <Stack direction="row" gap={0.5}>
          {["article_writer", "markdown"].includes(data?.datatype) && (
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
                      onEditorChange(key);
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
      {data?.description && (
        <Typography variant="body2" color="text.secondary">
          {data?.description}
        </Typography>
      )}
      {children}
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="error">
          {error}
        </Typography>
        {maxLength && withLengthCounter && (
          <Typography variant="body2" color="text.disabled">
            {value?.length}/{maxLength}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

type FieldLabelProps = {
  data: ContentModelField;
  customTooltip?: string;
};
const FieldLabel = memo(({ data, customTooltip }: FieldLabelProps) => {
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
              {data?.label} {data?.required && "*"}
            </Typography>
          ),
          body: <FieldTooltipBody data={data} />,
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
      {(!!customTooltip || data?.settings?.tooltip) && (
        <Tooltip title={customTooltip ?? data.settings.tooltip} placement="top">
          <InfoRoundedIcon color="action" sx={{ fontSize: 12 }} />
        </Tooltip>
      )}
    </Stack>
  );
});
