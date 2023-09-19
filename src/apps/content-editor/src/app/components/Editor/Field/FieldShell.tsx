import { memo, useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  FormLabel,
  TextField,
  Tooltip,
  Stack,
} from "@mui/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

import { ContentModelField } from "../../../../../../../shell/services/types";
import { InteractiveTooltip } from "../../../../../../../shell/components/InteractiveTooltip";
import { FieldTooltipBody } from "./FieldTooltipBody";
import { AppState } from "../../../../../../../shell/store/types";

type FieldShellProps = {
  data: ContentModelField;
  endLabel?: JSX.Element;
  onChange: (value: any, name: string) => void;
};
export const FieldShell = memo(
  ({ data, endLabel, onChange }: FieldShellProps) => {
    console.log("re-render shell", data?.name);
    return (
      <FormLabel sx={{ display: "flex", justifyContent: "space-between" }}>
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
        {endLabel}
      </FormLabel>
    );
  }
);

type InputFieldProps = {
  dataType: string;
  value: any;
  name: string;
  onChange: (value: any, name: string) => void;
};
const InputField = ({ dataType, value, name, onChange }: InputFieldProps) => {
  console.log("re-render input field");
  switch (dataType) {
    case "text":
      console.log("do switch");
      return (
        <TextField
          fullWidth
          value={value}
          onChange={(evt) => onChange(evt.target.value, name)}
        />
      );

    default:
      return <></>;
  }
};
