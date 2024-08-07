import {
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  Stack,
  InputLabel,
  Autocomplete,
  TextField,
  Chip,
} from "@mui/material";
import { Errors, FormValue } from "./views/FieldForm";
import { CustomGroup } from "../hooks/useMediaRules";
import { InputField } from "./FieldFormInput";
import { FieldFormInput, FieldNames } from "./FieldFormInput";
import { useEffect, useState } from "react";

type MediaFieldName = Extract<
  FieldNames,
  "limit" | "group_id" | "fileExtensions"
>;

const MediaLabelsConfig: {
  [key in MediaFieldName]: { label: string; subLabel: string };
} = {
  limit: {
    label: "Allow multiple files to be selected",
    subLabel:
      "Ensures multiple files can be uploaded instead of default of just 1 file",
  },
  group_id: {
    label: "Lock to a folder",
    subLabel: "Ensures files can only be selected from a specific folder",
  },
  fileExtensions: {
    label: "Limit File Types",
    subLabel: "Ensures only certain file types can be accepted",
  },
};

const ExtensionPresets = [
  {
    label: "Images",
    value: [".png", ".jpg", ".jpeg", ".svg", ".gif", ".tif", ".webp"],
  },
  {
    label: "Videos",
    value: [
      ".mob",
      ".avi",
      ".wmv",
      ".mp4",
      ".mpeg",
      ".mkv",
      ".m4v",
      ".mpg",
      ".webm",
    ],
  },
  {
    label: "Audios",
    value: [
      ".mp3",
      ".flac",
      ".wav",
      ".m4a",
      ".aac",
      ".ape",
      ".opus",
      ".aiff",
      ".aif",
    ],
  },
  {
    label: "Documents",
    value: [".doc", ".pdf", ".docx", ".txt", ".rtf", ".odt", ".pages"],
  },
  {
    label: "Presentations",
    value: [
      ".ppt",
      ".pptx",
      ".key",
      ".odp",
      ".pps",
      ".ppsx",
      ".sldx",
      ".potx",
      ".otp",
      ".sxi",
    ],
  },
  {
    label: "Spreadsheets",
    value: [
      ".xls",
      ".xlsx",
      ".csv",
      ".tsv",
      ".numbers",
      ".ods",
      ".xlsm",
      ".xlsb",
      ".xlt",
      ".xltx",
    ],
  },
] as const;

const RestrictedExtensions = [".exe", ".dmg"];

interface Props {
  fieldConfig: InputField[];
  groups: CustomGroup[];
  onDataChange: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: FormValue;
  }) => void;
  fieldData: { [key: string]: FormValue };
  errors: Errors;
}

