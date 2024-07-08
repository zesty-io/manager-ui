import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  FormControl,
  FormHelperText,
  Stack,
} from "@mui/material";
import { Errors } from "./views/FieldForm";
import { FieldTypeNumber } from "../../../../../../shell/components/FieldTypeNumber";

type InputRangeProps = {
  onChange: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: number;
  }) => void;
  minValue: number | null;
  maxValue: number | null;
  errors: Errors;
};

export const InputRange = ({
  onChange,
  minValue,
  maxValue,
  errors,
}: InputRangeProps) => {
  return (
    <Box>
      <FormControlLabel
        sx={{
          alignItems: "flex-start",
        }}
        control={
          <Checkbox
            data-cy="InputRangeCheckbox"
            checked={minValue !== null && maxValue !== null}
            size="small"
            onChange={(evt) => {
              if (evt.target.checked) {
                onChange({ inputName: "minValue", value: 0 });
                onChange({ inputName: "maxValue", value: 100000 });
              } else {
                onChange({ inputName: "minValue", value: null });
                onChange({ inputName: "maxValue", value: null });
              }
            }}
          />
        }
        label={
          <Box>
            <Typography variant="body2" fontWeight="600">
              Limit Input Range
            </Typography>
            <Typography
              variant="body3"
              color="text.secondary"
              fontWeight="600"
              display="block"
            >
              Set a minimum and/or maximum allowed value
            </Typography>
          </Box>
        }
      />
      {minValue !== null && maxValue !== null && (
        <Stack direction="row" gap={2} ml={3.5} mt={1} alignItems="flex-start">
          <FormControl error={!!errors?.minValue}>
            <FormControlLabel
              labelPlacement="top"
              sx={{
                alignItems: "flex-start",
                m: 0,
                flex: 1,
              }}
              control={
                <FieldTypeNumber
                  data-cy="MinValueInput"
                  required={false}
                  value={+minValue}
                  onChange={(value) => {
                    onChange({ inputName: "minValue", value });
                  }}
                  name="minValue"
                  hasError={!!errors?.minValue}
                  allowNegative={true}
                />
              }
              label={
                <Typography variant="body2" fontWeight="600" pb={0.5}>
                  Minimum
                </Typography>
              }
            />
            {!!errors?.minValue && (
              <FormHelperText>{errors?.minValue}</FormHelperText>
            )}
          </FormControl>
          <FormControl error={!!errors?.maxValue}>
            <FormControlLabel
              labelPlacement="top"
              sx={{
                alignItems: "flex-start",
                m: 0,
                flex: 1,
              }}
              control={
                <FieldTypeNumber
                  data-cy="MaxValueInput"
                  required={false}
                  value={+maxValue}
                  onChange={(value) => {
                    onChange({ inputName: "maxValue", value });
                  }}
                  name="maximum"
                  hasError={!!errors?.maxValue}
                  allowNegative={true}
                />
              }
              label={
                <Typography variant="body2" fontWeight="600" pb={0.5}>
                  Maximum
                </Typography>
              }
            />
            {!!errors?.maxValue && (
              <FormHelperText>{errors?.maxValue}</FormHelperText>
            )}
          </FormControl>
        </Stack>
      )}
    </Box>
  );
};
