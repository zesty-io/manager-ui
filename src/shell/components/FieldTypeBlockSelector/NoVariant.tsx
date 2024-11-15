import { useMemo } from "react";
import { Stack, Typography, Button, Box } from "@mui/material";
import { Block } from "@zesty-io/material";
import { AddRounded } from "@mui/icons-material";

import { useParams, useHistory } from "react-router-dom";
import { useGetContentModelsQuery } from "../../services/instance";

type NoVariantProps = {
  blockModelZUID: string;
  blockModelName: string;
};
export const NoVariant = ({
  blockModelZUID,
  blockModelName,
}: NoVariantProps) => {
  const history = useHistory();
  const { modelZUID } = useParams<{ modelZUID: string }>();
  const { data: models } = useGetContentModelsQuery();

  const modelData = useMemo(() => {
    return models?.find((model) => model.ZUID === modelZUID);
  }, [modelZUID, models]);

  return (
    <Stack
      height={400}
      gap={3}
      mx={3}
      justifyContent="center"
      alignItems="center"
      textAlign="center"
    >
      <Box>
        <Typography variant="h4" fontWeight="600" mb={1}>
          No variants have been created for the {blockModelName} Model
        </Typography>
        <Typography variant="body2" color="text.secondary">
          To create a variant, please go to the Blocks App and select this model
          and click on the create variant button
        </Typography>
      </Box>
      <Box>
        <Button
          variant="contained"
          startIcon={<Block />}
          sx={{ mr: 1 }}
          onClick={() => history.push(`/schema/${blockModelZUID}`)}
        >
          View Block
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddRounded />}
          onClick={() => history.push(`/blocks/${blockModelZUID}/new`)}
        >
          Create Variant
        </Button>
      </Box>
    </Stack>
  );
};
