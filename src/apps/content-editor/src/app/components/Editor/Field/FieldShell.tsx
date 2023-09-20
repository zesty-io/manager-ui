import { memo, useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Tooltip,
  FormLabel,
  TextField,
} from "@mui/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

import { InteractiveTooltip } from "../../../../../../../shell/components/InteractiveTooltip";
import { FieldTooltipBody } from "./FieldTooltipBody";
import { ContentModelField } from "../../../../../../../shell/services/types";

type FieldShellProps = {
  data: ContentModelField;
  value: any;
  endLabel?: JSX.Element;
  maxLength?: number;
  withLengthCounter?: boolean;
  missingRequired?: boolean;
  children: JSX.Element;
};
export const FieldShell = ({
  data,
  endLabel,
  value,
  maxLength = 150,
  withLengthCounter = false,
  missingRequired,
  children,
}: FieldShellProps) => {
  console.log("re-rendered text field");
  const [error, setError] = useState("");

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
      <FormLabel sx={{ display: "flex", justifyContent: "space-between" }}>
        <FieldLabel data={data} />
        {endLabel}
      </FormLabel>
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
};
const FieldLabel = memo(({ data }: FieldLabelProps) => {
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
      {data?.settings?.tooltip && (
        <Tooltip title={data.settings.tooltip} placement="top">
          <InfoRoundedIcon color="action" sx={{ fontSize: 12 }} />
        </Tooltip>
      )}
    </Stack>
  );
});
