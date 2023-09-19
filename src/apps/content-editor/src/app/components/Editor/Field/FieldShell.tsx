import { memo } from "react";
import { Stack, Typography, Tooltip, FormLabel } from "@mui/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

import { InteractiveTooltip } from "../../../../../../../shell/components/InteractiveTooltip";
import { FieldTooltipBody } from "./FieldTooltipBody";
import { ContentModelField } from "../../../../../../../shell/services/types";

type FieldShellProps = {
  data: ContentModelField;
  endLabel?: JSX.Element;
  children: JSX.Element;
};
export const FieldShell = ({ data, endLabel, children }: FieldShellProps) => {
  console.log("re-rendered text field");
  return (
    <Stack gap={0.5}>
      <FormLabel sx={{ display: "flex", justifyContent: "space-between" }}>
        <FieldLabel data={data} />
        {endLabel}
      </FormLabel>
      {children}
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
