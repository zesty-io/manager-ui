import {
  Stack,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Tooltip,
  Link,
} from "@mui/material";
import { Database } from "@zesty-io/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { Link as RouterLink } from "react-router-dom";
import moment from "moment-timezone";

import { ContentModelField } from "../../../../../../../shell/services/types";
import { FieldIcon } from "../../../../../../schema/src/app/components/Field/FieldIcon";

type FieldTooltipBodyProps = {
  data: ContentModelField;
};
export const FieldTooltipBody = ({ data }: FieldTooltipBodyProps) => {
  return (
    <>
      <Stack
        p={1.25}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          backgroundColor: "grey.50",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <FieldIcon type={data?.datatype} />
          <Stack>
            <Typography variant="body2" fontWeight={600}>
              {data?.label} {data?.required && "*"}
            </Typography>
            <Typography variant="body3" fontWeight={600} color="text.secondary">
              {data?.datatype}
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          color="inherit"
          size="small"
          startIcon={<Database color="action" />}
        >
          Edit Field
        </Button>
      </Stack>
      <Stack gap={2.5} p={1.5}>
        <CopyField value={data?.name} title="API / Parsley Code ID" />
        <CopyField value={data?.ZUID} title="Field ZUID" />
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body3" fontWeight={600} color="text.secondary">
            Field added on {moment(data?.createdAt)?.format("MMM D, YYYY")}
          </Typography>
          <Link
            component={RouterLink}
            to="#"
            color="text.secondary"
            underline="always"
            variant="body3"
            fontWeight={600}
            sx={{
              textDecorationColor: "#475467",

              "&:hover": {
                textDecorationColor: "#475467",
              },
            }}
          >
            View Model Activity Log
          </Link>
        </Stack>
      </Stack>
    </>
  );
};

type CopyFieldProps = {
  value: string;
  title: string;
  tooltip?: string;
};
const CopyField = ({ value, title, tooltip }: CopyFieldProps) => {
  return (
    <Stack gap={0.5}>
      <Stack direction="row" gap={1} alignItems="center">
        <Typography variant="body2">{title}</Typography>
        <Tooltip title={tooltip} placement="top">
          <InfoRoundedIcon color="action" sx={{ fontSize: 12 }} />
        </Tooltip>
      </Stack>
      <TextField
        disabled
        value={value}
        inputProps={{
          sx: {
            ":read-only": {
              textFillColor: "#101828",
            },
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small">
                <ContentCopyRoundedIcon color="action" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  );
};
