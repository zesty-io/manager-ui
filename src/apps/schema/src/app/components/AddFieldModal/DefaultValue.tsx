import {
  Box,
  FormControl,
  FormHelperText,
  Checkbox,
  Typography,
  FormControlLabel,
} from "@mui/material";
import { FormValue } from "./views/FieldForm";
import { MaxLengths } from "../../../../../content-editor/src/app/components/Editor/Editor";
import { FieldSettingsOptions } from "../../../../../../shell/services/types";
import { DefaultValueInput } from "./DefaultValueInput";

type DefaultValueProps = {
  type: string;
  value: FormValue;
  onChange: (value: FormValue) => void;
  isDefaultValueEnabled: boolean;
  setIsDefaultValueEnabled: (value: boolean) => void;
  error: string;
  mediaRules: {
    limit: FormValue;
    group_id: FormValue;
  };
  relationshipFields: {
    relatedModelZUID: string;
    relatedFieldZUID: string;
  };
  options: FieldSettingsOptions[];
};

export const DefaultValue = ({
  error,
  type,
  value,
  onChange,
  isDefaultValueEnabled,
  setIsDefaultValueEnabled,
  mediaRules,
  relationshipFields,
  options,
}: DefaultValueProps) => {
  return (
    <Box>
      <FormControlLabel
        sx={{
          alignItems: "flex-start",
        }}
        control={
          <Checkbox
            data-cy="DefaultValueCheckbox"
            checked={isDefaultValueEnabled}
            size="small"
            onChange={(event) => {
              setIsDefaultValueEnabled(event.target.checked);
              if (!event.target.checked) {
                onChange(null);
                setIsDefaultValueEnabled(false);
              }
            }}
          />
        }
        label={
          <Box>
            <Typography variant="body2" fontWeight="600">
              Default Value
            </Typography>
            <Typography
              variant="body3"
              color="text.secondary"
              fontWeight="600"
              sx={{ mb: 1, display: "block" }}
            >
              Set a predefined value for this field
            </Typography>
          </Box>
        }
      />
      <Box flex={1}>
        {isDefaultValueEnabled && (
          <FormControl error={!!error} fullWidth>
            <DefaultValueInput
              type={type}
              value={value}
              onChange={onChange}
              error={!!error}
              mediaRules={mediaRules}
              relationshipFields={relationshipFields}
              options={options}
            />
            <FormHelperText>
              <Box display="flex" justifyContent="space-between">
                <Box>{error}</Box>
                {MaxLengths[type as keyof typeof MaxLengths] !== undefined && (
                  <Box>
                    {typeof value === "string" ? value.length : 0}
                    {MaxLengths[type as keyof typeof MaxLengths] !== 0
                      ? `/${MaxLengths[type as keyof typeof MaxLengths]}`
                      : null}
                  </Box>
                )}
              </Box>
            </FormHelperText>
          </FormControl>
        )}
      </Box>
    </Box>
  );
};
