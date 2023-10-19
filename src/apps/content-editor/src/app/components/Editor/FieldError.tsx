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
    const errorMap = Object.entries(errors)?.map(([name, errors]) => {
      let errorMessage = "";

      if (errors?.MISSING_REQUIRED) {
        errorMessage = "Required Field. Please enter a value.";
      } else if (errors?.EXCEEDING_MAXLENGTH > 0) {
        errorMessage = `Exceeding by ${errors.EXCEEDING_MAXLENGTH} characters.`;
      } else {
        errorMessage = "";
      }

      const fieldData = fields?.find((field) => field.name === name);

      return {
        label: fieldData?.label,
        errorMessage,
        sort: fieldData?.sort,
      };
    });

    return errorMap.sort((a, b) => a.sort - b.sort);
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
          Please correct the following {fieldsWithErrors?.length} field
          {fieldsWithErrors?.length > 1 && "s"} before saving:
        </Typography>
        <Box component="ol" ml={2}>
          {fieldErrors?.map((error) => {
            if (error.errorMessage) {
              return (
                <Typography variant="body2" component="li">
                  <Box
                    sx={{
                      // textDecoration: "underline",
                      borderBottom: 1,
                      borderColor: "error.dark",
                      cursor: "pointer",
                      height: 16,
                      display: "inline-block",
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
