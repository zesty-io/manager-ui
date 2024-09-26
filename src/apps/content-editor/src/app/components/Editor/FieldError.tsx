import {
  useMemo,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Stack, Typography, Box, ThemeProvider } from "@mui/material";
import DangerousRoundedIcon from "@mui/icons-material/DangerousRounded";
import { theme } from "@zesty-io/material";
import { Error } from "./Field/FieldShell";
import { ContentModelField } from "../../../../../../shell/services/types";
import pluralizeWord from "../../../../../../utility/pluralizeWord";

const SEO_FIELD_LABELS = {
  metaDescription: "Meta Description",
  metaTitle: "Meta Title",
  metaKeywords: "Meta Keywords",
  metaLinkText: "Navigation Title",
  parentZUID: "Page Parent",
  pathPart: "URL Path Part",
};

type FieldErrorProps = {
  errors: Record<string, Error>;
  fields: ContentModelField[];
};

const getErrorMessage = (errors: Error) => {
  const errorMessages = [];

  if (errors?.MISSING_REQUIRED) {
    errorMessages.push("Required Field. Please enter a value.");
  }

  if (errors?.EXCEEDING_MAXLENGTH > 0) {
    errorMessages.push(
      `Exceeding by ${errors.EXCEEDING_MAXLENGTH} ${pluralizeWord(
        "character",
        errors.EXCEEDING_MAXLENGTH
      )}.`
    );
  }

  if (errors?.LACKING_MINLENGTH > 0) {
    errorMessages.push(
      `Requires ${errors.LACKING_MINLENGTH} more ${pluralizeWord(
        "character",
        errors.LACKING_MINLENGTH
      )}.`
    );
  }

  if (errors?.REGEX_PATTERN_MISMATCH) {
    errorMessages.push(errors.REGEX_PATTERN_MISMATCH);
  }

  if (errors?.REGEX_RESTRICT_PATTERN_MATCH) {
    errorMessages.push(errors.REGEX_RESTRICT_PATTERN_MATCH);
  }

  if (errors?.INVALID_RANGE) {
    errorMessages.push(errors.INVALID_RANGE);
  }

  if (errors?.CUSTOM_ERROR) {
    errorMessages.push(errors.CUSTOM_ERROR);
  }

  return errorMessages;
};

export const FieldError = forwardRef(
  ({ errors, fields }: FieldErrorProps, ref) => {
    const errorContainerEl = useRef(null);

    useImperativeHandle(
      ref,
      () => {
        return {
          scrollToErrors() {
            errorContainerEl?.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "center",
            });
          },
        };
      },
      [errorContainerEl]
    );

    // Scroll to the errors on mount
    useEffect(() => {
      errorContainerEl?.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }, []);

    const fieldErrors = useMemo(() => {
      const errorMap = Object.entries(errors)?.map(([name, errorDetails]) => {
        const errorMessages = getErrorMessage(errorDetails);

        const fieldData = fields?.find((field) => field.name === name);

        return {
          label:
            fieldData?.label ||
            SEO_FIELD_LABELS[name as keyof typeof SEO_FIELD_LABELS],
          errorMessages,
          sort: fieldData?.sort,
          ZUID: fieldData?.ZUID || name,
        };
      });

      return errorMap.sort((a, b) => a.sort - b.sort);
    }, [errors, fields]);

    const fieldsWithErrors = fieldErrors?.filter(
      (error) => error.errorMessages.length > 0
    );

    const handleErrorClick = (fieldZUID: string) => {
      const fieldElement = document.getElementById(fieldZUID);
      fieldElement?.scrollIntoView({ behavior: "smooth" });
    };

    return (
      <ThemeProvider theme={theme}>
        <Stack
          data-cy="FieldErrorsList"
          ref={errorContainerEl}
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
            {fieldErrors?.map((error, index) => {
              if (error.errorMessages.length > 0) {
                return (
                  <Typography key={index} variant="body2" component="li">
                    <Box
                      sx={{
                        borderBottom: 1,
                        borderColor: "error.dark",
                        cursor: "pointer",
                        height: 16,
                        display: "inline-block",
                      }}
                      component="span"
                      onClick={() => handleErrorClick(error.ZUID)}
                    >
                      {error.label}
                    </Box>
                    {error.errorMessages.length === 1 ? (
                      <i> - {error.errorMessages[0]}</i>
                    ) : (
                      <Box component="ul" sx={{ pl: 3, listStyleType: "disc" }}>
                        {error.errorMessages.map((msg, idx) => (
                          <li key={idx}>{msg}</li>
                        ))}
                      </Box>
                    )}
                  </Typography>
                );
              }
            })}
          </Box>
        </Stack>
      </ThemeProvider>
    );
  }
);
