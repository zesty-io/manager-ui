import {
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  Stack,
} from "@mui/material";
import { FormValue } from "./views/FieldForm";
import { CustomGroup } from "../hooks/useMediaRules";

import { InputField } from "./FieldFormInput";
import { FieldFormInput, FieldNames } from "./FieldFormInput";

type MediaFieldName = Extract<FieldNames, "limit" | "group_id">;
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
};

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
}
export const MediaRules = ({
  fieldConfig,
  onDataChange,
  groups,
  fieldData,
}: Props) => {
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
          if (rule.name === "defaultValue") return;
          return (
            <Box key={key}>
              <FormControlLabel
                sx={{
                  alignItems: "flex-start",
                }}
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

                      onDataChange({
                        inputName: rule.name,
                        value: checked ? defaultValue : "",
                      });
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

              {Boolean(fieldData[rule.name]) && (
                <Box ml={4} mt={2.5}>
                  <FieldFormInput
                    onDataChange={onDataChange}
                    fieldConfig={rule}
                    prefillData={fieldData[rule.name]}
                    dropdownOptions={groups || []}
                  />
                </Box>
              )}
            </Box>
          );
        })}
        <Box></Box>
      </Box>
    </Box>
  );
};
