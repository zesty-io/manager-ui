import {
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  TextField,
  FormLabel,
  Tooltip,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { FormValue } from "./views/FieldForm";

import { VirtualizedAutocomplete } from "@zesty-io/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { faRuler } from "@fortawesome/free-solid-svg-icons";

interface Props {
  fieldConfig: any;
  itemLimit: any;
  lockFolder: any;
  setItemLimit: any;
  setLockFolder: any;
  groups: any;
  onDataChange: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: FormValue;
  }) => void;
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
  const handleUpdateCheckbox = ({ rule, checked }: any) => {
    if (!checked) {
      onDataChange({
        inputName: rule.name,
        value: "",
      });
      if (rule.name === "limit") {
        setItemLimit((prevData: any) => ({
          ...prevData,
          isChecked: Boolean(checked),
        }));
      } else if (rule.name === "group_id") {
        setLockFolder((prevData: any) => ({
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
        setItemLimit((prevData: any) => ({
          ...prevData,
          isChecked: Boolean(checked),
        }));
      } else if (rule.name === "group_id") {
        onDataChange({
          inputName: rule.name,
          value: lockFolder.value.value,
        });
        setLockFolder((prevData: any) => ({
          ...prevData,
          isChecked: Boolean(checked),
        }));
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
        {fieldConfig.map((rule: any, key: number) => (
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
                    {itemLimit.label}
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
                    value={itemLimit.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setItemLimit((prevData: any) => ({
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
                    <Typography variant="body2">{lockFolder.label}</Typography>
                    <VirtualizedAutocomplete
                      value={lockFolder.value}
                      onChange={(_, option) => {
                        setLockFolder((prevData: any) => ({
                          ...prevData,
                          value: option,
                        }));
                        onDataChange({
                          inputName: rule.name,
                          value: option.value,
                        });
                      }}
                      placeholder="Select media folder..."
                      options={groups}
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
