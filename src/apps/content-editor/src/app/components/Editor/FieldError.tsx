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
      } else {
        errorMessage = "";
      }

      return {
        label: fields?.find((field) => field.name === name)?.label,
        errorMessage,
      };
    });
  }, [errors, fields]);

  const hasErrors = fieldErrors?.some((error) => error.errorMessage);
  const fieldsWithErrors = fieldErrors?.filter((error) => error.errorMessage);

  const handleErrorClick = () => {
    const firstError = fieldsWithErrors?.[0];
    const field = fields?.find((field) => field.label === firstError?.label);
    const fieldElement = document.getElementById(field?.ZUID);
    fieldElement?.scrollIntoView({ behavior: "smooth" });
  };

  if (!hasErrors) {
    return <></>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Stack
        p={2}
        gap={1}
        borderRadius={1}
        sx={{ backgroundColor: "red.50", color: "error.dark" }}
      >
        <DangerousRoundedIcon color="inherit" fontSize="small" />
        <Typography variant="h6">
          Item cannot be saved due to invalid field values.
        </Typography>
        <Typography variant="body2">
          Please correct the following {fieldsWithErrors?.length} fields before
          saving:
        </Typography>
        <Box component="ol" ml={2}>
          {fieldErrors?.map((error) => {
            if (error.errorMessage) {
              return (
                <Typography component="li">
                  <Box
                    sx={{
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                    component="span"
                    onClick={handleErrorClick}
                  >
                    {error.label}
                  </Box>{" "}
                  - <i>{error.errorMessage}</i>
                </Typography>
              );
            }
          })}
        </Box>
      </Stack>
    </ThemeProvider>
  );
};
