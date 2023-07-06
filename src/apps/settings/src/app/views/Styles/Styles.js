import { useEffect, useState } from "react";
import { connect } from "react-redux";
import SaveIcon from "@mui/icons-material/Save";

import { FieldTypeColor, FieldTypeText } from "@zesty-io/material";
import { FieldTypeImage } from "@zesty-io/core/FieldTypeImage";
import {
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  FormHelperText,
  Dialog,
  IconButton,
} from "@mui/material";

import { MediaApp } from "../../../../../media/src/app";
import { notify } from "shell/store/notifications";
import { saveStyleVariable } from "shell/store/settings";
import CloseIcon from "@mui/icons-material/Close";

import styles from "./Styles.less";
import { useMetaKey } from "../../../../../../shell/hooks/useMetaKey";
import { MemoryRouter } from "react-router";

export default connect((state) => {
  return {
    styles: state.settings.styles,
    fontsInstalled: state.settings.fontsInstalled,
  };
})(function Styles(props) {
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [dirtyFields, setDirtyFields] = useState([]);
  const [fonts, setFonts] = useState([]);
  const [imageModal, setImageModal] = useState();

  const helperText = useMetaKey("s", saveSettings);
  // Set Fields and Field Values from store/URL
  useEffect(() => {
    const category = props.match.params.category
      ? props.match.params.category
      : 4;

    const fieldsByCategory = props.styles.filter(
      (item) => item.category == category
    );
    let newState = {};
    fieldsByCategory.forEach((field) => {
      if (field.type === "font_picker") {
        newState[field.referenceName] = parseFamily(field.value);
      } else {
        newState[field.referenceName] = field.value;
      }
    });
    setFields(fieldsByCategory);
    setFieldValues(newState);
  }, [props.styles, props.match]);

  // Set Font Options from installed fonts
  useEffect(() => {
    // inject all installed fonts
    props.fontsInstalled.forEach(injectFontImport);
    setFonts(
      props.fontsInstalled.map((headTag) => {
        const url = headTag.attributes.href;
        const fontVariants = url.split("=")[1];
        const font = fontVariants.split(":")[0];
        const variants = fontVariants.split(":")[1];
        const fontOption = {
          label: font.replace("+", " "),
          family: font.replace("+", " "),
        };
        if (variants) {
          const variantsArr = variants.split(",");
          // We only need first variant of a font
          fontOption.weight = variantsArr[0];
        }
        return fontOption;
      })
    );
  }, [props.fontsInstalled]);

  function injectFontImport(font) {
    const id = `googlefont`;
    const style = document.createElement("style");
    const att = document.createAttribute("id");
    att.value = id;
    style.setAttributeNode(att);
    const css = `@import url('${font.attributes.href}');`;
    style.append(css);
    document.head.appendChild(style);
  }

  function setValue(value, name) {
    setFieldValues({ ...fieldValues, [name]: value });

    if (dirtyFields.includes(name)) return;
    setDirtyFields([...dirtyFields, name]);
  }

  function saveSettings() {
    setSaving(true);

    const requests = fields
      .filter((field) => {
        if (dirtyFields.some((item) => field.referenceName === item)) {
          return field;
        }
      })
      .map((field) => {
        return props.dispatch(
          saveStyleVariable(field.ZUID, {
            ZUID: field.ZUID,
            category: field.category,
            name: field.name,
            referenceName: field.referenceName,
            value: fieldValues[field.referenceName],
            options: field.options,
            tips: field.tips,
            type: field.type,
          })
        );
      });

    Promise.all(requests)
      .then(() => {
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
      }
      if (font.split(":")[1].split().includes("i")) {
        return "italic";
      }
      return "";
    }
  }

  function renderField(field) {
    switch (field.type) {
      case "color":
        return (
          <FieldTypeColor
            key={field.ZUID}
            value={fieldValues[field.referenceName]}
            name={field.referenceName}
            helperText={field.description}
            onChange={(evt) => setValue(evt.target.value, field.referenceName)}
            label={field.name}
          />
        );
      case "dropdown":
        return (
          <FormControl fullWidth size="small">
            <FormLabel>{field.name}</FormLabel>
            <Select
              key={field.ZUID}
              name={field.referenceName}
              variant="outlined"
              displayEmpty
              value={fieldValues[field.referenceName]}
              onChange={(e) => setValue(e.target.value, field.name)}
            >
              <MenuItem value="">- None -</MenuItem>
              {Object.keys(field?.options).map((option, idx) => (
                <MenuItem key={idx} value={option}>
                  {field.options[option]}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{field.description}</FormHelperText>
          </FormControl>
        );
      case "font_picker":
        return (
          <div key={field.ZUID}>
            <span style={{ fontSize: "1.5rem" }}>{field.keyFriendly}</span>
            <div className={styles.fontPicker}>
              <Select
                fullWidth
                name={field.referenceName}
                onChange={(evt) =>
                  setValue(evt.target.value, field.referenceName)
                }
                className={[styles.selectFont]}
                // if default value is a font-family stack with ',' then show "Select"
                defaultValue={
                  field.value !== null && field.value.includes(",")
                    ? "inherit"
                    : field.value
                }
                size="small"
              >
                <MenuItem value="inherit">Select</MenuItem>
                {fonts.map((option, index) => (
                  <MenuItem
                    key={index}
                    value={
                      option.weight
                        ? `${option.family}:${option.weight}`
                        : option.family
                    }
                  >
                    {option.family}
                  </MenuItem>
                ))}
              </Select>
              <div className={styles.Preview}>
                <span
                  style={{
                    fontSize: "1.4rem",
                    fontFamily: parseFamily(fieldValues[field.referenceName]),
                    fontStyle: parseStyle(fieldValues[field.referenceName]),
                    fontWeight: parseWeight(fieldValues[field.referenceName]),
                  }}
                >
                  This is a text example
                </span>
              </div>
            </div>
          </div>
        );
      case "image":
        const images = (fieldValues[field.referenceName] || "")
          .split(",")
          .filter((el) => el);
        return (
          <>
            <FieldTypeImage
              key={field.ZUID}
              name={field.referenceName}
              label={field.name}
              description={field.description}
              limit="1"
              images={
                fieldValues[field.referenceName]
                  ? [fieldValues[field.referenceName]]
                  : []
              }
              onChange={setValue}
              resolveImage={(zuid, width, height) =>
                `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${zuid}/getimage/?w=${width}&h=${height}&type=fit`
              }
              mediaBrowser={(opts) => {
                setImageModal(opts);
              }}
            />
            {imageModal && (
              <MemoryRouter>
                <Dialog
                  open
                  fullScreen
                  sx={{ my: 2.5, mx: 10 }}
                  PaperProps={{
                    style: {
                      overflow: "hidden",
                    },
                  }}
                  onClose={() => setImageModal()}
                >
                  <IconButton
                    sx={{
                      position: "fixed",
                      right: 5,
                      top: 0,
                    }}
                    onClick={() => setImageModal()}
                  >
                    <CloseIcon sx={{ color: "common.white" }} />
                  </IconButton>
                  <MediaApp
                    limitSelected={imageModal.limit - images.length}
                    isSelectDialog={true}
                    showHeaderActions={false}
                    addImagesCallback={(images) => {
                      imageModal.callback(images);
                      setImageModal();
                    }}
                  />
                </Dialog>
              </MemoryRouter>
            )}
          </>
        );
      default:
        return (
          <FieldTypeText
            key={field.ZUID}
            label={field.name}
            name={field.referenceName}
            value={fieldValues[field.referenceName]}
            onChange={(evt) => {
              setValue(evt.target.value, field.referenceName);
            }}
            helperText={field.tips}
            maxLength={640}
          />
        );
    }
  }

  return (
    <>
      {fields.map((field) => (
        <div key={field.ZUID} className={styles.variableContainer}>
          <div className={styles.variable}>{renderField(field)}</div>
          <div className={styles.reference}>@{field.referenceName}</div>
        </div>
      ))}
      <Button
        variant="contained"
        color="success"
        id="SaveSettings"
        onClick={saveSettings}
        disabled={saving || dirtyFields.length === 0}
        startIcon={saving ? <CircularProgress size="20px" /> : <SaveIcon />}
      >
        Save Settings {helperText}
      </Button>
    </>
  );
});
