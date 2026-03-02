import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { ContentModelField } from "shell/services/types";
import { SubField } from "./SubField";
import { Error } from "../../../apps/content-editor/src/app/components/Editor/Field/FieldShell";
import { cloneDeep, isEqual } from "lodash";
import { MaxLengths } from "../../../apps/content-editor/src/app/components/Editor/Editor";

type RowDialogProps = {
  onClose: () => void;
  name: string;
  fields: Partial<ContentModelField>[];
  ZUID: string;
};
export const RowDialog = ({ onClose, name, fields, ZUID }: RowDialogProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, Error>>({});

  // Set default values for the fields
  useEffect(() => {
    if (!fields || !fields.length) return;

    const initialData: Record<string, any> = {};

    fields.forEach((field) => {
      if (
        field?.settings?.defaultValue !== null &&
        field?.settings?.defaultValue !== undefined
      ) {
        initialData[field.name] = field.settings.defaultValue;
        return;
      }

      if (field.datatype === "sort") {
        initialData[field.name] = 0;
        return;
      }

      initialData[field.name] = null;
    });

    setFormData(initialData);
  }, [fields]);

  const handleChange = useCallback(
    (value, name) => {
      if (!name) {
        throw new Error("Input is missing name attribute");
      }

      const field = fields?.find((field) => field.name === name);
      const fieldMaxLength =
        // @ts-expect-error untyped
        field?.settings?.maxCharLimit ?? MaxLengths[field?.datatype];
      const errors = cloneDeep(formErrors);

      // Remove the required field error message when a value has been added
      if (field?.required) {
        if (field?.datatype === "yes_no" && value !== null) {
          errors[name] = {
            ...(errors[name] ?? {}),
            MISSING_REQUIRED: false,
          };
        } else if (field?.datatype !== "yes_no" && value) {
          errors[name] = {
            ...(errors[name] ?? {}),
            MISSING_REQUIRED: false,
          };
        }
      }

      // Validate character length
      if (fieldMaxLength) {
        if (value.length > fieldMaxLength) {
          errors[name] = {
            ...(errors[name] ?? []),
            EXCEEDING_MAXLENGTH: value.length - fieldMaxLength,
          };
        } else {
          errors[name] = { ...(errors[name] ?? []), EXCEEDING_MAXLENGTH: 0 };
        }
      }

      if (field?.settings?.minCharLimit) {
        if (value.length < field?.settings?.minCharLimit) {
          errors[name] = {
            ...(errors[name] ?? []),
            LACKING_MINLENGTH: field?.settings?.minCharLimit - value.length,
          };
        } else {
          errors[name] = { ...(errors[name] ?? []), LACKING_MINLENGTH: 0 };
        }
      }

      if (field?.settings?.regexMatchPattern) {
        const regex = new RegExp(field?.settings?.regexMatchPattern);
        if (!regex.test(value)) {
          errors[name] = {
            ...(errors[name] ?? []),
            REGEX_PATTERN_MISMATCH: field?.settings?.regexMatchErrorMessage,
          };
        } else {
          errors[name] = {
            ...(errors[name] ?? []),
            REGEX_PATTERN_MISMATCH: "",
          };
        }
      }

      if (field?.settings?.regexRestrictPattern) {
        const regex = new RegExp(field?.settings?.regexRestrictPattern);
        if (regex.test(value)) {
          errors[name] = {
            ...(errors[name] ?? []),
            REGEX_RESTRICT_PATTERN_MATCH:
              field?.settings?.regexRestrictErrorMessage,
          };
        } else {
          errors[name] = {
            ...(errors[name] ?? []),
            REGEX_RESTRICT_PATTERN_MATCH: "",
          };
        }
      }

      if (
        field?.settings?.minValue !== null &&
        field?.settings?.maxValue !== null
      ) {
        if (
          value < field?.settings?.minValue ||
          value > field?.settings?.maxValue
        ) {
          errors[name] = {
            ...(errors[name] ?? []),
            INVALID_RANGE: `Value must be between ${field?.settings?.minValue} and ${field?.settings?.maxValue}`,
          };
        } else {
          errors[name] = {
            ...(errors[name] ?? []),
            INVALID_RANGE: "",
          };
        }
      }

      if (field.datatype === "block_selector") {
        errors[name] = {
          ...(errors[name] ?? []),
          INVALID_BLOCK_VARIANT: false,
        };
      }

      if (
        ["one_to_many", "wysiwyg_advanced", "wysiwyg_basic"].includes(
          field.datatype
        )
      ) {
        // Clear out the error after changing the value
        // Note: These errors are most of the time validation errors from the api
        errors[name] = {
          ...(errors[name] ?? []),
          CUSTOM_ERROR: "",
        };
      }

      if (!isEqual(errors, formErrors)) {
        setFormErrors(errors);
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : value,
      }));
    },
    [formErrors, fields]
  );

  return (
    <Dialog
      open
      onClose={onClose}
      slotProps={{
        paper: { sx: { maxWidth: "unset", width: 640, overflow: "clip" } },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Add row to {name}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          pt: 2.5,
          backgroundColor: "grey.50",
          "&.MuiDialogContent-dividers": {
            borderColor: "border",
          },
        }}
      >
        {fields?.map((field) => (
          <SubField
            key={field.ZUID}
            field={field as ContentModelField}
            value={formData[field.name]}
            onChange={handleChange}
            errors={formErrors[field.name]}
            repeaterFieldItemZUID={ZUID}
          />
        ))}
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: "space-between",
          pt: 2,
        }}
      >
        <Button variant="outlined" onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={onClose} startIcon={<AddIcon />}>
            Add another field
          </Button>
          <Button variant="contained" onClick={onClose}>
            Save
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
