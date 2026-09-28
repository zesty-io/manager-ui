import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";

import {
  Box,
  Select,
  MenuItem,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Card,
  CardHeader,
  CardContent,
  CardActions,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import IosShareIcon from "@mui/icons-material/IosShare";

import { FieldTypeInternalLink } from "shell/components/FieldTypeInternalLink";

import { FieldTypeText, FieldTypeUrl } from "@zesty-io/material";

import { searchItems } from "shell/store/content";
import { notify } from "shell/store/notifications";
import { request } from "utility/request";
import { instanceApi } from "../../../../../../shell/services/instance";
import styles from "./LinkCreate.less";
export function LinkCreate() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const content = useSelector((state) => state.content);
  const internalLinkOptions = useMemo(() => {
    return Object.keys(content)
      .filter((key) => content[key].web.path)
      .map((key) => {
        return {
          value: content[key].meta.ZUID,
          text: content[key].web.path,
        };
      });
  }, [content]);

  const [state, setState] = useState({
    type: "internal",
    parentZUID: "0",
    label: "",
    metaTitle: "",
    target: "",
    relNoFollow: false,
    targetBlank: false,
  });

  function saveLink() {
    setState({
      ...state,
      saving: true,
    });

    const source = [];
    if (state.relNoFollow) {
      source.push("rel:true");
    }
    if (state.targetBlank) {
      source.push("target:_blank");
    }

    return request(`${CONFIG.API_INSTANCE}/content/links`, {
      method: "POST",
      json: true,
      body: {
        type: state.type,
        parentZUID: state.parentZUID,
        label: state.label,
        metaTitle: state.metaTitle,
        source: source.join(";"),
        target: state.target,
      },
    })
      .then((res) => {
        setState({ ...state, saving: false });
        if (res.error) {
          let message = "";
          if (/metaTitle/.test(res.error)) {
            message = t("content.linkEditorErrorAddTitle");
          } else if (
            /internal links must target a content item/.test(res.error)
          ) {
            message = t("content.linkEditorErrorAddTarget");
          } else if (
            /external links must target an external site/.test(res.error)
          ) {
            message = t("content.linkEditorErrorAddProtocol");
          }
          dispatch(
            notify({
              heading: t("content.linkCreateUnableToCreate"),
              message,
              kind: "error",
            })
          );
        } else {
          // this is a successful save
          // message and redirect to new item here
          dispatch(instanceApi.util.invalidateTags(["ContentNav"]));
          dispatch(
            notify({
              message: t("content.linkCreateCreated", {
                title: state.metaTitle,
              }),
              kind: "save",
            })
          );

          dispatch({
            type: "CREATE_LINK",
          });

          history.push(`/content/link/${res.data.ZUID}`);
        }
      })
      .catch((err) => {
        console.error(err);
        setState({ ...state, saving: false });
      });
  }

  function onChange(value, name) {
    setState({
      ...state,
      [name]: value,
    });
  }

  return (
    <section className={styles.Editor}>
      <Card sx={{ m: 2, width: "800px" }}>
        <CardHeader
          title={
            <>
              {" "}
              <Select
                name="type"
                value={state.type}
                onChange={(evt) => onChange(evt.target.value, "type")}
                fullWidth
              >
                <MenuItem value="internal">
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <LinkIcon fontSize="small" />
                    &nbsp;{t("content.linkEditorInternalLink")}
                  </Box>
                </MenuItem>
                <MenuItem value="external">
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IosShareIcon fontSize="small" />
                    &nbsp;{t("content.linkEditorExternalLink")}
                  </Box>
                </MenuItem>
              </Select>
            </>
          }
        ></CardHeader>

        <CardContent
          sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <FieldTypeInternalLink
            className={styles.Row}
            name="parentZUID"
            label={t("content.linkEditorSelectParent")}
            value={state.parentZUID}
            options={internalLinkOptions}
            onChange={onChange}
            onSearch={(term) => dispatch(searchItems(term))}
          />

          {state.type === "internal" ? (
            <FieldTypeInternalLink
              className={styles.Row}
              name="target"
              label={t("content.linkEditorSelectTarget")}
              value={state.target}
              options={internalLinkOptions}
              onChange={onChange}
              onSearch={(term) => dispatch(searchItems(term))}
            />
          ) : (
            <FieldTypeUrl
              label={t("content.linkEditorExternalUrl")}
              name="target"
              value={state.target}
              onChange={(evt) => onChange(evt.target.value, "target")}
              maxLength={255}
            />
          )}

          <FieldTypeText
            label={t("content.linkEditorLinkTitle")}
            name="metaTitle"
            value={state.metaTitle}
            onChange={(evt) => {
              const value = evt.target.value;
              setState({
                ...state,
                label: value,
                metaTitle: value,
              });
            }}
          />

          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  checked={state.targetBlank}
                  onChange={(evt, val) =>
                    setState({ ...state, targetBlank: val })
                  }
                />
              }
              label="target = _blank"
            />
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  checked={state.relNoFollow}
                  onChange={(evt, val) =>
                    setState({ ...state, relNoFollow: val })
                  }
                />
              }
              label="rel = nofollow"
            />
          </FormGroup>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            color="success"
            id="CreateLinkButton"
            disabled={state.saving}
            onClick={saveLink}
            startIcon={<AddIcon />}
          >
            {t("content.linkCreateButton")}
          </Button>
        </CardActions>
      </Card>
    </section>
  );
}
