import { FC, FormEvent, ReactNode, useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  OutlinedInput,
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Brightness1Icon from "@mui/icons-material/Brightness1";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import CheckIcon from "@mui/icons-material/Check";
import SaveIcon from "@mui/icons-material/Save";
import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded";
import { LoadingButton } from "@mui/lab";
import {
  useCreateWorkflowStatusLabelMutation,
  useUpdateWorkflowStatusLabelMutation,
} from "../../../../../../../../../shell/services/instance";
import { useFormDialogContext } from ".";
import { useDispatch } from "react-redux";
import { notify } from "../../../../../../../../../shell/store/notifications";
import { useGetUsersRolesQuery } from "../../../../../../../../../shell/services/accounts";
import {
  CreateStatusLabel,
  StatusLabel,
} from "../../../../../../../../../shell/services/types";
import { ColorMenu, colorMenu, RoleMenu } from "../../constants";

interface FormInputFieldWrapperProps {
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: ReactNode;
}

export type StatusLabelFormProps = {
  open: boolean;
  onClose: () => void;
  labels?: StatusLabel[];
  values?: StatusLabel | undefined;
  isDeactivated?: boolean;
};

const FormInputFieldWrapper: FC<FormInputFieldWrapperProps> = ({
  label,
  required = false,
  description,
  error,
  children,
}) => (
  <Box
    display="flex"
    flexDirection="column"
    pb={0.25}
    position="relative"
    data-cy="status-label-field-wrapper"
  >
    <Typography variant="body2" fontWeight={600}>
      {label}
      {required && (
        <InfoRoundedIcon
          color="action"
          sx={{ height: "12px", aspectRatio: 1, mt: 0.15 }}
        />
      )}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    )}
    <Box
      pt={0.25}
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="stretch"
    >
      {children}
    </Box>
    {!!error && (
      <Typography
        data-cy="status-label-field-error"
        variant="caption"
        color="error"
        sx={{
          position: "absolute",
          bottom: 0,
          transform: "translateY(calc(100% - 4px))",
        }}
      >
        {error}
      </Typography>
    )}
  </Box>
);

const ColorSelectInput = ({
  name,
  defaultValue = "",
  usedColors = [],
}: {
  name: string;
  defaultValue?: string | "";
  usedColors: string[];
}) => {
  const availableColors = colorMenu
    .sort((a, b) => a.label.localeCompare(b.label))
    .filter((item) => !usedColors.includes(item.value));

  const defaultColor =
    colorMenu?.find(
      (item) =>
        item?.value?.trim()?.toUpperCase() ===
        defaultValue?.trim()?.toUpperCase()
    ) ||
    availableColors?.[0] ||
    colorMenu?.[0];

  const [selectedColor, setSelectedColor] = useState<ColorMenu>(defaultColor);

  return (
    <>
      <Autocomplete
        disableClearable
        autoHighlight
        fullWidth
        options={colorMenu}
        size="small"
        onChange={(event, newValue) => setSelectedColor(newValue)}
        value={selectedColor}
        renderOption={(props, option) => (
          <li {...props}>
            <Box display="flex" alignItems="center" gap={1}>
              <Brightness1Icon
                sx={{
                  color: option.value,
                  width: "1.25rem",
                  height: "1.25rem",
                }}
              />
              <Typography variant="body2" color="text.primary">
                {option.label}
              </Typography>
            </Box>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <Brightness1Icon
                  sx={{
                    ml: ".25rem",
                    color: selectedColor.value,
                    width: "1.15rem",
                    height: "1.15rem",
                  }}
                />
              ),
            }}
          />
        )}
      />
      <input
        type="hidden"
        name={name}
        value={selectedColor.value?.trim()?.toUpperCase()}
      />
    </>
  );
};

