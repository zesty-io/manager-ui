import React, { FC, useState } from "react";
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
  FormControl,
  OutlinedInput,
  styled,
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import CheckIcon from "@mui/icons-material/Check";
import SaveIcon from "@mui/icons-material/Save";

import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded";

import * as WorkflowStatus from "./constants";

const FormInputFieldWrapper = styled(FormControl)(({ theme }) => ({
  "& .inputLabel1, & .inputLabel2, & label": {
    fontSize: "14px",
  },
  "& .inputLabel1, & label": {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  "& .inputLabel2": {
    fontWeight: 400,
    color: theme.palette.text.secondary,
  },
  "& .checkboxWrapper": {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    "& .MuiCheckbox-root": {
      padding: theme.spacing(0.25, 1, 1, 2),
      color: theme.palette.action.active,
      "&.Mui-checked": {
        color: theme.palette.primary.main,
      },
    },
  },
  "& .MuiInputBase-root": {
    marginTop: theme.spacing(0.5),
  },
}));

const RolesInputStyles = styled(Autocomplete)(({ theme }) => ({
  "& .MuiChip-root": {
    backgroundColor: "transparent",
    border: `1px solid ${theme.palette.border}`,
  },
  "& .input-hidden": {
    opacity: 0,
  },
}));

const ColorSelectInput = ({
  name,
  listData,
  defaultValue = "",
  usedColors = [],
}: {
  name: string;
  listData: WorkflowStatus.ColorMenuProps[];
  defaultValue?: WorkflowStatus.ColorHexTypes | "";
  usedColors: WorkflowStatus.ColorHexTypes[];
}) => {
  const [value, setValue] = useState<any>(defaultValue);

  const availableColors = listData.filter(
    (itemColor) => !usedColors.includes(itemColor.value)
  );

  // TO DO: Replace sorting based on the order set by the user (stored in the database)
  const sortedListData = listData.sort(
    (a: WorkflowStatus.ColorMenuProps, b: WorkflowStatus.ColorMenuProps) =>
      a.label.localeCompare(b.label)
  );

  const defaultSelectedValue: WorkflowStatus.ColorMenuProps | [] = !defaultValue
    ? availableColors?.[0] || listData?.[0]
    : listData.find((option) => option.value === defaultValue);

  return (
    <>
      <Autocomplete
        disableClearable
        autoHighlight
        autoSelect
        fullWidth
        options={sortedListData}
        defaultValue={defaultSelectedValue}
        onChange={(
          event: React.ChangeEvent<{}>,
          newValue: WorkflowStatus.ColorMenuProps
        ) => setValue(newValue?.value)}
        size="small"
        renderOption={(props: any, option: any) => (
          <li {...props}>
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="flex-start"
              alignItems="center"
              gap={1}
            >
              <Box
                width="16.67px"
                height="16.67px"
                borderRadius="50%"
                bgcolor={option.value}
              />
              <Typography variant="body2" color="text.primary">
                {option.label}
              </Typography>
            </Box>
          </li>
        )}
        renderInput={(params: any) => (
          <TextField
            {...params}
            InputProps={{
              ...params.InputProps,
              name: name,
              startAdornment: (
                <Box
                  width="16.67px"
                  height="16.67px"
                  borderRadius="50%"
                  bgcolor={WorkflowStatus.getHexValue(params.inputProps.value)}
                  ml={0.5}
                  mr={0.5}
                />
              ),
            }}
          />
        )}
      />
      {/* <input type="hidden" name={name} value={value} /> */}
    </>
  );
};

const RolesSelectInput = ({
  name,
  listData,
  defaultValue = "",
}: {
  name: string;
  listData: WorkflowStatus.RoleMenuProps[];
  defaultValue?: string | "";
}) => {
  const [value, setValue] = useState(defaultValue || "");
  const sortedListData = listData.sort(
    (a: WorkflowStatus.RoleMenuProps, b: WorkflowStatus.RoleMenuProps) =>
      a.label.localeCompare(b.label)
  );

  const handleSelectionChange = (
    event: React.ChangeEvent<{}>,
    newValue: WorkflowStatus.RoleMenuProps[]
  ) => {
    const valueArray: WorkflowStatus.RoleZuidTypes[] = newValue?.map(
      (item: WorkflowStatus.RoleMenuProps) => item.value
    );
    const stringVal: string = valueArray?.join(",");
    setValue(stringVal || "");
  };

  const formDefaultValue = WorkflowStatus.getRoleInfo(defaultValue) || "";

  return (
    <>
      <RolesInputStyles
        multiple
        fullWidth
        disableClearable
        options={sortedListData}
        disableCloseOnSelect
        getOptionLabel={(option: any) => option.label}
        size="small"
        defaultValue={formDefaultValue}
        onChange={handleSelectionChange}
        renderOption={(props: any, option: any, { selected }: any) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              <Checkbox
                size="small"
                disableFocusRipple
                disableRipple
                icon={<CheckIcon fontSize="medium" sx={{ opacity: 0 }} />}
                checkedIcon={<CheckIcon fontSize="medium" />}
                sx={{ marginRight: 8, position: "absolute", left: 0 }}
                checked={selected}
              />
              <Typography variant="body2" sx={{ pl: 4 }}>
                {option.label}
              </Typography>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={!!value && !!formDefaultValue ? "" : "None"}
          />
        )}
      />
      <input type="hidden" name={name} value={value} />
    </>
  );
};
type CreateStatusLabelFormProps = {
  open?: boolean;
  onClose?: () => void;
  defaultValues?: WorkflowStatus.StatusLabelProps | undefined;
  usedLabels: WorkflowStatus.StatusLabelProps[] | [];
};

