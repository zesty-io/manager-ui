import { useState } from "react";

import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { formatName } from "utility/formatName";
import { updateField } from "shell/store/fields";

import styles from "./DropdownOptions.less";
export function DropdownOptions(props) {
  const initialState = props.field.settings.options
    ? // convert api shape into expected component state
      Object.keys(props.field.settings.options).reduce((acc, key) => {
        acc.push({
          key,
          value: props.field.settings.options[key],
        });
        return acc;
      }, [])
    : [
        {
          key: "option_1",
          value: "Option One",
        },
      ];

  const [options, setOptions] = useState(initialState);

  const updateOption = (option, i, name, val) => {
    // Update internal state
    let newOptions = [...options];
    newOptions.splice(i, 1, {
      key: formatName(val),
      value: name === "key" ? option.value : val,
    });
    setOptions(newOptions);

    // Notify store of new options
    props.updateFieldSetting(
      // convert to expected api shape
      newOptions.reduce((acc, option) => {
        acc[option.key] = option.value;
        return acc;
      }, {}),
      "options"
    );
  };

  const deleteOption = (optionIndex) => {
    // Update internal state
    const newOptions = [...options];
    newOptions.splice(optionIndex, 1);
    setOptions(newOptions);

    // Notify store of new options
    props.updateFieldSetting(
      // convert to expected api shape
      newOptions.reduce((acc, option) => {
        acc[option.key] = option.value;
        return acc;
      }, {}),
      "options"
    );
  };

  return (
    <div className={styles.FieldSettings}>
      {options.map((option, i) => (
        <div className={styles.Option} key={i}>
          <FieldTypeText
            label="Option Label"
            name="value"
            value={option.value}
            onChange={(val, name) => {
              updateOption(option, i, name, val);
            }}
          />

          <FieldTypeText
            label="Option Value"
            name="key"
            value={option.key}
            onChange={(val, name) => {
              updateOption(option, i, name, val);
            }}
          />
          <Button
            variant="contained"
            onClick={() => {
              deleteOption(i);
            }}
          >
            <DeleteIcon fontSize="small" />
          </Button>
        </div>
      ))}

      <Button
        variant="contained"
        color="success"
        onClick={() => {
          setOptions([...options, { key: "", value: "" }]);
        }}
        startIcon={<AddIcon />}
      >
        Add Option
      </Button>
    </div>
  );
}
