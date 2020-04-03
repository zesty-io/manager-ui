import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { Button } from "@zesty-io/core/Button";

import { updateField } from "shell/store/fields";
import { formatName } from "utility/formatName";

import styles from "./DropdownOptions.less";
export function DropdownOptions(props) {
  const initialState = props.field.settings.options
    ? // convert api shape into expected component state
      Object.keys(props.field.settings.options).reduce((acc, key) => {
        acc.push({
          key,
          value: props.field.settings.options[key]
        });
        return acc;
      }, [])
    : [
        {
          key: "option_1",
          value: "Option One"
        }
      ];

  const [options, setOptions] = useState(initialState);

  const updateOption = (option, i, name, val) => {
    // Update internal state
    let newOptions = [...options];
    newOptions.splice(i, 1, {
      key: formatName(val),
      value: name === "key" ? option.value : val
    });
    setOptions(newOptions);

    // Notify store of new options
    props.updateFieldSetting(
      "options",
      // convert to expected api shape
      newOptions.reduce((acc, option) => {
        acc[option.key] = option.value;
        return acc;
      }, {})
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
            onChange={(name, val) => {
              updateOption(option, i, name, val);
            }}
          />

          <FieldTypeText
            label="Option Value"
            name="key"
            value={option.key}
            onChange={(name, val) => {
              updateOption(option, i, name, val);
            }}
          />
          <Button
            kind="warn"
            onClick={() => {
              const newOptions = [...options];
              newOptions.splice(i, 1);
              setOptions(newOptions);
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </div>
      ))}

      <Button
        kind="save"
        onClick={() => {
          setOptions([...options, { key: "", value: "" }]);
        }}
      >
        <FontAwesomeIcon icon={faPlus} />
        Add Option
      </Button>
    </div>
  );
}
