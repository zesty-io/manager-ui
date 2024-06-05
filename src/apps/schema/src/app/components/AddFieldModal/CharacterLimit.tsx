import {
  Stack,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { FieldTypeNumber } from "../../../../../../shell/components/FieldTypeNumber";
import { MaxLengths } from "../../../../../content-editor/src/app/components/Editor/Editor";

type CharacterLimitProps = {
  type: "text" | "textarea";
  isCharacterLimitEnabled: boolean;
  onToggleCharacterLimitState: (enabled: boolean) => void;
  onChange: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: number;
  }) => void;
  minValue: number;
  maxValue: number;
};

export const CharacterLimit = ({
  type,
  isCharacterLimitEnabled,
  onToggleCharacterLimitState,
  onChange,
  minValue = 0,
  maxValue = 150,
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
            onChange={(evt) => {
              onToggleCharacterLimitState(evt.target.checked);
              if (evt.target.checked) {
                onChange({ inputName: "minCharLimit", value: 0 });
                onChange({
                  inputName: "maxCharLimit",
                  value: type === "textarea" ? 16000 : 150,
                });
              } else {
                onChange({ inputName: "minCharLimit", value: null });
                onChange({ inputName: "maxCharLimit", value: null });
              }
            }}
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
                value={+minValue}
                onChange={(value) => {
                  if (value >= 0) {
                    onChange({ inputName: "minCharLimit", value });
                  }
                }}
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
                value={+maxValue}
                onChange={(value) => {
                  // console.log(value <= MaxLengths[type]);
                  // if (value >= 0 && value <= MaxLengths[type]) {
                  onChange({ inputName: "maxCharLimit", value });
                  // }
                }}
                // onChange={() => {}}
                name="maximum"
                hasError={false}
                allowNegative={false}
                limit={MaxLengths[type]}
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
