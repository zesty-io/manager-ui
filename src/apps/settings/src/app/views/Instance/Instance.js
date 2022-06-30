import { useEffect, useState } from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";

import {
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  FormLabel,
  Button,
  CircularProgress,
  Tooltip,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import InfoIcon from "@mui/icons-material/InfoOutlined";

import { FieldTypeText } from "@zesty-io/material";
import { FieldLabel } from "@zesty-io/core/FieldLabel";

import { Docs } from "@zesty-io/core/Docs";
import { notify } from "shell/store/notifications";
import { FieldDescription } from "@zesty-io/core/FieldDescription";
import { Notice } from "@zesty-io/core/Notice";

import { updateSettings } from "shell/store/settings";

import styles from "./SettingsStyles.less";
import typographystyles from "@zesty-io/core/typography.less";

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
    if (value === null) return;
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
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  let i = 0;
  return (
    <div className={styles.Settings}>
      <div className={styles.row}>
        <div className={styles.column}>
          <h1 className={typographystyles.subheadline}>
            <FontAwesomeIcon icon={faCog} className={styles.titleIcon} />
            {capitalizeFirstLetter(props.match.params.category)} Settings
          </h1>
        </div>
        <div className={styles.column}>
          <div className={styles.labelRow}>
            {dirtyFields.length !== 0 && (
              <Notice>
                {" "}
                Changes affect production on first re-render, cache-expiry, or
                cache clear
              </Notice>
            )}
            <Button
              variant="contained"
              id="saveSettings"
              color="success"
              onClick={saveFields}
              disabled={saving || dirtyFields.length === 0}
              startIcon={
                saving ? <CircularProgress size="20px" /> : <SaveIcon />
              }
              sx={{ alignSelf: "flex-end" }}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
      <Divider
        sx={{
          my: 1,
          mx: 2,
        }}
      />
      <div className={styles.row}>
        {fields.map((field) => {
          {
            i % 2 == 0 && (
              <Divider
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
              if (field.key === "site_protocol") {
                return (
                  <div key={field.ZUID} className={styles.column}>
                    <div className={styles.labelRow}>
                      <FieldLabel label={field.keyFriendly} />{" "}
                      <Docs subject={`${field.key}`} />
                    </div>
                    <div className={styles.selectProtocol}>
                      <Select
                        name={field.key}
                        onChange={(e) => setValue(e.target.value, field.key)}
                        value={fieldValues[field.key]}
                        size="small"
                      >
                        <MenuItem value="Select">Select</MenuItem>
                        {field.options.split(",").map((option, index) => (
                          <MenuItem key={index} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                );
              } else if (field.key === "preferred_domain_prefix") {
                return (
                  <div key={field.ZUID} className={styles.column}>
                    <FormLabel>
                      <Stack
                        spacing={1}
                        direction="row"
                        alignItems="center"
                        sx={{
                          my: 1,
                        }}
                      >
                        <Tooltip
                          title={`Activating the WWW setting requires DNS setup of both the apex domain and www sub-domain.`}
                        >
                          <InfoIcon fontSize="small" />
                        </Tooltip>
                        <p>{field.keyFriendly}</p>
                      </Stack>
                    </FormLabel>
                    <ToggleButtonGroup
                      color="secondary"
                      size="small"
                      value={fieldValues[field.key]}
                      exclusive
                      onChange={(evt, val) => setValue(val, field.key)}
                    >
                      <ToggleButton value={"0"}>Off </ToggleButton>
                      <ToggleButton value={"1"}>On </ToggleButton>
                    </ToggleButtonGroup>
                  </div>
                );
              } else {
                return (
                  <div key={field.ZUID} className={styles.column}>
                    <FormLabel>
                      <Stack
                        spacing={1}
                        direction="row"
                        alignItems="center"
                        sx={{
                          my: 1,
                        }}
                      >
                        <Tooltip title={field.tips}>
                          <InfoIcon fontSize="small" />
                        </Tooltip>
                        <p>{field.keyFriendly}</p>
                      </Stack>
                    </FormLabel>
                    <ToggleButtonGroup
                      color="secondary"
                      size="small"
                      value={fieldValues[field.key]}
                      exclusive
                      onChange={(evt, val) => setValue(val, field.key)}
                    >
                      <ToggleButton value={"0"}>Off</ToggleButton>
                      <ToggleButton value={"1"}>On </ToggleButton>
                    </ToggleButtonGroup>
                  </div>
                );
              }
            case "textarea":
              const tooltip = field.tips && (
                <>
                  <Tooltip title={field.tips} arrow placement="top-start">
                    <InfoIcon fontSize="small" />
                  </Tooltip>
                  &nbsp;
                </>
              );

              return (
                <div key={field.ZUID} className={styles.column}>
                  <FieldTypeText
                    key={field.ZUID}
                    name={field.key}
                    value={fieldValues[field.key]}
                    label={
                      <>
                        {tooltip}
                        {field.keyFriendly}
                      </>
                    }
                    onChange={(evt) => setValue(evt.target.value, field.key)}
                    multiline
                    rows={6}
                  />
                </div>
              );
            case "dropdown":
              return (
                <div key={field.ZUID} className={styles.column}>
                  <FieldLabel label={field.keyFriendly} />
                  <div className={styles.selectProtocol}>
                    <Select
                      name={field.key}
                      onChange={(e) => setValue(e.target.value, field.key)}
                      value={fieldValues[field.key]}
                      size="small"
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
                  </div>
                  <br />
                  <div className={styles.labelRow}>
                    <Docs subject={field.keyFriendly} />
                    <FieldDescription description={field.tips} />
                  </div>
                </div>
              );
            default:
              return (
                <div key={field.ZUID} className={styles.column}>
                  <FieldTypeText
                    key={field.ZUID}
                    label={field.keyFriendly}
                    name={field.key}
                    value={fieldValues[field.key]}
                    onChange={(evt) =>
                      setValue(evt.target.value, evt.target.name)
                    }
                    helperText={field.tips}
                    maxLength={640}
                  />
                </div>
              );
          }
        })}
      </div>
    </div>
  );
});
