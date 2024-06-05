import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";

type CharacterLimitProps = {
  isCharacterLimitEnabled: boolean;
  defaultMinLimit: number;
  defaultMaxLimit: number;
};

export const CharacterLimit = ({
  isCharacterLimitEnabled,
  defaultMaxLimit,
  defaultMinLimit,
}: CharacterLimitProps) => {
  return (
    <>
      <FormControlLabel
        sx={{
          alignItems: "flex-start",
        }}
        control={
          <Checkbox
            data-cy="DefaultValueCheckbox"
            checked={isCharacterLimitEnabled}
            size="small"
            // onChange={(event) => {
            //   setIsDefaultValueEnabled(event.target.checked);
            //   if (!event.target.checked) {
            //     onChange(null);
            //     setIsDefaultValueEnabled(false);
            //   }
            // }}
          />
        }
        label={
          <Box>
            <Typography variant="body2" fontWeight="600">
              Limit Character Count
            </Typography>
            <Typography
              variant="body3"
              color="text.secondary"
              fontWeight="600"
              sx={{ mb: 1, display: "block" }}
            >
              Set a minimum and/or maximum allowed number of characters
            </Typography>
          </Box>
        }
      />
    </>
  );
};
