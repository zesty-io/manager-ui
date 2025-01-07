import { Box, Button, Stack, Typography } from "@mui/material";
import { LinkRounded } from "@mui/icons-material";

import { Item } from "./Item";
import { useGetContentModelQuery } from "../../services/instance";

type RelationalFieldBaseProps = {
  value: string;
  multiselect?: boolean;
  relatedModelZUID: string;
};
export const RelationalFieldBase = ({
  value,
  multiselect,
  relatedModelZUID,
}: RelationalFieldBaseProps) => {
  const { data: modelData } = useGetContentModelQuery(relatedModelZUID, {
    skip: !relatedModelZUID,
  });

  return (
    <Box component="section">
      <Stack gap={1}>
        {value?.split(",")?.map((val) => (
          <Item key={val} itemZUID={val} draggable={multiselect} />
        ))}
      </Stack>
      {(multiselect || (!multiselect && !value?.split(",")?.length)) && (
        <Button
          variant="outlined"
          size="large"
          startIcon={<LinkRounded />}
          fullWidth
          sx={{
            mt: 1,
          }}
        >
          Add Existing {modelData?.label}
        </Button>
      )}
    </Box>
  );
};
