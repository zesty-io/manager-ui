import { Fragment, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";

import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { FieldTypeInternalLink } from "@zesty-io/core/FieldTypeInternalLink";
import { FieldTypeText } from "@zesty-io/material";
import { FieldTypeUrl } from "@zesty-io/core/FieldTypeUrl";
import { Select, Option } from "@zesty-io/core/Select";
import { Input } from "@zesty-io/core/Input";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExternalLinkSquareAlt,
  faLink,
} from "@fortawesome/free-solid-svg-icons";

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
      <Card className={styles.LinkCreate}>
        <CardHeader className={styles.EditorHeader}>
          <Select
            label="Select link type"
            name="type"
            value={state.type}
            onSelect={onChange}
          >
            <Option
              className={styles.Icon}
              value="internal"
              component={
                <Fragment>
                  <FontAwesomeIcon icon={faLink} />
                  &nbsp;Internal Link
                </Fragment>
              }
            />
            <Option
              className={styles.Icon}
              value="external"
              component={
                <Fragment>
                  <FontAwesomeIcon icon={faExternalLinkSquareAlt} />
                  &nbsp;External Link
                </Fragment>
              }
            />
          </Select>
        </CardHeader>

        <CardContent>
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
              className={styles.Row}
              label="Provide an external URL to link to"
              name="target"
              value={state.target}
              onChange={onChange}
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

          <label className={styles.Checkboxes}>
            <Input
              type="checkbox"
              name="targetBlank"
              checked={state.targetBlank}
              onClick={(evt) => {
                onChange(evt.target.checked, "targetBlank");
              }}
            />
            target = _blank
          </label>
          <label className={styles.Checkboxes}>
            <Input
              type="checkbox"
              name="relNoFollow"
              checked={state.relNoFollow}
              onClick={(evt) => {
                onChange(evt.target.checked, "relNoFollow");
              }}
            />
            rel = nofollow
          </label>
        </CardContent>
        <CardFooter>
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
        </CardFooter>
      </Card>
    </section>
  );
}
