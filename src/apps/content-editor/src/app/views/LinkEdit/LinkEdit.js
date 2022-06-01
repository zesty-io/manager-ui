import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";

import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { FieldTypeInternalLink } from "@zesty-io/core/FieldTypeInternalLink";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeUrl } from "@zesty-io/core/FieldTypeUrl";
import { Input } from "@zesty-io/core/Input";

import { ConfirmDialog } from "@zesty-io/core/ConfirmDialog";

import { closeTab } from "shell/store/ui";
import { searchItems } from "shell/store/content";
import { notify } from "shell/store/notifications";
import { request } from "utility/request";

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
              message: `Error saving link: ${message}`,
              kind: "error",
            })
          );
        } else {
          setState({ ...state, saving: false });
          dispatch(notify({ message: "Saved link", kind: "save" }));
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
      dispatch(notify({ message: "Deleted Link", kind: "save" }));
      dispatch(closeTab(`/content/link/${linkZUID}`));
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
        <Card className={styles.LinkEdit}>
          <CardHeader className={styles.EditorHeader}>
            {state.type === "internal" && <h2>Internal Link</h2>}
            {state.type === "external" && <h2>External Link</h2>}
          </CardHeader>
          <CardContent className={styles.CardContent}>
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
              className={styles.Row}
              label="Link title"
              name="metaTitle"
              value={state.metaTitle}
              onChange={(value) => {
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
                name="rel"
                checked={state.relNoFollow}
                onClick={(evt) => {
                  onChange(evt.target.checked, "relNoFollow");
                }}
              />
              rel = nofollow
            </label>
          </CardContent>
          <CardFooter className={styles.LinkEditActions}>
            <Button
              variant="contained"
              color="success"
              disabled={state.saving}
              onClick={saveLink}
              startIcon={<SaveIcon />}
            >
              Save Changes
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={state.saving}
              onClick={() => setShowConfirmation(true)}
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          </CardFooter>
        </Card>
      </WithLoader>

      {showConfirmation && (
        <ConfirmDialog
          isOpen={showConfirmation}
          prompt="Are you sure you want to delete this link?"
        >
          <Button
            variant="contained"
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
