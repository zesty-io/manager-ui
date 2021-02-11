import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeColor } from "@zesty-io/core/FieldTypeColor";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";
import { FieldTypeImage } from "@zesty-io/core/FieldTypeImage";
import { Select, Option } from "@zesty-io/core/Select";
import { Button } from "@zesty-io/core/Button";
import { Modal } from "@zesty-io/core/Modal";

import MediaApp from "../../../../../media-2/src/app/MediaApp";
import { notify } from "shell/store/notifications";
import { fetchStylesVariables, saveVariables } from "../../../store/settings";

import styles from "./Styles.less";
import MediaStyles from "../../../../../media-2/src/app/MediaAppModal.less";

export default connect(state => {
  return {
    styles: state.settings.styles,
    fontsInstalled: state.settings.fontsInstalled
  };
})(function Styles(props) {
  const [fields, setFields] = useState([]);
  const [state, setState] = useState({});
  const [dirtyFields, setDirtyFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fonts, setFonts] = useState([]);
  const [imageModal, setImageModal] = useState();

  useEffect(() => {
    const category = props.match.params.category
      ? props.match.params.category
      : 4;

    const arr = props.styles.filter(item => item.category == category);
    let newState = {};
    arr.forEach(field => {
      if (field.type === "font_picker") {
        newState[field.referenceName] = parseFamily(field.value);
      } else {
        newState[field.referenceName] = field.value;
      }
    });
    setFields(arr);
    setState(newState);
    fontsOptions(props.fontsInstalled);
  }, [props.styles, props.fontsInstalled, props.match]);

  function fontsOptions(arr) {
    arr.forEach(headTag => {
      const style = document.createElement("style");
      const att = document.createAttribute("id");
      att.value = "googlefont";
      style.setAttributeNode(att);
      const css = `@import url('${headTag.attributes.href}');`;
      style.append(css);
      document.head.appendChild(style);
    });
    setFonts(
      arr.map(headTag => {
        const url = headTag.attributes.href;
        const fontVariants = url.split("=")[1];
        const font = fontVariants.split(":")[0];
        const variants = fontVariants.split(":")[1].split(",");
        for (let i = 0; i < variants.length; i++) {
          return {
            label: font.replace("+", " "),
            family: font.replace("+", " "),
            weight: variants[i]
          };
        }
      })
    );
  }

  function setValue(type, value) {
    setState({ ...state, [type]: value });

    if (dirtyFields.includes(type)) return;
    setDirtyFields([...dirtyFields, type]);
  }

  function sendData() {
    setLoading(true);

    const requests = fields
      .filter(field => {
        if (dirtyFields.some(item => field.referenceName === item)) {
          return field;
        }
      })
      .map(field => {
        return saveVariables(field.ZUID, {
          category: field.category,
          name: field.name,
          referenceName: field.referenceName,
          value: state[field.referenceName],
          options: field.options,
          tips: field.tips,
          type: field.type
        });
      });

    Promise.all(requests)
      .then(responses => {
        return props.dispatch(fetchStylesVariables());
      })
      .then(() => {
        setLoading(false);
        props.dispatch(
          notify({
            kind: "success",
            message: "Data has been updated"
          })
        );
      })
      .catch(err => {
        setLoading(false);
        props.dispatch(
          notify({
            kind: "warn",
            message: err.message
          })
        );
      });
  }

  function parseFamily(font) {
    if (font) {
      if (font.split(":").length < 2) {
        return font;
      } else {
        return font.split(":")[0];
      }
    }
  }

  function parseWeight(font) {
    if (font) {
      if (font.split(":").length < 2) {
        return font;
      } else {
        return font.split(":")[1];
      }
    }
  }

  function parseStyle(font) {
    if (font) {
      if (font.split(":").length < 2) {
        return "";
      } else {
        if (
          font
            .split(":")[1]
            .split()
            .includes("i")
        ) {
          return "italic";
        }
        return "";
      }
    }
  }

  function renderField(field) {
    switch (field.type) {
      case "color":
        return (
          <FieldTypeColor
            key={field.ZUID}
            value={state[field.referenceName]}
            description={field.description}
            name={field.referenceName}
            onChange={(value, name) => setValue(name, value)}
            label={field.name}
          />
        );
      case "dropdown":
        return (
          <FieldTypeDropDown
            key={field.ZUID}
            name={field.referenceName}
            label={field.name}
            value={state[field.referenceName]}
            onChange={(value, name) => setValue(name, value)}
            description={field.description}
            options={Object.keys(field.options).map(option => ({
              value: option,
              text: field.options[option]
            }))}
          />
        );
      case "font_picker":
        return (
          <div key={field.ZUID}>
            <span style={{ fontSize: "1.5rem" }}>{field.keyFriendly}</span>
            <div className={styles.fontPicker}>
              <Select
                name={field.referenceName}
                onSelect={(value, name) => setValue(name, value)}
                className={[styles.selectFont]}
                // if default value is a font-family stack with ',' then show "Select"
                value={
                  field.value !== null && field.value.includes(",")
                    ? "inherit"
                    : field.value
                }
              >
                <Option value="inherit" text="Select" />
                {fonts.map((option, index) => (
                  <Option
                    key={index}
                    value={`${option.family}:${option.weight}`}
                    text={option.family}
                  />
                ))}
              </Select>
              <div className={styles.Preview}>
                <span
                  style={{
                    fontSize: "1.4rem",
                    fontFamily: parseFamily(state[field.referenceName]),
                    fontStyle: parseStyle(state[field.referenceName]),
                    fontWeight: parseWeight(state[field.referenceName])
                  }}
                >
                  This is a text example
                </span>
              </div>
            </div>
          </div>
        );
      case "image":
        const images = (state[field.referenceName] || "")
          .split(",")
          .filter(el => el);
        return (
          <>
            <FieldTypeImage
              key={field.ZUID}
              name={field.referenceName}
              label={field.name}
              description={field.description}
              limit="1"
              images={
                state[field.referenceName] ? [state[field.referenceName]] : []
              }
              onChange={(value, name) => setValue(name, value)}
              resolveImage={(zuid, width, height) =>
                `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${zuid}/getimage/?w=${width}&h=${height}&type=fit`
              }
              mediaBrowser={opts => {
                setImageModal(opts);
              }}
            />
            {imageModal && (
              <Modal
                open={true}
                type="global"
                onClose={() => setImageModal()}
                className={MediaStyles.MediaAppModal}
              >
                <MediaApp
                  limitSelected={imageModal.limit - images.length}
                  modal={true}
                  addImages={images => {
                    imageModal.callback(images);
                    setImageModal();
                  }}
                />
              </Modal>
            )}
          </>
        );
      default:
        return (
          <FieldTypeText
            key={field.ZUID}
            label={field.name}
            name={field.referenceName}
            value={state[field.referenceName]}
            onChange={(value, name) => setValue(name, value)}
            description={field.tips}
            maxLength={640}
          />
        );
    }
  }

  return (
    <>
      {fields.map(field => (
        <div key={field.ZUID} className={styles.variableContainer}>
          <div className={styles.variable}>{renderField(field)}</div>
          <div className={styles.reference}>@{field.referenceName}</div>
        </div>
      ))}
      <Button
        id="SaveSettings"
        kind="save"
        className={styles.SaveBtn}
        onClick={sendData}
        disabled={loading}
      >
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
