import { useState } from "react";
import { useHistory } from "react-router-dom";

import Box from "@mui/material/Box";
import SaveIcon from "@mui/icons-material/Save";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import LoadingButton from "@mui/lab/LoadingButton";

import { FieldTypeText } from "@zesty-io/material";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionActions from "@mui/material/AccordionActions";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsIcon from "@mui/icons-material/Settings";

import { Parent } from "./Parent";
import { notify } from "shell/store/notifications";
import { updateModel, saveModel, duplicateModel } from "shell/store/models";

import styles from "./Settings.less";
export default function Settings(props) {
  let history = useHistory();
  const update = (val, name) => {
    props.dispatch(updateModel(props.model.ZUID, name, val));
  };

  return (
    <Box sx={{ m: 2 }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ display: "flex", alignItems: "center" }}>
            {" "}
            <SettingsIcon fontSize="small" /> Model Settings
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <FieldTypeText
            name="label"
            label="Display label"
            value={props.model.label}
            onChange={(evt) => update(evt.target.value, "label")}
          />

          <FieldTypeText
            name="name"
            label="Parsley reference name (no spaces)"
            value={props.model.name}
            onChange={(evt) => update(evt.target.value, "name")}
          />

          <FieldTypeText
            className={styles.FieldTypeTextarea}
            multiline
            rows={6}
            name="description"
            label="Description"
            value={props.model.description}
            maxLength={500}
            onChange={(evt) => update(evt.target.value, "description")}
          />

          <Parent parentZUID={props.model.parentZUID} onChange={update} />
        </AccordionDetails>
        <AccordionActions>
          <Footer {...props} />
        </AccordionActions>
      </Accordion>
    </Box>
  );
}

function Footer(props) {
  const [loading, setLoading] = useState(false);

  const duplicate = () => {
    setLoading(true);
    props
      .dispatch(duplicateModel(props.model.ZUID))
      .then((res) => {
        if (res.status === 200) {
          history.pushState(`/schema/${res.data.ZUID}/`);
        } else {
          props.dispatch(
            notify({
              kind: "warn",
              message: res.error,
            })
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Settings:duplicate:catch", err);
        props.dispatch(
          notify({
            kind: "warn",
            message:
              err.message || `Failed to duplicate model: ${props.model.label}`,
          })
        );
        setLoading(false);
      });
  };

  return (
    <Box>
      <LoadingButton
        variant="outlined"
        onClick={duplicate}
        loading={loading}
        startIcon={<FileCopyIcon />}
        sx={{ mr: 2 }}
      >
        Duplicate Model
      </LoadingButton>
      <LoadingButton
        variant="contained"
        color="success"
        disabled={!props.model.dirty}
        onClick={() => {
          setLoading(true);
          props
            .dispatch(saveModel(props.model.ZUID, props.model))
            .then((res) => {
              if (res.status === 200) {
                props.dispatch(
                  notify({
                    kind: "save",
                    message: `Save ${props.model.label} changes`,
                  })
                );
              } else {
                console.error(res);
                props.dispatch(
                  notify({
                    kind: "warn",
                    message: `${res.error}`,
                  })
                );
              }
              setLoading(false);
            })
            .catch((err) => {
              console.err(err);
              props.dispatch(
                notify({
                  kind: "warn",
                  message: `Failed saving ${props.model.label} changes. ${err.message}`,
                })
              );
              setLoading(false);
            });
        }}
        loading={loading}
        startIcon={<SaveIcon />}
        sx={{ alignSelf: "flex-start" }}
      >
        Save Model
      </LoadingButton>
    </Box>
  );
}
