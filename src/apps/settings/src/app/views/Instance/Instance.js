import { useEffect, useState } from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faSpinner } from "@fortawesome/free-solid-svg-icons";

import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldLabel } from "@zesty-io/core/FieldLabel";
import { FieldTypeBinary } from "@zesty-io/core/FieldTypeBinary";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import { Select, Option } from "@zesty-io/core/Select";
import { Button } from "@zesty-io/core/Button";
import { notify } from "shell/store/notifications";
import { Notice } from "@zesty-io/core/Notice";

import { updateSettings } from "../../../store/settings";

import styles from "./SettingsStyles.less";

export default connect((state) => {
  return {
    catInstance: state.settings.catInstance,
    instance: state.settings.instance,
  };
})(function Settings(props) {
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [dirtyFields, setDirtyFields] = useState([]);

  // Set Fields and Field Values from store/URL
  useEffect(() => {
    const category = props.match.params.category
      ? props.match.params.category
      : "general";

    const matchingFields = props.instance.filter(
      (item) => item.category === category
    );

    setFields(matchingFields);
    setFieldValues(
      matchingFields.reduce((acc, field) => {
        acc[field.key] = field.value;
        return acc;
      }, {})
    );
  }, [props.instance.length, props.match]);

  function setValue(value, name) {
    setFieldValues({ ...fieldValues, [name]: value });

    if (dirtyFields.includes(name)) return;
    setDirtyFields([...dirtyFields, name]);
  }

  function saveFields() {
    setSaving(true);

    const requests = fields
      .filter((field) => {
        if (dirtyFields.some((item) => field.key === item)) {
          return field;
        }
      })
      .map((field) => {
        const value =
          fieldValues[field.key] === null
            ? null
            : fieldValues[field.key].toString();
        return props.dispatch(
          updateSettings(field.ZUID, {
            ...field,
            value,
          })
        );
      });

    Promise.all(requests)
      .then((responses) => {
        setSaving(false);
        setDirtyFields([]);
        props.dispatch(
          notify({
            kind: "success",
            message: "Settings Saved",
          })
        );
      })
      .catch((err) => {
        setSaving(false);
        props.dispatch(
          notify({
            kind: "warn",
            message: err.message,
          })
        );
      });
  }
  return (
    <>
      {fields.map((field) => {
        switch (field.dataType) {
          case "checkbox":
            if (field.key === "site_protocol") {
              return (
                <div key={field.ZUID}>
                  <FieldLabel label={field.keyFriendly} />
                  <div className={styles.selectProtocol}>
                    <Select
                      name={field.key}
                      onSelect={setValue}
                      value={fieldValues[field.key]}
                    >
                      <Option value="Select" text="Select" />
                      {field.options.split(",").map((option, index) => (
                        <Option
                          key={index}
                          value={option}
                          text={option}
                          selected={fieldValues[field.key] === option}
                        />
                      ))}
                    </Select>
                  </div>
                </div>
              );
            } else if (field.key === "preferred_domain_prefix") {
              return (
                <>
                  <Notice>
                    <p>
                      {" "}
                      Activating the <strong>WWW</strong> setting may have
                      unintended consequences if the fully qualified domain of
                      www.sub-domain.example.org does not have proper DNS and
                      SSL setup.
                    </p>
                  </Notice>
                  <FieldTypeBinary
                    key={field.ZUID}
                    name={field.key}
                    value={fieldValues[field.key]}
                    label={field.keyFriendly}
                    tooltip={field.tips}
                    onValue="On"
                    offValue="Off"
                    onChange={setValue}
                  />
                </>
              );
            } else {
              return (
                <FieldTypeBinary
                  key={field.ZUID}
                  name={field.key}
                  value={fieldValues[field.key]}
                  label={field.keyFriendly}
                  tooltip={field.tips}
                  onValue="On"
                  offValue="Off"
                  onChange={setValue}
                />
              );
            }
          case "textarea":
            return (
              <FieldTypeTextarea
                key={field.ZUID}
                name={field.key}
                value={fieldValues[field.key]}
                label={field.keyFriendly}
                tooltip={field.tips}
                onChange={setValue}
              />
            );
          case "dropdown":
            return (
              <div key={field.ZUID}>
                <FieldLabel label={field.keyFriendly} />
                <div className={styles.selectProtocol}>
                  <Select
                    name={field.key}
                    onSelect={setValue}
                    value={fieldValues[field.key]}
                  >
                    {field.options.split(";").map((option, index) => {
                      let val = option.split(":");
                      return (
                        <Option
                          key={index}
                          value={val[0]}
                          text={val[1]}
                          selected={fieldValues[field.key] === val[0]}
                        />
                      );
                    })}
                  </Select>
                </div>
              </div>
            );
          default:
            return (
              <FieldTypeText
                key={field.ZUID}
                label={field.keyFriendly}
                name={field.key}
                value={fieldValues[field.key]}
                onChange={setValue}
                description={field.tips}
                maxLength={640}
              />
            );
        }
      })}
      <Button
        className={styles.ButtonSave}
        id="saveSettings"
        kind="save"
        onClick={saveFields}
        disabled={saving || dirtyFields.length === 0}
      >
        {saving ? (
          <FontAwesomeIcon spin icon={faSpinner} />
        ) : (
          <FontAwesomeIcon icon={faSave} />
        )}
        Save Settings
      </Button>
    </>
  );
});
