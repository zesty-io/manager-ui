import { useMemo } from "react";
import { Stack, Typography, Button, Box } from "@mui/material";
import { Block } from "@zesty-io/material";
import { AddRounded } from "@mui/icons-material";

import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

type NoVariantProps = {
  blockModelZUID: string;
  blockModelName: string;
};
export const NoVariant = ({
  blockModelZUID,
  blockModelName,
}: NoVariantProps) => {
  const { t } = useTranslation();
  const history = useHistory();

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
          {t("shell.blockSelectorNoVariantsTitle", {
            modelName: blockModelName,
          })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("shell.blockSelectorNoVariantsDescription")}
        </Typography>
      </Box>
      <Box>
        <Button
          variant="contained"
          startIcon={<Block />}
          sx={{ mr: 1 }}
          onClick={() => history.push(`/blocks/${blockModelZUID}`)}
        >
          {t("shell.blockSelectorViewBlock")}
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddRounded />}
          onClick={() =>
            history.push(`/blocks/${blockModelZUID}?createVariant=true`)
          }
        >
          {t("shell.blockSelectorCreateVariant")}
        </Button>
      </Box>
    </Stack>
  );
};
