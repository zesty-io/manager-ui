import React, { useEffect } from "react";
import cx from "classnames";
import { v4 as uuidv4 } from "uuid";
import {
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
  tooltipClasses,
} from "@mui/material";
import styles from "./FieldTypeUUID.less";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckIcon from "@mui/icons-material/Check";
import TagRoundedIcon from "@mui/icons-material/TagRounded";

export const FieldTypeUUID = React.memo(function FieldTypeUUID(props) {
  const [isCopied, setIsCopied] = React.useState(false);
  useEffect(() => {
    // NOTE may want to add a check to ensure the itemZUID is 'new'
    if (props.name && !props.value) {
      // there is no UUID and it needs to be generated
      props.onChange(uuidv4(), props.name, props.datatype);
    }
  }, []);

  const handleCopyClick = (value) => {
    navigator.clipboard
      ?.writeText(value)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 5000);
      })
      .catch((err) => {
        // Handle errors
        console.error(err);
      });
  };
  return (
    <Tooltip followCursor title="This field cannot be edited">
      <TextField
        required={props.required}
        value={props.value || ""}
        fullWidth
        type="text"
        /**
         * Readonly Props override the default color for the inputs
         * This reset the color to the default text color
         */
        sx={{
          ".MuiInputBase-readOnly": {
            color: "text.primary",
          },
        }}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <TagRoundedIcon fontSize="small" />
            </InputAdornment>
          ),

          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => handleCopyClick(props.value)}
              >
                {isCopied ? (
                  <CheckIcon fontSize="small" />
                ) : (
                  <ContentCopyRoundedIcon fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Tooltip>
  );
});
