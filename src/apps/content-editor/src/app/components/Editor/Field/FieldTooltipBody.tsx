import { Stack, Box, Typography, TextField, Button } from "@mui/material";
import { Database } from "@zesty-io/material";

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
    </>
  );
};
