import { useMemo } from "react";
import { Stack, Typography, Box, ThemeProvider } from "@mui/material";
import DangerousRoundedIcon from "@mui/icons-material/DangerousRounded";
import { theme } from "@zesty-io/material";
import { Error } from "./Field/FieldShell";
import { ContentModelField } from "../../../../../../shell/services/types";

type FieldErrorProps = {
  errors: Record<string, Error>;
  fields: ContentModelField[];
};

export const FieldError = ({ errors, fields }: FieldErrorProps) => {
  const fieldErrors = useMemo(() => {
    return Object.entries(errors)?.map(([name, errors]) => {
      let errorMessage = "";

      if (errors?.MISSING_REQUIRED) {
        errorMessage = "Required Field. Please enter a value.";
      } else if (errors?.EXCEEDING_MAXLENGTH > 0) {
        errorMessage = `Exceeding by ${errors.EXCEEDING_MAXLENGTH} characters.`;
      }

      return {
        label: fields?.find((field) => field.name === name)?.label,
        errorMessage,
      };
    });
  }, [errors, fields]);

  return (
    <ThemeProvider theme={theme}>
      <Stack
        p={2}
        gap={1}
        sx={{ backgroundColor: "red.50", color: "error.dark" }}
      >
        <DangerousRoundedIcon color="inherit" fontSize="small" />
        <Typography variant="h6">
          Item cannot be saved due to invalid field values.
        </Typography>
        <Typography variant="body2">
          Please correct the following 2 fields before saving:
        </Typography>
        <Box>
          {fieldErrors?.map((error, index) => (
            <Typography>
              {index + 1}. {error.label} - {error.errorMessage}
            </Typography>
          ))}
        </Box>
      </Stack>
    </ThemeProvider>
  );
};