type FormDataProps = {
  name: string;
  description: string;
  color: WorkflowStatus.ColorHexTypes;
  allowPublish: boolean;
  addPermissionRole: string;
  removePermissionRole: string;
};

const CreateNewStatusLabelForm: FC<CreateStatusLabelFormProps> = ({
  open,
  onClose,
  defaultValues = undefined,
  usedLabels = [],
}: CreateStatusLabelFormProps) => {
  const formTitle = defaultValues
    ? `Edit ${defaultValues?.name}`
    : "Create Status";

  const usedColors = usedLabels?.map((itemLabel) => itemLabel?.color);

  const handleFormSubmit = (actionType: "edit" | "create") => {
    return (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formDataRaw = new FormData(e.currentTarget);
      const formData = Object.fromEntries(formDataRaw);

      const newStatusLabelEntry: WorkflowStatus.CreateStatusLabelProps = {
        name: String(formData.name),
        description: String(formData.description),
        color: WorkflowStatus.getHexValue(
          formData.color as WorkflowStatus.ColorNameTypes
        ),
        allowPublish: formData.allowPublish === "true",
        addPermissionRole: String(formData.addPermissionRole),
        removePermissionRole: String(formData.removePermissionRole),
      };

      if (actionType === "create") {
        alert("NEW STATUS LABEL CREATED");
      }
      if (actionType === "edit") {
        alert("STATUS LABEL HAS BEEN UPDATED");
      }
    };
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          component: "form",
          onSubmit: handleFormSubmit(!!defaultValues ? "edit" : "create"),
          bgcolor: "grey.50",
          sx: {
            borderRadius: (theme) => theme.spacing(1),
          },
        }}
      >
        <DialogTitle component="div">
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" color="text.primary" fontWeight={700}>
              {formTitle}
            </Typography>
            <IconButton size="small" onClick={() => onClose()}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box
            p={2.5}
            bgcolor="grey.50"
            rowGap={2}
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="stretch"
          >
            <FormInputFieldWrapper>
              <Typography className="inputLabel1">
                Name
                <InfoRoundedIcon
                  color="disabled"
                  sx={{ height: "12px", aspectRatio: 1 }}
                />
              </Typography>
              <OutlinedInput
                name="name"
                defaultValue={defaultValues?.name || ""}
                placeholder="e.g. Needs Content Review"
                size="small"
              />
            </FormInputFieldWrapper>
            <FormInputFieldWrapper>
              <Typography className="inputLabel1">
                Description (optional)
                <InfoRoundedIcon
                  color="disabled"
                  sx={{ height: "12px", aspectRatio: 1 }}
                />
              </Typography>
              <Typography className="inputLabel2">
                Describe what this status means in the context of your workflows
              </Typography>
              <OutlinedInput
                name="description"
                defaultValue={defaultValues?.description || ""}
                multiline
                placeholder="Ready for legal team to review for publishing"
                minRows={2}
                maxRows={2}
                size="small"
              />
            </FormInputFieldWrapper>
            <FormInputFieldWrapper>
              <Typography className="inputLabel1">Color</Typography>

              <ColorSelectInput
                name="color"
                listData={WorkflowStatus.colorMenu}
                defaultValue={defaultValues?.color}
                usedColors={usedColors}
              />
            </FormInputFieldWrapper>
            <FormInputFieldWrapper>
              <Typography className="inputLabel1">
                Which roles can add this status?
              </Typography>
              <Typography className="inputLabel2">
                All users who can remove this status will be notified when it's
                added
              </Typography>

              <RolesSelectInput
                name="addPermissionRole"
                listData={WorkflowStatus.roleMenu}
                defaultValue={defaultValues?.addPermissionRole}
              />
            </FormInputFieldWrapper>
            <FormInputFieldWrapper>
              <Typography className="inputLabel1">
                Which roles can remove this status?
              </Typography>
              <Typography className="inputLabel2">
                All users who can add and remove this status will be notified
                when it's removed
              </Typography>

              <RolesSelectInput
                name="removePermissionRole"
                listData={WorkflowStatus.roleMenu}
                defaultValue={defaultValues?.removePermissionRole}
              />
            </FormInputFieldWrapper>
            <FormInputFieldWrapper>
              <FormControlLabel
                className="checkboxWrapper"
                control={
                  <>
                    <Checkbox
                      name="allowPublish"
                      defaultChecked={defaultValues?.allowPublish}
                      onChange={(
                        e: React.ChangeEvent<HTMLInputElement>,
                        checked: boolean
                      ) => {
                        e.target.value = checked.toString();
                      }}
                      disableRipple
                      sx={{ ml: "-.5rem" }}
                    />
                  </>
                }
                label={
                  <Box>
                    <Typography className="inputLabel1">
                      Allow publish with this status
                    </Typography>
                    <Typography className="inputLabel2">
                      This means a content item with this status can be
                      published
                    </Typography>
                  </Box>
                }
              />
            </FormInputFieldWrapper>
            {!!defaultValues && (
              <FormInputFieldWrapper>
                <Box>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<PauseCircleOutlineRoundedIcon />}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Deactivate Status
                    </Typography>
                  </Button>
                </Box>
              </FormInputFieldWrapper>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
          >
            {!!defaultValues ? "Save" : "Create Status"}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};
export default CreateNewStatusLabelForm;
