import {
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  TextField,
  FormLabel,
  Tooltip,
} from "@mui/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { useState } from "react";

export const MediaRules = () => {
  const [rulesFields, setRulesFields] = useState([
    {
      name: "required",
      type: "checkbox",
      label: "Allow multiple files to be selected",
      subLabel:
        "Ensures multiple files can be uploaded instead of default of just 1 file",
      required: false,
      inputLabel: "Media Item Limit",
      gridSize: 12,
    },
    {
      name: "required",
      type: "checkbox",
      label: "Lock to a folder",
      subLabel: "Ensures files can only be selected from a specific folder",
      required: false,
      inputLabel: "Select Folder",
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
        {rulesFields.map((rule: any) => (
          <FormControlLabel
            sx={{
              alignItems: "flex-start",
            }}
            control={
              <Checkbox
                sx={{
                  color: "grey.200",
                }}
                checked={true}
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

                {rule.inputLabel === "Media Item Limit" ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Media Item Limit
                      <Tooltip placement="top" title="">
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
                      value={"1"}
                      sx={{
                        mt: 1,
                      }}
                    />
                  </Box>
                ) : (
                  rule.inputLabel === "Select Folder" && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Select Folder
                        <Tooltip placement="top" title="">
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
                        value={"1"}
                        sx={{
                          mt: 1,
                        }}
                      />
                    </Box>
                  )
                )}
              </Box>
            }
          />
        ))}
      </Box>
    </Box>
  );
};
