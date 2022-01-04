import { useEffect, useState } from "react";

import { FieldTypeText } from "@zesty-io/core/FieldTypeText";

import styles from "./ToggleOptions.less";
export function ToggleOptions(props) {
  let initialState = [
    {
      key: 0,
      value: "No",
    },
    {
      key: 1,
      value: "Yes",
    },
  ];

  if (props.field.settings && props.field.settings.options) {
    if (Object.keys(props.field.settings.options).length) {
      // convert api shape into expected component state
      initialState = Object.keys(props.field.settings.options).reduce(
        (acc, key) => {
          acc.push({
            key,
            value: props.field.settings.options[key],
          });
          return acc;
        },
        []
      );
    }
  }

  const [options, setOptions] = useState(initialState);

  const updateOption = (i, name, val) => {
    // Update internal state
    let newOptions = [...options];
    newOptions[i] = {
      ...newOptions[i],
      [name]: val, // override with new value
    };
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

  useEffect(() => {
    if (!props.field.settings.options) {
      // New fields need to have their initial option state
      // saved to the app store
      props.updateFieldSetting(
        // convert to expected api shape
        options.reduce((acc, option) => {
          acc[option.key] = option.value;
          return acc;
        }, {}),
        "options"
      );
    }
  }, [props.field.settings]);

  return (
    <div className={styles.FieldSettings}>
      {options.map((opt, i) => (
        <div className={styles.Option} key={i}>
          <FieldTypeText
            label="Toggle Label"
            name="value"
            value={opt.value}
            onChange={(val, name) => {
              updateOption(i, name, val);
            }}
          />

          <FieldTypeText
            label="Toggle Value"
            name="key"
            value={opt.key}
            disabled={true}
            // onChange={(val, name) => {
            //   updateOption(i, name, val);
            // }}
          />
        </div>
      ))}
    </div>
  );
}
