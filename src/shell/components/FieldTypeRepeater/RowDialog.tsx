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
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { RepeaterSubField } from "shell/services/types";
import { SubField } from "./SubField";
import { Error } from "../../../apps/content-editor/src/app/components/Editor/Field/FieldShell";
import { cloneDeep, isEqual } from "lodash";
import { MaxLengths } from "../../../apps/content-editor/src/app/components/Editor/Editor";

type RowDialogProps = {
  onClose: () => void;
  onRemoveRow: (index: number) => void;
  onSubmit: (data: Record<string, any>) => void;
  name: string;
  fields: RepeaterSubField[];
  ZUID: string;
  editRowData?: Record<string, any>;
  isUpdate?: boolean;
};
export const RowDialog = ({
  onClose,
  name,
  fields,
  ZUID,
  onSubmit,
  onRemoveRow,
  editRowData,
  isUpdate,
}: RowDialogProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, Error>>({});
  const [resetKey, setResetKey] = useState(0);
  const [version, setVersion] = useState(0);

  const getInitialFormData = useCallback(() => {
    if (!fields?.length) return {};

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

    return initialData;
  }, [fields]);

  // Set default values for the fields
  useEffect(() => {
    if (isUpdate) {
      setFormData(editRowData);
      setVersion((prev) => prev + 1);
    } else {
      setFormData(getInitialFormData());
    }
  }, [getInitialFormData, isUpdate, editRowData]);

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

  const validateRequiredFields = (): Record<string, Error> => {
    const errors = cloneDeep(formErrors);

    fields?.forEach((field) => {
      if (!field?.required) return;

      const value = formData[field.name];

      let isMissing = false;

      if (field.datatype === "yes_no") {
        isMissing = value === null;
      } else if (["number", "sort"].includes(field.datatype)) {
        isMissing = value === null || value === undefined;
      } else {
        isMissing = !value;
      }

      if (isMissing) {
        errors[field.name] = {
          ...(errors[field.name] ?? {}),
          MISSING_REQUIRED: true,
        };
      }
    });

    return errors;
  };

  const hasActiveErrors = (errors: Record<string, Error>): boolean => {
    return Object.values(errors)
      .flatMap((error) => Object.values(error))
      .some((error) => !!error);
  };

  const handleSubmit = (addNew?: boolean) => {
    const validatedErrors = validateRequiredFields();

    if (hasActiveErrors(validatedErrors)) {
      setFormErrors(validatedErrors);
      return;
    }

    onSubmit(formData);

    if (addNew) {
      setFormData(getInitialFormData());
      setFormErrors({});
      setResetKey((prev) => prev + 1);
    } else {
      onClose();
    }
  };

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
          {isUpdate ? `Edit ${name}` : `Add row to ${name}`}
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
          display: "flex",
          flexDirection: "column",
          gap: 2,
          "&.MuiDialogContent-dividers": {
            borderColor: "border",
          },
        }}
      >
        {fields?.map((field) => {
          const needsRemount = ["wysiwyg_basic", "uuid"].includes(
            field.datatype
          );

          return (
            <SubField
              key={needsRemount ? `${field.label}-${resetKey}` : field.label}
              field={field}
              value={formData[field.name]}
              onChange={handleChange}
              errors={formErrors[field.name]}
              repeaterFieldItemZUID={ZUID}
              version={version}
            />
          );
        })}
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: "space-between",
          pt: 2,
        }}
      >
        {isUpdate ? (
          <>
            <Button
              data-cy="RemoveRepeaterRowItemBtn"
              variant="contained"
              onClick={() => onRemoveRow(formData.id)}
              color="error"
              startIcon={<DeleteRoundedIcon />}
            >
              Remove Row
            </Button>
            <Stack direction="row" spacing={2}>
              <Button
                data-cy="CloseAddRepeaterRowDialogBtn"
                variant="outlined"
                onClick={onClose}
                color="inherit"
              >
                Cancel
              </Button>
              <Button
                data-cy="SaveRepeaterRowItemBtn"
                variant="contained"
                onClick={() => handleSubmit()}
              >
                Done
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Button variant="outlined" onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Stack direction="row" spacing={2}>
              <Button
                data-cy="AddAnotherRepeaterRowItemBtn"
                variant="outlined"
                onClick={() => handleSubmit(true)}
                startIcon={<AddIcon />}
              >
                Add another field
              </Button>
              <Button
                data-cy="SaveRepeaterRowItemBtn"
                variant="contained"
                onClick={() => handleSubmit()}
              >
                Save
              </Button>
            </Stack>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