const RolesSelectInput = ({
  name,
  listData,
  defaultValue = "",
}: {
  name: string;
  listData: RoleMenu[];
  defaultValue?: string;
}) => {
  const [value, setSelectedColor] = useState(defaultValue || "");
  const sortedListData = [...listData].sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  const getRoleInfo = (zuids: string) =>
    zuids
      ? sortedListData.filter((item) =>
          zuids.split(",").includes(item.value.trim())
        )
      : [];
  const handleChange = (_: unknown, newValue: RoleMenu[]) =>
    setSelectedColor(newValue.map((item) => item.value).join(","));

  return (
    <>
      <Autocomplete
        multiple
        fullWidth
        options={sortedListData}
        disableCloseOnSelect
        value={getRoleInfo(value)}
        onChange={handleChange}
        size="small"
        getOptionLabel={(option) => option.label}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              size="small"
              disableRipple
              icon={<CheckIcon fontSize="medium" sx={{ opacity: 0 }} />}
              checkedIcon={<CheckIcon fontSize="medium" />}
              checked={selected}
              value={option.value}
              sx={{
                marginRight: "5px",
                position: "absolute",
                left: 0,
              }}
            />
            <Typography variant="body2" sx={{ pl: 4 }}>
              {option.label}
            </Typography>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={value ? "" : "None"}
          />
        )}
        ChipProps={{
          sx: {
            height: "1.25rem",
            backgroundColor: "transparent",
            outline: "1px solid",
            outlineColor: (theme) => theme.palette.border,
          },
        }}
      />
      <input type="hidden" name={name} value={value?.trim()} />
    </>
  );
};

const validateFormData = (formData: CreateStatusLabel) => {
  const errors: Record<string, string> = {};
  if (!formData.name) errors.name = "Name is required";
  // if (!formData.description) errors.description = "Description is required";
  if (!formData.color) errors.color = "Color is required";
  return errors;
};

