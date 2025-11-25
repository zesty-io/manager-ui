import { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  Box,
  ButtonBase,
  Link,
} from "@mui/material";
import { FieldTypeText } from "@zesty-io/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";

import { TopBar } from "../../components/TopBar";
import { FieldWrapper, MainWrapper } from "../../components/Containers";
import { Typography } from "@mui/material";
import { notify } from "../../../../../../shell/store/notifications";
import { updateSettings } from "../../../../../../shell/store/settings";

const DOCLINKS_MAP = {
  mode: "https://docs.zesty.io/docs/modes",
  site_protocol: "https://docs.zesty.io/docs/manager-instance-settings",
};

const DocLink = ({ href }) => {
  return (
    <ButtonBase
      LinkComponent={Link}
      href={href}
      target="_blank"
      rel="noreferrer"
      sx={{
        height: "32px",
        border: "1px solid",
        borderColor: "border",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        px: "10px",
        py: "4px",
        "&:hover": {
          bgcolor: "border",
        },
        textDecoration: "none!important",
      }}
    >
      <MenuBookIcon
        sx={{ width: "18px", height: "18px", color: "action.active" }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        fontSize="14px"
        fontWeight={500}
        sx={{ textDecoration: "none!important" }}
      >
        Read Docs
      </Typography>
    </ButtonBase>
  );
};

export default connect((state) => {
  return {
    catInstance: state.settings.catInstance,
    instance: state.settings.instance,
  };
})(function Instance(props) {
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
    setDirtyFields([]);
    setFields(matchingFields);
    setFieldValues(
      matchingFields.reduce((acc, field) => {
        acc[field.key] = field.value;
        return acc;
      }, {})
    );
  }, [props.instance.length, props.match]);

  function setValue(value, name) {
    if (value === null) return;
    setFieldValues({ ...fieldValues, [name]: value });

    if (dirtyFields.includes(name)) return;
    setDirtyFields([...dirtyFields, name]);
  }

  async function saveFields(callback) {
    setSaving(true);

    const requests = fields
      .filter((field) => {
        if (dirtyFields.some((item) => field.key === item)) {
          return field;
        }
      })
      .map(async (field) => {
        const value =
          fieldValues[field.key] === null
            ? null
            : fieldValues[field.key].toString();
        return await props.dispatch(
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
        callback && callback();
        props.dispatch(
          notify({
            kind: "success",
            message: `${capitalizeFirstLetter(
              props.match.params.category
            )} Settings Saved`,
          })
        );
      })
      .catch((err) => {
        setSaving(false);
        callback && callback();
        setDirtyFields([]);
        props.dispatch(
          notify({
            kind: "warn",
            message: err.message || "Failed to save settings",
          })
        );
      });
  }
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  let i = 0;
  return (
    <>
      <TopBar
        title={`${capitalizeFirstLetter(props.match.params.category)}`}
        onSave={saveFields}
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
        <MainWrapper rowGap={3}>
          {fields.map((field) => {
            {
              i % 2 == 0 && (
                <Divider
                  key={field.ZUID}
                  sx={{
                    my: 1,
                    mx: 2,
                  }}
                />
              );
            }
            i++;
            switch (field.dataType) {
              case "checkbox":
                const httpsDocLink = DOCLINKS_MAP?.[field?.key] || null;
                if (field.key === "site_protocol") {
                  return (
                    <FieldWrapper
                      key={field.ZUID}
                      label={field.keyFriendly}
                      tooltip={field.tips}
                      rowGap={2}
                    >
                      <Select
                        name={field.key}
                        onChange={(evt) =>
                          setValue(evt.target.value, field.key)
                        }
                        value={fieldValues[field.key]}
                        size="small"
                        fullWidth
                      >
                        <MenuItem value="Select">Select</MenuItem>
                        {field.options.split(",").map((option, index) => (
                          <MenuItem key={index} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      {!!httpsDocLink ? <DocLink href={httpsDocLink} /> : null}
                    </FieldWrapper>
                  );
                } else if (field.key === "preferred_domain_prefix") {
                  return (
                    <FieldWrapper
                      key={field.ZUID}
                      label={field.keyFriendly}
                      tooltip={`Activating the WWW setting requires DNS setup of both the apex domain and www sub-domain.`}
                    >
                      <ToggleButtonGroup
                        color="primary"
                        size="small"
                        value={fieldValues[field.key]}
                        exclusive
                        onChange={(evt, val) => setValue(val, field.key)}
                      >
                        <ToggleButton value={"0"}>Off </ToggleButton>
                        <ToggleButton value={"1"}>On </ToggleButton>
                      </ToggleButtonGroup>
                    </FieldWrapper>
                  );
                } else {
                  return (
                    <FieldWrapper
                      key={field.ZUID}
                      label={field.keyFriendly}
                      tooltip={field.tips}
                    >
                      <ToggleButtonGroup
                        color="primary"
                        size="small"
                        value={fieldValues[field.key]}
                        exclusive
                        onChange={(evt, val) => setValue(val, field.key)}
                      >
                        <ToggleButton value={"0"}>Off</ToggleButton>
                        <ToggleButton value={"1"}>On </ToggleButton>
                      </ToggleButtonGroup>
                    </FieldWrapper>
                  );
                }
              case "textarea":
                return (
                  <FieldWrapper
                    key={field.ZUID}
                    label={field.keyFriendly}
                    tooltip={field.tips}
                    pb="22px"
                  >
                    <FieldTypeText
                      key={field.ZUID}
                      name={field.key}
                      value={fieldValues[field.key]}
                      onChange={(evt) => setValue(evt.target.value, field.key)}
                      multiline
                      rows={6}
                      fullWidth
                      sx={{
                        "& .MuiInputAdornment-root.MuiInputAdornment-positionEnd":
                          {
                            height: "20px",
                            position: "absolute",
                            right: 0,
                            bottom: "-22px",
                          },
                      }}
                    />
                  </FieldWrapper>
                );
              case "dropdown":
                const docLink = DOCLINKS_MAP?.[field?.key] || null;
                return (
                  <FieldWrapper
                    key={field.ZUID}
                    label={field.keyFriendly}
                    tooltip={field.tips}
                  >
                    <Select
                      name={field.key}
                      onChange={(evt) => setValue(evt.target.value, field.key)}
                      value={fieldValues[field.key]}
                      size="small"
                      fullWidth
                    >
                      {field.options.split(";").map((option, index) => {
                        let val = option.split(":");
                        return (
                          <MenuItem key={index} value={val[0]}>
                            {val[1]}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    {!!docLink ? <DocLink href={docLink} /> : null}
                    <Typography variant="body2" color="text.secondary">
                      {field.tips}
                    </Typography>
                  </FieldWrapper>
                );
              default:
                return (
                  <FieldWrapper key={field.ZUID} label={field.keyFriendly}>
                    <FieldTypeText
                      key={field.ZUID}
                      name={field.key}
                      value={fieldValues[field.key]}
                      onChange={(evt) =>
                        setValue(evt.target.value, evt.target.name)
                      }
                      helperText={field.tips}
                      maxLength={640}
                      fullWidth
                    />
                  </FieldWrapper>
                );
            }
          })}
        </MainWrapper>
      </Box>
    </>
  );
});
