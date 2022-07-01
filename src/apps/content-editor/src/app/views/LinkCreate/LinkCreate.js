import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import IosShareIcon from "@mui/icons-material/IosShare";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";

import { FieldTypeInternalLink } from "@zesty-io/core/FieldTypeInternalLink";
import { FieldTypeText, FieldTypeUrl } from "@zesty-io/material";
import { Select, Option } from "@zesty-io/core/Select";

import { searchItems } from "shell/store/content";
import { notify } from "shell/store/notifications";
import { request } from "utility/request";

import styles from "./LinkCreate.less";
export function LinkCreate() {
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
            message = "Missing Link title";
          } else if (
            /internal links must target a content item/.test(res.error)
          ) {
            message = "Missing Link target";
          } else if (
            /external links must target an external site/.test(res.error)
          ) {
            message = "Missing Link protocol";
          }
          dispatch(
            notify({
              message: `Failure creating link: ${message}`,
              kind: "error",
            })
          );
        } else {
          // this is a successful save
          // message and redirect to new item here
          dispatch(
            notify({
              message: "Successfully created link",
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
                label="Select link type"
                name="type"
                value={state.type}
                onSelect={onChange}
              >
                <Option
                  value="internal"
                  component={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <LinkIcon fontSize="small" />
                      &nbsp;Internal Link
                    </Box>
                  }
                />
                <Option
                  value="external"
                  component={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <IosShareIcon fontSize="small" />
                      &nbsp;External Link
                    </Box>
                  }
                />
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
            label="Select a parent for your link"
            value={state.parentZUID}
            options={internalLinkOptions}
            onChange={onChange}
            onSearch={(term) => dispatch(searchItems(term))}
          />

          {state.type === "internal" ? (
            <FieldTypeInternalLink
              className={styles.Row}
              name="target"
              label="Select an item to link to"
              value={state.target}
              options={internalLinkOptions}
              onChange={onChange}
              onSearch={(term) => dispatch(searchItems(term))}
            />
          ) : (
            <FieldTypeUrl
              label="Provide an external URL to link to"
              name="target"
              value={state.target}
              onChange={(evt) => onChange(evt.target.value, "target")}
              maxLength={255}
            />
          )}

          <FieldTypeText
            label="Link title"
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
                  color="secondary"
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
                  color="secondary"
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
            Create Link
          </Button>
        </CardActions>
      </Card>
    </section>
  );
}