const StatusLabelForm: FC<StatusLabelFormProps> = ({
  open,
  onClose,
  labels = [],
  values,
  isDeactivated = false,
}) => {
  const ZUID = values?.ZUID || undefined;
  const [rolesMenuItems, setRolesMenuItems] = useState<RoleMenu[]>([]);
  const {
    isLoading: rolesLoading,
    isFetching,
    data: rolesMenuData,
  } = useGetUsersRolesQuery();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const dispatch = useDispatch();
  const [createWorkflowStatusLabel, { isLoading: createLabelIsLoading }] =
    useCreateWorkflowStatusLabelMutation();
  const [updateWorkflowStatusLabel, { isLoading: editLabelIsLoading }] =
    useUpdateWorkflowStatusLabelMutation();
  const { openDeactivationDialog, setFocusedLabel } = useFormDialogContext();

  const usedColors = labels.map((label) => label.color);

  const transformRoleValues = (value: string): string[] =>
    value ? value.split(",") : [];

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.currentTarget));

    const newStatusLabel: CreateStatusLabel = {
      name: formData.name as string,
      description: (formData.description as string) || "",
      color: formData.color as string,
      allowPublish: formData.allowPublish === "true",
      addPermissionRoles: transformRoleValues(
        formData.addPermissionRoles as string
      ),
      removePermissionRoles: transformRoleValues(
        formData.removePermissionRoles as string
      ),
    };

    const errors = validateFormData(newStatusLabel);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    } else {
      setFormErrors({});
    }

    try {
      const response: any = ZUID
        ? await updateWorkflowStatusLabel({ ZUID, payload: newStatusLabel })
        : await createWorkflowStatusLabel(newStatusLabel);

      if (response?.error) {
        throw new Error(response.error.data?.error || "An error occurred.");
      }

      setFocusedLabel(response?.data?.ZUID);
    } catch (error) {
      dispatch(
        notify({
          kind: "error",
          message: `Error: ${
            error instanceof Error
              ? error.message
              : "An unexpected error occurred."
          }`,
        })
      );
    } finally {
      onClose();
    }
  };
  const handleDeactivation = () =>
    openDeactivationDialog({
      ZUID,
      name: values?.name,
      callBack: onClose,
    });

  useEffect(() => {
    if (!open) {
      setFormErrors({});
    }

    if (rolesLoading || isFetching) return;
    const roles =
      rolesMenuData?.map((item) => ({
        label: item?.role?.name as string,
        value: item?.role?.ZUID,
      })) || [];

    const uniqueRoles = Array.from(
      new Map(roles.map((role) => [role.value, role])).values()
    );
    setRolesMenuItems(uniqueRoles);
  }, [rolesLoading, isFetching, rolesMenuData, open]);

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        component: "form",
        onSubmit: handleFormSubmit,
        sx: { borderRadius: 1 },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {!!ZUID && (
            <Brightness1Icon
              sx={{ color: values?.color, width: "1.25rem", height: "1.25rem" }}
            />
          )}
          <Typography variant="h5" fontWeight={700} flexGrow={1}>
            {values?.name ? `Edit ${values.name}` : "Create Status"}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{ p: 0, backgroundColor: "grey.50" }}
        data-cy="status-label-form"
      >
        <Box display="flex" flexDirection="column" gap={3} p={2.5}>
          <FormInputFieldWrapper label="Name" error={formErrors?.name} required>
            <OutlinedInput
              name="name"
              defaultValue={values?.name || ""}
              placeholder="e.g. Needs Content Review"
              size="small"
            />
          </FormInputFieldWrapper>
          <FormInputFieldWrapper
            label="Description (optional)"
            description="Describe what this status means in the context of your workflows"
            required
          >
            <OutlinedInput
              name="description"
              defaultValue={values?.description || ""}
              multiline
              minRows={2}
              maxRows={2}
              placeholder="Ready for legal team to review for publishing"
              size="small"
            />
          </FormInputFieldWrapper>
          <FormInputFieldWrapper label="Color" error={formErrors?.color}>
            <ColorSelectInput
              name="color"
              defaultValue={values?.color}
              usedColors={usedColors}
            />
          </FormInputFieldWrapper>
          <FormInputFieldWrapper
            label="Which roles can add this status?"
            description="Users who can add this status will be notified."
          >
            <RolesSelectInput
              name="addPermissionRoles"
              listData={rolesMenuItems}
              defaultValue={values?.addPermissionRoles?.join(",")}
            />
          </FormInputFieldWrapper>
          <FormInputFieldWrapper
            label="Which roles can remove this status?"
            description="Users who can remove this status will be notified."
          >
            <RolesSelectInput
              name="removePermissionRoles"
              listData={rolesMenuItems}
              defaultValue={values?.removePermissionRoles?.join(",")}
            />
          </FormInputFieldWrapper>
          <FormControlLabel
            sx={{ display: "flex", alignItems: "start" }}
            control={
              <Checkbox
                name="allowPublish"
                defaultChecked={values?.allowPublish}
                disableRipple
                color="default"
                onChange={(
                  e: React.ChangeEvent<HTMLInputElement>,
                  checked: boolean
                ) => {
                  e.target.value = checked.toString();
                }}
                sx={{
                  p: 0,
                  ml: 1,
                  color: "action.active",
                  "&.Mui-checked": {
                    color: "primary.main",
                  },
                }}
              />
            }
            label={
              <Box pl={1}>
                <Typography
                  variant="body2"
                  color="text.primary"
                  fontWeight={600}
                >
                  Allow publish with this status
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={400}
                >
                  This means a content item with this status can be published
                </Typography>
              </Box>
            }
          />
          {!!ZUID && !isDeactivated && (
            <Box>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleDeactivation}
                startIcon={<PauseCircleOutlineRoundedIcon />}
                data-cy="form-deactivate-status-button"
              >
                Deactivate Status
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ pt: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <LoadingButton
          data-cy="status-label-submit-button"
          type="submit"
          variant="contained"
          color="primary"
          loading={createLabelIsLoading || editLabelIsLoading}
          startIcon={<SaveIcon />}
        >
          {ZUID ? "Save" : "Create Status"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default StatusLabelForm;
