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
import TagIcon from "@mui/icons-material/Tag";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckIcon from "@mui/icons-material/Check";

export const FieldTypeUUID = React.memo(function FieldTypeUUID(props) {
  const [isCopied, setIsCopied] = React.useState(false);
  useEffect(() => {
    // NOTE may want to add a check to ensure the itemZUID is 'new'
    if (props.name && !props.value) {
      // there is no UUID and it needs to be generated
      props.onChange(uuidv4(), props.name, props.datatype);
    }
  }, []);

  // Set isCopied to false after 5 seconds
  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 5000);
      // Clear timeout if the component is unmounted
      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  return (
    <label className={cx(styles.FieldTypeUUID, props.className)}>
      <div>
        <Tooltip
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -47],
                  },
                },
              ],
            },
          }}
          placement="top"
          title="This field cannot be edited"
        >
          <TextField
            required={props.required}
            value={props.value || ""}
            readOnly={true}
            fullWidth
            type="text"
            sx={{
              caretColor: "transparent", // This is to hide the cursor in the input field
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ marginRight: 0 }}>
                  <TagIcon fontSize="small" />
                </InputAdornment>
              ),

              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      const input = document.createElement("input");
                      document.body.appendChild(input);
                      input.value = props.value;
                      input.focus();
                      input.select();
                      const result = document.execCommand("copy");
                      input.remove();
                      if (result === "unsuccessful") {
                        return props.dispatch(
                          notify({
                            type: "error",
                            message:
                              "Failed to copy the team ID to your clipboard",
                          })
                        );
                      }
                      setIsCopied(true);
                    }}
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
      </div>
    </label>
  );
});
