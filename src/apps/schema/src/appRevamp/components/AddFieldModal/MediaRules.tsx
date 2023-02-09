import {
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  TextField,
  FormLabel,
  Autocomplete,
  Tooltip,
} from "@mui/material";
import { useSelector } from "react-redux";
import { Dispatch, useEffect, useState } from "react";
import { FormValue } from "./views/FieldForm";
import { ItemLimit, LockFolder, CustomGroup } from "./hooks/useMediaRules";

import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { faRuler } from "@fortawesome/free-solid-svg-icons";
import { InputField } from "./FieldFormInput";

interface Props {
  fieldConfig: InputField[];
  itemLimit: ItemLimit;
  lockFolder: LockFolder;
  setItemLimit: Dispatch<any>;
  setLockFolder: Dispatch<any>;
  groups: CustomGroup[];
  onDataChange: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: FormValue;
  }) => void;
}

interface HandleCheckbox {
  rule: InputField;
  checked: Boolean;
}

export const MediaRules = ({
  fieldConfig,
  onDataChange,
  itemLimit,
  lockFolder,
  setItemLimit,
  setLockFolder,
  groups,
}: Props) => {
  const handleUpdateCheckbox = ({ rule, checked }: HandleCheckbox) => {
    if (!checked) {
      onDataChange({
        inputName: rule.name,
        value: "",
      });
      if (rule.name === "limit") {
        setItemLimit((prevData: ItemLimit) => ({
          ...prevData,
          isChecked: Boolean(checked),
        }));
      } else if (rule.name === "group_id") {
        setLockFolder((prevData: LockFolder) => ({
          ...prevData,
          isChecked: Boolean(checked),
        }));
      }
    } else {
      if (rule.name === "limit") {
        onDataChange({
          inputName: rule.name,
          value: itemLimit.value,
        });
        setItemLimit((prevData: ItemLimit) => ({
          ...prevData,
          isChecked: Boolean(checked),
        }));
      } else if (rule.name === "group_id") {
        setLockFolder((prevData: LockFolder) => ({
          ...prevData,
          option: groups[0],
          isChecked: Boolean(checked),
        }));
        onDataChange({
          inputName: rule.name,
          value: groups[0].value,
        });
      }
    }
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        gap="20px"
      >
        {fieldConfig.map((rule: InputField, key: number) => (
          <>
            <FormControlLabel
              sx={{
                alignItems: "flex-start",
              }}
              control={
                <Checkbox
                  sx={{
                    color: "grey.200",
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleUpdateCheckbox({ rule, checked: e.target.checked })
                  }
                  checked={
                    rule.name === "limit"
                      ? Boolean(itemLimit.isChecked)
                      : rule.name === "group_id" &&
                        Boolean(lockFolder.isChecked)
                  }
                />
              }
              label={
                <Box>
                  <Typography variant="body2">{rule.label}</Typography>
                  <Typography
                    // @ts-expect-error body3 module augmentation required
                    variant="body3"
                    color="text.secondary"
                  >
                    {rule.subLabel}
                  </Typography>
                </Box>
              }
            />

            {/* FIELDS */}
            <Box sx={{ ml: 4 }}>
              {rule.name === "limit" && itemLimit.isChecked ? (
                <>
                  <Typography variant="body2">
                    {itemLimit.title}
                    <Tooltip
                      placement="top"
                      title="Set the maximum number of files a user can upload"
                    >
                      <InfoRoundedIcon
                        sx={{ ml: 1, width: "10px", height: "10px" }}
                        color="action"
                      />
                    </Tooltip>
                  </Typography>
                  <TextField
                    size="small"
                    variant="outlined"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={itemLimit.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setItemLimit((prevData: ItemLimit) => ({
                        ...prevData,
                        value: e.target.value,
                      }));
                      onDataChange({
                        inputName: rule.name,
                        value: e.target.value,
                      });
                    }}
                    sx={{
                      mt: 1,
                    }}
                  />
                </>
              ) : (
                rule.name === "group_id" &&
                lockFolder.isChecked && (
                  <>
                    <Typography variant="body2">{lockFolder.title}</Typography>
                    <Autocomplete
                      value={lockFolder.option}
                      options={groups}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                      }
                      onChange={(_, option) => {
                        setLockFolder((prevData: LockFolder) => ({
                          ...prevData,
                          option,
                        }));
                        onDataChange({
                          inputName: rule.name,
                          value: option?.value || "",
                        });
                      }}
                      renderOption={(props: any, option: any) => {
                        return (
                          <Box {...props} key={option.value}>
                            {option.label}
                          </Box>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField {...params} hiddenLabel />
                      )}
                    />
                  </>
                )
              )}
            </Box>
          </>
        ))}
      </Box>
    </Box>
  );
};
