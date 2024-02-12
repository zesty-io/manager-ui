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

export const FieldTypeUUID = React.memo(function FieldTypeUUID(props) {
  useEffect(() => {
    // NOTE may want to add a check to ensure the itemZUID is 'new'
    if (props.name && !props.value) {
      // there is no UUID and it needs to be generated
      props.onChange(uuidv4(), props.name, props.datatype);
    }
  }, []);

  return (
    <label className={cx(styles.FieldTypeUUID, props.className)}>
      <div>
        <Tooltip
          slotProps={{
            popper: {
              /**
               * This is a custom style that is being applied to the tooltip
               to adjust it's position not supported by Tooltip default props
               */
              sx: {
                [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]:
                  {
                    position: "relative",
                    top: "47px",
                  },
              },
            },
          }}
          placement="top"
          title="This field cannot be edited"
        >
          <TextField
            disabled
            required={props.required}
            defaultValue={props.value || ""}
            readOnly={true}
            fullWidth
            type="text"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
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
                    }}
                  >
                    <ContentCopyRoundedIcon fontSize="small" />
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