export const MediaRules = ({
  fieldConfig,
  onDataChange,
  groups,
  fieldData,
  errors,
}: Props) => {
  const [inputValue, setInputValue] = useState("");
  const [autoFill, setAutoFill] = useState(
    !fieldData.fileExtensionsErrorMessage
  );
  const [extensionsError, setExtensionsError] = useState(false);

  useEffect(() => {
    if (autoFill) {
      onDataChange({
        inputName: "fileExtensionsErrorMessage",
        value:
          "Only files with the following extensions are allowed: " +
          (fieldData["fileExtensions"] as string[])?.join(", "),
      });
    }
  }, [autoFill, fieldData["fileExtensions"]]);

  const handleInputChange = (
    event: any,
    newInputValue: string,
    ruleName: string
  ) => {
    const formattedInput = newInputValue.trim().toLowerCase();
    if (formattedInput && formattedInput[0] !== ".") {
      setInputValue(`.${formattedInput}`);
    } else {
      setInputValue(formattedInput);
    }
  };

  const handleKeyDown = (event: any, ruleName: string) => {
    if (
      (event.key === "Enter" || event.key === "," || event.key === " ") &&
      inputValue
    ) {
      event.preventDefault();
      const newOption = inputValue.toLowerCase().trim();
      if (
        newOption &&
        !(fieldData[ruleName] as string[]).includes(newOption) &&
        !RestrictedExtensions.includes(newOption)
      ) {
        onDataChange({
          inputName: ruleName,
          value: [...(fieldData[ruleName] as string[]), newOption],
        });
        setInputValue("");
      }
    } else if (event.key === "Backspace" && !inputValue) {
      const newTags = [...(fieldData[ruleName] as string[])];
      newTags.pop();
      if (!newTags.length) {
        setExtensionsError(true);
      }
      onDataChange({
        inputName: ruleName,
        value: newTags,
      });
    }
  };

  const handleDelete = (option: string, ruleName: string) => {
    const newTags = (fieldData[ruleName] as string[]).filter(
      (item) => item.trim() !== option.trim()
    );
    if (!newTags.length) {
      setExtensionsError(true);
    }
    onDataChange({
      inputName: ruleName,
      value: newTags,
    });
  };

  return (
    <Box
      data-cy="MediaRulesTab"
      display="flex"
      flexDirection="column"
      height="100%"
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        gap="20px"
      >
        {fieldConfig?.map((rule: InputField, key: number) => {
          if (
            rule.name === "defaultValue" ||
            rule.name === "fileExtensionsErrorMessage"
          )
            return null;
          return (
            <Box key={key}>
              <FormControlLabel
                sx={{ alignItems: "flex-start" }}
                control={
                  <Checkbox
                    data-cy={`MediaCheckbox_${rule.name}`}
                    size="small"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const { checked } = e.target;
                      let defaultValue;

                      if (rule.name === "limit") {
                        defaultValue = "1";
                      }

                      if (rule.name === "group_id") {
                        defaultValue = groups[0].value;
                      }

                      if (rule.name === "fileExtensions") {
                        defaultValue = [];
                      }

                      if (rule.name === "fileExtensions") {
                        onDataChange({
                          inputName: rule.name,
                          value: checked ? defaultValue : null,
                        });
                      } else {
                        onDataChange({
                          inputName: rule.name,
                          value: checked ? defaultValue : "",
                        });
                      }
                    }}
                    checked={Boolean(fieldData[rule.name])}
                  />
                }
                label={
                  <Stack>
                    <Typography variant="body2" fontWeight={600}>
                      {MediaLabelsConfig[rule.name as MediaFieldName].label}
                    </Typography>
                    <Typography variant="body3" color="text.secondary">
                      {MediaLabelsConfig[rule.name as MediaFieldName].subLabel}
                    </Typography>
                  </Stack>
                }
              />

              {Boolean(
                fieldData[rule.name] && rule.name !== "fileExtensions"
              ) && (
                <Box ml={4} mt={2.5}>
                  <FieldFormInput
                    onDataChange={onDataChange}
                    fieldConfig={rule}
                    prefillData={fieldData[rule.name]}
                    dropdownOptions={groups || []}
                  />
                </Box>
              )}

              {Boolean(fieldData[rule.name]) && rule.name === "fileExtensions" && (
                <Box ml={3.5} mt={2.5}>
                  <InputLabel>Extensions *</InputLabel>
                  <Autocomplete
                    multiple
                    value={fieldData[rule.name] as string[]}
                    options={[]}
                    freeSolo
                    inputValue={inputValue}
                    disableClearable
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!!errors["fileExtensions"] && extensionsError}
                        sx={{
                          ".MuiOutlinedInput-root ": {
                            alignItems: "baseline",
                            minHeight: 80,
                          },
                        }}
                        onKeyDown={(event) => handleKeyDown(event, rule.name)}
                      />
                    )}
                    onInputChange={(event, newInputValue) =>
                      handleInputChange(event, newInputValue, rule.name)
                    }
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          label={option}
                          size="small"
                          color="default"
                          onDelete={() => handleDelete(option, rule.name)}
                          clickable={false}
                          sx={{
                            backgroundColor: "common.white",
                            borderColor: "grey.300",
                            borderWidth: 1,
                            borderStyle: "solid",
                          }}
                        />
                      ))
                    }
                  />
                  {errors["fileExtensions"] && extensionsError && (
                    <Typography sx={{ mt: 0.5 }} color="error" variant="body2">
                      {errors["fileExtensions"]}
                    </Typography>
                  )}
                  <Box display="flex" mt={0.5} gap={0.5} alignItems="center">
                    <Typography variant="body2">Add:</Typography>
                    {ExtensionPresets.map((preset) => (
                      <Chip
                        key={preset.label}
                        label={preset.label}
                        size="small"
                        onClick={() => {
                          const newTags = fieldData[rule.name] as string[];
                          const tags = new Set(newTags);
                          preset.value.forEach((tag) => tags.add(tag));
                          onDataChange({
                            inputName: rule.name,
                            value: Array.from(tags),
                          });
                        }}
                        sx={{
                          backgroundColor: "common.white",
                          borderColor: "grey.300",
                          borderWidth: 1,
                          borderStyle: "solid",
                        }}
                      />
                    ))}
                  </Box>
                  <InputLabel
                    sx={{
                      mt: 2.5,
                    }}
                  >
                    Custom Error Message *
                  </InputLabel>
                  <TextField
                    error={!!errors["fileExtensionsErrorMessage"]}
                    fullWidth
                    value={fieldData.fileExtensionsErrorMessage as string}
                    onChange={(e) => {
                      setAutoFill(false);
                      onDataChange({
                        inputName: "fileExtensionsErrorMessage",
                        value: e.target.value,
                      });
                    }}
                  />
                  {errors["fileExtensionsErrorMessage"] && (
                    <Typography color="error" variant="body2">
                      {errors["fileExtensionsErrorMessage"]}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
