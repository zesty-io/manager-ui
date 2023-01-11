import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

type FieldType = "textfield" | "checkbox" | "dropdown";
export interface InputField {
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  subLabel?: string;
  helperText?: string;
  fullWidth?: boolean;
  multiline?: boolean;
}
interface Props {
  fieldConfig: InputField;
}
export const FieldFormInput = ({ fieldConfig }: Props) => {
  // TODO: Figure out a way to get the data
  // TODO: Figure out a way to show/hide the error when required fields are empty

  return (
    <Box mb={2.5}>
      {fieldConfig.type === "textfield" && (
        <>
          <Box mb={0.5}>
            <Typography variant="body2">{fieldConfig.label}</Typography>
            {fieldConfig.subLabel && (
              <Typography
                // @ts-expect-error body3 module augmentation required
                variant="body3"
                color="text.secondary"
              >
                {fieldConfig.subLabel}
              </Typography>
            )}
          </Box>
          <TextField
            variant="outlined"
            name={fieldConfig.name}
            helperText={fieldConfig.helperText}
            required={fieldConfig.required}
            fullWidth={fieldConfig.fullWidth}
            multiline={fieldConfig.multiline}
            minRows={fieldConfig.multiline && 2}
          />
        </>
      )}

      {fieldConfig.type === "checkbox" && (
        <FormControlLabel
          control={
            <Checkbox name={fieldConfig.name} required={fieldConfig.required} />
          }
          label={
            <>
              <Typography variant="body2">{fieldConfig.label}</Typography>
              {fieldConfig.subLabel && (
                <Typography
                  // @ts-expect-error body3 module augmentation required
                  variant="body3"
                  color="text.secondary"
                >
                  {fieldConfig.subLabel}
                </Typography>
              )}
            </>
          }
        />
      )}
    </Box>
  );
};
