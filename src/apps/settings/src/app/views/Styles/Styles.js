import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { FieldTypeColor, FieldTypeText } from "@zesty-io/material";
import { FieldTypeImage } from "@zesty-io/core/FieldTypeImage";
import {
  Select,
  MenuItem,
  Dialog,
  IconButton,
  Typography,
  Portal,
} from "@mui/material";

import { MediaApp } from "../../../../../media/src/app";

import CloseIcon from "@mui/icons-material/Close";

import { MemoryRouter } from "react-router";
import { TopBar } from "../../components/TopBar";
import { FieldWrapper, MainWrapper } from "../../components/Containers";
import Box from "@mui/material/Box";
import { Tooltip } from "@mui/material";
import { notify } from "../../../../../../shell/store/notifications";
import { saveStyleVariable } from "../../../../../../shell/store/settings";

export default connect((state, props) => {
  const category = state.settings.catStyles?.find(
    (cat) => String(cat.value) === String(props.match.params.category)
  );
  return {
    styles: state.settings.styles,
    fontsInstalled: state.settings.fontsInstalled,
    category,
  };
})(function Styles(props) {
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [dirtyFields, setDirtyFields] = useState([]);
  const [fonts, setFonts] = useState([]);
  const [imageModal, setImageModal] = useState();
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
    setDirtyFields([]);
  }, [props.styles, props.match]);

  // Set Font Options from installed fonts
  useEffect(() => {
    // inject all installed fonts
    // props.fontsInstalled.forEach(injectFontImport);

    setFonts(
      props.fontsInstalled.map((headTag) => {
        const url = headTag.attributes.href;
        const fontVariants = url.split("=")[1];
        const font = fontVariants.split(":")[0];
        const variants = fontVariants.split(":")[1];
        const fontOption = {
          label: font.replace(/\+/g, " "),
          family: font.replace(/\+/g, " "),
          href: url,
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

  function saveSettings(callback) {
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
        callback && callback();
        props.dispatch(
          notify({
            kind: "success",
            message: `${props?.category?.label} Settings Saved`,
          })
        );
      })
      .catch((err) => {
        setSaving(false);
        callback && callback();
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
            onChange={(evt) => setValue(evt.target.value, field.referenceName)}
            fullWidth
            {...(!field?.description ? { helperText: field?.description } : {})}
          />
        );
      case "dropdown":
        return (
          <Select
            key={field.ZUID}
            name={field.referenceName}
            variant="outlined"
            displayEmpty
            value={fieldValues[field.referenceName]}
            onChange={(e) => setValue(e.target.value, field.name)}
            size="small"
            fullWidth
          >
            <MenuItem value="">- None -</MenuItem>
            {Object.keys(field?.options).map((option, idx) => (
              <MenuItem key={idx} value={option}>
                {field.options[option]}
              </MenuItem>
            ))}
          </Select>
        );
      case "font_picker":
        return (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            width="100%"
          >
            <Select
              fullWidth
              name={field.referenceName}
              onChange={(evt) =>
                setValue(evt.target.value, field.referenceName)
              }
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
            <Box width="100%" mt="8px">
              <Typography
                variant="body2"
                color="text.secondary"
                style={{
                  fontSize: "1.4rem",
                  fontFamily: parseFamily(fieldValues[field.referenceName]),
                  fontStyle: parseStyle(fieldValues[field.referenceName]),
                  fontWeight: parseWeight(fieldValues[field.referenceName]),
                }}
              >
                This is a text example
              </Typography>
            </Box>
          </Box>
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
              fullWidth
              size="small"
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
            name={field.referenceName}
            value={fieldValues[field.referenceName]}
            onChange={(evt) => {
              setValue(evt.target.value, field.referenceName);
            }}
            // helperText={field.tips}
            maxLength={640}
            fullWidth
            size="small"
          />
        );
    }
  }

  return (
    <>
      <TopBar
        title={props?.category?.label}
        onSave={saveSettings}
        isNotSaved={dirtyFields.length > 0}
        isLoading={saving}
        matchPath={props.match.path}
      />
      <Box
        px="32px"
        py="16px"
        sx={{
          width: "100%",
          height: "calc(100% - 84px)",
          overflowY: "auto",
          overflowX: "hidden",
          margin: "0",
          display: "block",
          maxHeight: "calc(100% - 84px)",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <MainWrapper fullWidth rowGap={3}>
          {fields.map((field) => (
            <Box
              key={field.ZUID}
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              // border="1px solid red"
            >
              <FieldWrapper label={field.name}>
                <Box
                  width="100%"
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    position: "relative",
                    boxSizing: "border-box",
                    columnGap: 2,
                    // border: "1px solid green",
                  }}
                >
                  <Box
                    maxWidth="640px"
                    minWidth="350px"
                    flexGrow={1}
                    flexShrink={1}
                  >
                    {renderField(field)}
                  </Box>

                  {!field.referenceName ? null : (
                    <Box
                      sx={{
                        border: "1px solid",
                        borderColor: "grey.300",
                        borderRadius: "8px",
                        width: "280px",
                        maxWidth: "280px",
                        // width: "fit-content",
                        boxSizing: "border-box",

                        flexGrow: 1,

                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        px: "12px",
                        py: "6.5px",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" noWrap>
                        @{field.referenceName}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </FieldWrapper>
            </Box>
          ))}
        </MainWrapper>
      </Box>
      {!fonts?.length ? null : (
        <Portal container={document.head}>
          {fonts?.map((font) => {
            return (
              <link rel="stylesheet" href={font?.href} title="stylesheetLink" />
            );
          })}
        </Portal>
      )}
    </>
  );
});
