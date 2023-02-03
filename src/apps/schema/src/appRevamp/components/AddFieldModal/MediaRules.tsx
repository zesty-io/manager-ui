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
import { mediaManagerApi } from "../../../../../../shell/services/mediaManager";

interface Props {
  fieldConfig: any;
  onDataChange: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: FormValue;
  }) => void;
}

export const MediaRules = ({ fieldConfig, onDataChange }: Props) => {
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const instanceId = useSelector((state: any) => state.instance.ID);
  const { data: bins, isFetching: isBinsFetching } =
    mediaManagerApi.useGetBinsQuery({
      instanceId,
      ecoId,
    });
  const [groups, setGroups] = useState([]);

  const { data: binGroups, isFetching: isBinGroupsFetching } =
    mediaManagerApi.useGetAllBinGroupsQuery(
      bins?.map((bin) => bin.id),
      {
        skip: !bins?.length,
      }
    );

  useEffect(() => {
    setGroups(
      binGroups[0].map((group: any) => {
        return {
          value: group?.id,
          inputLabel: group?.name,
          component: group?.name,
        };
      })
    );
  }, [binGroups]);

  const [rulesFields, setRulesFields] = useState([
    {
      name: "limit",
      inputValue: "1",
      isChecked: false,
      type: "checkbox",
      label: "Allow multiple files to be selected",
      inputLabel: "Media Item Limit",
      subLabel:
        "Ensures multiple files can be uploaded instead of default of just 1 file",
      required: false,
      gridSize: 12,
    },
    {
      name: "group_id",
      inputValue: "",
      type: "checkbox",
      isChecked: false,
      label: "Lock to a folder",
      inputLabel: "Select Folder",
      subLabel: "Ensures files can only be selected from a specific folder",
      required: false,
      gridSize: 12,
    },
  ]);

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        gap="20px"
      >
        {rulesFields.map((rule: any, key: number) => (
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    let updatedRulesField = [...rulesFields];
                    updatedRulesField[key].isChecked = e.target.checked;
                    setRulesFields(updatedRulesField);
                  }}
                  checked={Boolean(rule.isChecked)}
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
              {rule.inputLabel === "Media Item Limit" && rule.isChecked ? (
                <>
                  <Typography variant="body2">
                    Media Item Limit
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
                    value={rule.inputValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                rule.inputLabel === "Select Folder" &&
                rule.isChecked && (
                  <>
                    <Typography variant="body2">Select Folder</Typography>
                    <VirtualizedAutocomplete
                      value={groups[0]}
                      onChange={(_, option) => {
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
