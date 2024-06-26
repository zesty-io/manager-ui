import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";

import { WithLoader } from "@zesty-io/core/WithLoader";
import { FieldTypeInternalLink } from "@zesty-io/core/FieldTypeInternalLink";
import { FieldTypeText, FieldTypeUrl } from "@zesty-io/material";

import { ConfirmDialog } from "@zesty-io/material";

import { unpinTab } from "shell/store/ui";
import { searchItems } from "shell/store/content";
import { notify } from "shell/store/notifications";
import { request } from "utility/request";
import { instanceApi } from "../../../../../../shell/services/instance";
import styles from "./LinkEdit.less";
export default function LinkEdit() {
  const dispatch = useDispatch();
  const isMounted = useRef(false);
  const { linkZUID } = useParams();
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

  const INITIAL_STATE = {
    type: "internal",
    parentZUID: "0",
    label: "",
    metaTitle: "",
    target: "",
    relNoFollow: false,
    targetBlank: false,
    linkZUID,
    loading: false,
  };
  const [state, setState] = useState(INITIAL_STATE);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    fetchLink(linkZUID);
  }, []);

  // navigating to different link will reset state and fetch new Link
  useEffect(() => {
    if (linkZUID !== state.linkZUID) {
      setState(INITIAL_STATE);
      fetchLink(linkZUID);
    }
  }, [linkZUID]);

  function fetchLink(linkZUID) {
    setState((s) => ({
      ...s,
      loading: true,
    }));

    return request(`${CONFIG.API_INSTANCE}/content/links/${linkZUID}`)
      .then((res) => {
        if (res.error) {
          throw res.error;
        }
        return res;
      })
      .then((res) => {
        if (isMounted.current) {
          // 0 indicates a top level menu link, nothing to resolve
          // otherwise if a parent zuid value exists resolve it's data
          if (res.data.parentZUID !== "0" && res.data.parentZUID) {
            let parent = content[res.data.parentZUID];

            if (!parent || !parent.meta.ZUID) {
              dispatch(searchItems(res.data.parentZUID));
            }
          }

          // Internal links store the linked zuid on the path_part
          if (res.data.type === "internal" && res.data.target) {
            let link = content[res.data.target];
            if (!link || !link.meta.ZUID) {
              dispatch(searchItems(res.data.target));
            }
          }

          let relNoFollow = false;
          let targetBlank = false;
          res.data.source.split(";").forEach((sourceField) => {
            if (sourceField === "rel:true") {
              relNoFollow = true;
            } else if (sourceField === "target:_blank") {
              targetBlank = true;
            }
          });

          setState((s) => {
            return {
              ...s,
              loading: false,
              ZUID: res.data.ZUID,
              type: res.data.type,
              parentZUID: res.data.parentZUID,
              label: res.data.label,
              metaTitle: res.data.metaTitle || res.data.label,
              targetBlank,
              relNoFollow,
              target: res.data.target,
            };
          });
        }
      })
      .catch((err) => {
        console.error(err);
        dispatch(
          notify({
            message: "Failed loading link",
            kind: "error",
          })
        );
        setState({
          ...state,
          loading: false,
        });
      });
  }

  function saveLink() {
    setState({ ...state, saving: true });

    const source = [];
    if (state.relNoFollow) {
      source.push("rel:true");
    }
    if (state.targetBlank) {
      source.push("target:_blank");
    }

    const params = {
      ZUID: state.ZUID,
      type: state.type,
      parentZUID: state.parentZUID,
      label: state.label,
      metaTitle: state.metaTitle,
      source: source.join(";"),
      target: state.target,
    };

    return request(`${CONFIG.API_INSTANCE}/content/links/${params.ZUID}`, {
      method: "PUT",
      json: true,
      body: params,
    })
      .then((res) => {
        if (res.error) {
          setState({ ...state, saving: false });
          let message = "";
          if (/metaTitle/.test(res.error)) {
            message = "Please add a Link Title";
          } else if (
            /internal links must target a content item/.test(res.error)
          ) {
            message = "Please add a Link Target";
          } else if (
            /external links must target an external site/.test(res.error)
          ) {
            message = "Please add a Link Protocol";
          }
          dispatch(
            notify({
              heading: `Cannot Save: ${
                params.metaTitle.trim() === ""
                  ? "Empty Title"
                  : params.metaTitle
              }`,
              message,
              kind: "error",
            })
          );
        } else {
          setState({ ...state, saving: false });
          dispatch(
            notify({
              message: `Link Saved: ${params.metaTitle}`,
              kind: "save",
            })
          );
          dispatch(instanceApi.util.invalidateTags(["ContentNav"]));
        }
      })
      .catch((err) => {
        console.error(err);
        setState({ ...state, saving: false });
        dispatch(notify({ message: "Error saving link", kind: "error" }));
      });
  }

  function deleteLink() {
    return request(`${CONFIG.API_INSTANCE}/content/links/${linkZUID}`, {
      method: "DELETE",
      json: true,
    }).then(() => {
      dispatch({
        type: "REMOVE_LINK",
      });
      dispatch(
        notify({
          message: `Link Deleted: ${state.metaTitle}`,
          kind: "error",
        })
      );
      dispatch(unpinTab({ pathname: `/content/link/${linkZUID}`, search: "" }));
      dispatch(instanceApi.util.invalidateTags(["ContentNav"]));
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
      <WithLoader condition={!state.loading} message="Loading Link">
        <Card className={styles.LinkEdit} sx={{ m: 2, width: "800px" }}>
          <CardHeader
            title={
              <>
                {" "}
                {state.type === "internal" && <h5>Internal Link</h5>}
                {state.type === "external" && <h5>External Link</h5>}
              </>
            }
            className={styles.EditorHeader}
          ></CardHeader>
          <CardContent
            className={styles.CardContent}
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
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              color="error"
              disabled={state.saving}
              onClick={() => setShowConfirmation(true)}
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              color="success"
              disabled={state.saving}
              onClick={saveLink}
              startIcon={<SaveIcon />}
            >
              Save Changes
            </Button>
          </CardActions>
        </Card>
      </WithLoader>

      {showConfirmation && (
        <ConfirmDialog
          open={showConfirmation}
          title="Are you sure you want to delete this link?"
        >
          <Button
            variant="outlined"
            onClick={() => setShowConfirmation(false)}
            startIcon={<DoDisturbAltIcon />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteLink()}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </ConfirmDialog>
      )}
    </section>
  );
}
