import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeBinary } from "@zesty-io/core/FieldTypeBinary";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import { Button } from "@zesty-io/core/Button";

import { notify } from "shell/store/notifications";
import { updateSettings } from "store/settings";

const TooltipStyle = `
          .Tooltip:hover .tipText--1ga9d{
            display: block;
            position: absolute;
            background: #1b202c;
            color: #fff;
            font-family: Verdana, Arial, Monaco, Sans-Serif;
            padding: 15px 23px;
            width: 25rem;
            line-height: 20px;
            bottom: -95px !important;
            border-radius: 4px;
            left: -7px;
            z-index: 11;
            overflow-wrap: break-word;
            box-shadow: 0px 0px 15px rgba(10, 0, 0, 0.2);
          }
          .Tooltip:hover .tipText--1ga9d::before {
            width: 8px;
            height: 8px;
            position: absolute;
            background: #1b202c;
            bottom: 86px !important;
            left: 6px;
            z-index: 11;
            transform: rotate(45deg);
            content: " ";
            border-radius: 3px 0 0 0;
          }
        `;

import styles from "./SettingsStyles.less";
export default connect(state => {
  return {
    catInstance: state.settings.catInstance,
    instance: state.settings.instance
  };
})(function Instance(props) {
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState(props.instance);
  const [fieldValues, setFieldValues] = useState({});

  useEffect(() => {
    const category = props.match.params.category
      ? props.match.params.category
      : "general";

    const matchingFields = props.instance.filter(
      item => item.category === category
    );

    setFields(matchingFields);
    setFieldValues(
      matchingFields.reduce((acc, field) => {
        acc[field.ZUID] = field.value;
        return acc;
      }, {})
    );
    setTimeout(() => {
      const elements = document.getElementsByClassName("tip--2Be6h");
      const element = elements[0];
      const style = document.createElement("style");
      style.innerHTML = TooltipStyle;
      const ref = document.querySelector("script");
      ref.parentNode.insertBefore(style, ref);
      if (element) {
        element.classList.add("Tooltip");
      }
    }, 100);
  }, [props.instance.length, props.match]);

  function setValue(ZUID, value) {
    setFieldValues({ ...fieldValues, [ZUID]: value });
  }

  function saveFields() {
    setLoading(true);

    const requests = fields.map(field => {
      return props.dispatch(
        updateSettings(field.ZUID, {
          ...field,
          value: fieldValues[field.ZUID].toString()
        })
      );
    });

    Promise.all(requests)
      .then(responses => {
        setLoading(false);
        notify({
          kind: "success",
          message: "Data has been updated"
        });
      })
      .catch(err => {
        notify({
          kind: "warn",
          message: err.message
        });
      });
  }
  return (
    <>
      {fields.map(field => {
        switch (field.dataType) {
          case "checkbox":
            return (
              <FieldTypeBinary
                key={field.ZUID}
                name={field.ZUID}
                value={fieldValues[field.ZUID]}
                label={field.keyFriendly}
                tooltip={field.tips}
                onValue="On"
                offValue="Off"
                onChange={setValue}
              />
            );
          case "textarea":
            return (
              <FieldTypeTextarea
                key={field.ZUID}
                name={field.ZUID}
                value={fieldValues[field.ZUID]}
                label={field.keyFriendly}
                tooltip={field.tips}
                onChange={setValue}
              />
            );
          case "dropdown":
            return (
              <FieldTypeDropDown
                key={field.ZUID}
                name={field.ZUID}
                label={field.keyFriendly}
                description={field.description}
                options={[{ value: "", text: "Selected" }]}
                callback={setValue}
              />
            );
          default:
            return (
              <FieldTypeText
                key={field.ZUID}
                label={field.keyFriendly}
                name={field.ZUID}
                value={fieldValues[field.ZUID]}
                onChange={setValue}
                description={field.tips}
                maxLength={640}
              />
            );
        }
      })}
      <Button kind="save" onClick={saveFields} disabled={loading}>
        {loading ? (
          <i className="fas fa-spinner"></i>
        ) : (
          <i className="fas fa-save"></i>
        )}
        Save Settings
      </Button>
    </>
  );
});
