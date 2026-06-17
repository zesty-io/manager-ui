import {
  useMemo,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Stack, Typography, Box } from "@mui/material";
import DangerousRoundedIcon from "@mui/icons-material/DangerousRounded";
import { useTranslation } from "react-i18next";
import { Error } from "./Field/FieldShell";
import { ContentModelField } from "../../../../../../shell/services/types";
import { getFieldErrorMessages } from "./Field/getFieldErrorMessages";

type FieldErrorProps = {
  errors: Record<string, Error>;
  fields: ContentModelField[];
};

export const FieldError = forwardRef(
  ({ errors, fields }: FieldErrorProps, ref) => {
    const { t } = useTranslation("content");
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
      // SEO meta fields render through this dialog but aren't in the model's
      // field list, so they have no DB label — fall back to a localized label.
      const seoFieldLabels: Record<string, string> = {
        metaDescription: t("content.seoFieldMetaDescription"),
        metaTitle: t("content.seoFieldMetaTitle"),
        metaKeywords: t("content.seoFieldMetaKeywords"),
        metaLinkText: t("content.seoFieldNavigationTitle"),
        parentZUID: t("content.seoFieldPageParent"),
        pathPart: t("content.seoFieldUrlPathPart"),
      };

      const errorMap = Object.entries(errors)?.map(([name, errorDetails]) => {
        const errorMessages = getFieldErrorMessages(errorDetails, t);

        const fieldData = fields?.find((field) => field.name === name);

        return {
          label: fieldData?.label || seoFieldLabels[name],
          errorMessages,
          sort: fieldData?.sort,
          ZUID: fieldData?.ZUID || name,
        };
      });

      return errorMap.sort((a, b) => a.sort - b.sort);
    }, [errors, fields, t]);

    const fieldsWithErrors = fieldErrors?.filter(
      (error) => error.errorMessages.length > 0
    );

    const handleErrorClick = (fieldZUID: string) => {
      const fieldElement = document.getElementById(fieldZUID);
      fieldElement?.scrollIntoView({ behavior: "smooth" });
    };

    return (
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
          {t("content.invalidFieldValuesTitle")}
        </Typography>
        <Typography variant="body2">
          {t("content.correctFieldsBeforeSaving", {
            count: fieldsWithErrors?.length,
          })}
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
    );
  }
);
