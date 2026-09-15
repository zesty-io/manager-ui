import {
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  Stack,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslation } from "react-i18next";
import {
  getFieldCopyConfig,
  getFieldCategoryLabels,
  FieldListData,
  FieldType,
} from "../../../configs";
import { FieldItem } from "../../FieldItem";

const ALLOWED_REPEATER_FIELD_TYPES = new Set<FieldType>([
  "text",
  "textarea",
  "wysiwyg_basic",
  "markdown",
  "images",
  "link",
  "number",
  "currency",
  "yes_no",
  "dropdown",
  "color",
  "sort",
  "uuid",
  "date",
  "datetime",
]);

type RepeaterFieldsSelectionProps = {
  handleClose: () => void;
  name: string;
  handleFieldSelection: ({
    type,
    name,
  }: {
    type: FieldType;
    name: string;
  }) => void;
};
export const RepeaterFieldsSelection = ({
  handleClose,
  name,
  handleFieldSelection,
}: RepeaterFieldsSelectionProps) => {
  const { t } = useTranslation();
  const FIELD_COPY_CONFIG = getFieldCopyConfig(t);
  const FIELD_CATEGORY_LABELS = getFieldCategoryLabels(t);
  const repeaterFields = {
    text: FIELD_COPY_CONFIG.text.filter((field) =>
      ALLOWED_REPEATER_FIELD_TYPES.has(field.type)
    ),
    media: FIELD_COPY_CONFIG.media.filter((field) =>
      ALLOWED_REPEATER_FIELD_TYPES.has(field.type)
    ),
    relationship: FIELD_COPY_CONFIG.relationship.filter((field) =>
      ALLOWED_REPEATER_FIELD_TYPES.has(field.type)
    ),
    numeric: FIELD_COPY_CONFIG.numeric.filter((field) =>
      ALLOWED_REPEATER_FIELD_TYPES.has(field.type)
    ),
    dateandtime: FIELD_COPY_CONFIG.dateandtime.filter((field) =>
      ALLOWED_REPEATER_FIELD_TYPES.has(field.type)
    ),
    options: FIELD_COPY_CONFIG.options.filter((field) =>
      ALLOWED_REPEATER_FIELD_TYPES.has(field.type)
    ),
  };
  return (
    <>
      <DialogTitle component="div">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center">
            <IconButton
              data-cy="BackToFieldSelectionBtn"
              size="small"
              onClick={handleClose}
              sx={{ mr: 1.5 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" fontWeight={700}>
              {t("schema.addFieldToName", { name })}
            </Typography>
          </Stack>
          <IconButton
            size="small"
            onClick={handleClose}
            data-cy="AddFieldCloseBtn"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent
        data-cy="SubFieldSelection"
        dividers
        sx={{
          pt: 2.5,
          backgroundColor: "grey.50",
          "&.MuiDialogContent-dividers": {
            borderColor: "border",
          },
          "& div.field-type-group:not(:last-of-type)": {
            mb: 1.5,
          },
        }}
      >
        {(Object.keys(repeaterFields) as (keyof typeof repeaterFields)[]).map(
          (fieldKey) => (
            <Box className="field-type-group" key={fieldKey}>
              <Typography
                component="p"
                variant="overline"
                mb={1.5}
                color="text.secondary"
              >
                {FIELD_CATEGORY_LABELS[fieldKey] ?? fieldKey}
              </Typography>
              <Box
                display="grid"
                gridTemplateColumns="1fr 1fr"
                rowGap={1.5}
                columnGap={2}
              >
                {repeaterFields[fieldKey].map((field: FieldListData, index) => {
                  return (
                    <FieldItem
                      key={index}
                      fieldName={field.name}
                      shortDescription={field.shortDescription}
                      fieldType={field.type}
                      description={field.description}
                      commonUses={field.commonUses}
                      proTip={field.proTip}
                      onFieldClick={() =>
                        handleFieldSelection({
                          type: field.type,
                          name: field.name,
                        })
                      }
                    />
                  );
                })}
              </Box>
            </Box>
          )
        )}
      </DialogContent>
    </>
  );
};
