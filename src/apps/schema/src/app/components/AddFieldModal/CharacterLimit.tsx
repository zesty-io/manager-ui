import {
  Stack,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { FieldTypeNumber } from "../../../../../../shell/components/FieldTypeNumber";

type CharacterLimitProps = {
  isCharacterLimitEnabled: boolean;
  onToggleCharacterLimitState: () => void;
};

export const CharacterLimit = ({
  isCharacterLimitEnabled,
  onToggleCharacterLimitState,
}: CharacterLimitProps) => {
  return (
    <Box>
      <FormControlLabel
        sx={{
          alignItems: "flex-start",
        }}
        control={
          <Checkbox
            data-cy="DefaultValueCheckbox"
            checked={isCharacterLimitEnabled}
            size="small"
            onChange={onToggleCharacterLimitState}
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
      {isCharacterLimitEnabled && (
        <Stack direction="row" gap={2} ml={3.5}>
          <FormControlLabel
            labelPlacement="top"
            sx={{
              alignItems: "flex-start",
              m: 0,
              flex: 1,
            }}
            control={
              <FieldTypeNumber
                required={false}
                value={0}
                onChange={() => {}}
                name="minimum"
                hasError={false}
                allowNegative={false}
              />
            }
            label={
              <Typography variant="body2" fontWeight="600" pb={0.5}>
                Minimum character count (with spaces)
              </Typography>
            }
          />
          <FormControlLabel
            labelPlacement="top"
            sx={{
              alignItems: "flex-start",
              m: 0,
              flex: 1,
            }}
            control={
              <FieldTypeNumber
                required={false}
                value={150}
                onChange={() => {}}
                name="maximum"
                hasError={false}
                allowNegative={false}
              />
            }
            label={
              <Typography variant="body2" fontWeight="600" pb={0.5}>
                Maximum character count (with spaces)
              </Typography>
            }
          />
        </Stack>
      )}
    </Box>
  );
};
