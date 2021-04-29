import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { FieldTypeInternalLink } from "@zesty-io/core/FieldTypeInternalLink";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeUrl } from "@zesty-io/core/FieldTypeUrl";
import { Input } from "@zesty-io/core/Input";
import { Button } from "@zesty-io/core/Button";

import { notify } from "shell/store/notifications";
import { request } from "utility/request";

import styles from "./LinkEdit.less";

function useAsyncState(value) {
  const ref = useRef(value);
  const [, forceRender] = useState(false);

  function updateState(newState) {
    ref.current = newState;
    forceRender(s => !s);
  }

  return [ref, updateState];
}

function LinkEdit(props) {
  const history = useHistory();
  const isMounted = useRef(false);

  const [state, setState] = useAsyncState({
    type: "internal",
    parentZUID: "0",
    label: "",
    metaTitle: "",
    target: "",
    relNoFollow: false,
    targetBlank: false,
    internalLinkOptions: [],
    linkZUID: props.linkZUID,
    loading: false
  });

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    fetchLink(props.linkZUID);
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      if (props.linkZUID !== state.current.linkZUID) {
        console.log(props.linkZUID, state.current.linkZUID);
        setState({
          ...state.current,
          type: "internal",
          parentZUID: "0",
          label: "",
          metaTitle: "",
          target: "",
          relNoFollow: false,
          targetBlank: false,
          internalLinkOptions: [],
          linkZUID: props.linkZUID,
          loading: false
        });
        fetchLink(props.linkZUID);
      }
    }
  }, [props.linkZUID]);

  function fetchLink(linkZUID) {
    setState({
      ...state.current,
      loading: true
    });

    return request(`${CONFIG.API_INSTANCE}/content/links/${linkZUID}`)
      .then(res => {
        if (isMounted.current) {
          setState({
            ...state.current,
            loading: false
          });

          if (res.error) {
            props.dispatch(
              notify({
                message: `Failure loading link: ${res.message}`,
                kind: "error"
              })
            );
          } else {
            // 0 indicates a top level menu link, nothing to resolve
            // otherwise if a parent zuid value exists resolve it's data
            if (res.data.parentZUID !== "0" && res.data.parentZUID) {
              let parent = props.items[res.data.parentZUID];

              if (!parent || !parent.meta.ZUID) {
                search(res.data.parentZUID);
              } else {
                setState({
                  ...state.current,
                  internalLinkOptions: [
                    ...state.current.internalLinkOptions,
                    {
                      value: parent.meta.ZUID,
                      text: parent.web.path
                    }
                  ]
                });
              }
            }

            // Internal links store the linked zuid on the path_part
            if (res.data.type === "internal" && res.data.target) {
              let link = props.items[res.data.target];
              if (!link || !link.meta.ZUID) {
                search(res.data.target);
              } else {
                setState({
                  ...state.current,
                  internalLinkOptions: [
                    ...state.current.internalLinkOptions,
                    {
                      value: link.meta.ZUID,
                      text: link.web.path
                    }
                  ]
                });
              }
            }

            let relNoFollow = false;
            let targetBlank = false;
            res.data.source.split(";").forEach(sourceField => {
              if (sourceField === "rel:true") {
                relNoFollow = true;
              } else if (sourceField === "target:_blank") {
                targetBlank = true;
              }
            });

            setState({
              ...state.current,
              ZUID: res.data.ZUID,
              type: res.data.type,
              parentZUID: res.data.parentZUID,
              label: res.data.label,
              metaTitle: res.data.metaTitle || res.data.label,
              targetBlank,
              relNoFollow,
              target: res.data.target
            });
          }
        }
      })
      .catch(err => {
        console.error(err);
        props.dispatch(
          notify({
            message: "There was an issue loading this link",
            kind: "error"
          })
        );
        setState({
          ...state.current,
          loading: false
        });
      });
  }

  function saveLink() {
    setState({ ...state.current, saving: true });

    const source = [];
    if (state.current.relNoFollow) {
      source.push("rel:true");
    }
    if (state.current.targetBlank) {
      source.push("target:_blank");
    }

    const params = {
      ZUID: state.current.ZUID,
      type: state.current.type,
      parentZUID: state.current.parentZUID,
      label: state.current.label,
      metaTitle: state.current.metaTitle,
      source: source.join(";"),
      target: state.current.target
    };

    return request(`${CONFIG.API_INSTANCE}/content/links/${params.ZUID}`, {
      method: "PUT",
      json: true,
      body: params
    })
      .then(res => {
        if (res.error) {
          setState({ ...state.current, saving: false });
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
          props.dispatch(
            notify({
              message: `Error saving link: ${message}`,
              kind: "error"
            })
          );
        } else {
          setState({ ...state.current, saving: false });
          props.dispatch(notify({ message: "Saved link", kind: "save" }));
        }
      })
      .catch(err => {
        console.error(err);
        setState({ ...state.current, saving: false });
        props.dispatch(notify({ message: "Error saving link", kind: "error" }));
      });
  }

  function search(term) {
    return request(`${CONFIG.API_INSTANCE}/search/items?q=${term}`)
      .then(res => {
        if (res.status !== 200) {
          props.dispatch(
            notify({
              message: "Error fetching API",
              kind: "error"
            })
          );
          throw res;
        }

        const searchResults = res.data
          .filter(item => item.web.path)
          .map(item => {
            return {
              value: item.meta.ZUID,
              text: item.web.path
            };
          });

        const dedupeOptions = [
          ...state.current.internalLinkOptions,
          ...searchResults
        ].reduce((acc, el) => {
          if (!acc.find(opt => opt.value === el.value)) {
            acc.push(el);
          }

          return acc;
        }, []);

        setState({
          ...state.current,
          internalLinkOptions: dedupeOptions
        });

        return res;
      })
      .catch(err => {
        console.error(err);
        props.dispatch(
          notify({
            message: "Failed loading API",
            kind: "error"
          })
        );
      });
  }

  function onChange(value, name) {
    setState({
      ...state.current,
      [name]: value
    });
  }

  function deleteLink() {
    return request(`${CONFIG.API_INSTANCE}/content/links/${props.linkZUID}`, {
      method: "DELETE",
      json: true
    }).then(res => {
      props.dispatch(notify({ message: "Deleted Link", kind: "save" }));
      history.push("/content");
    });
  }

  return (
    <section className={styles.Editor}>
      <WithLoader condition={!state.current.loading} message="Loading Link">
        <Card className={styles.LinkEdit}>
          <CardHeader className={styles.EditorHeader}>
            {state.current.type === "internal" && <h2>Internal Link</h2>}
            {state.current.type === "external" && <h2>External Link</h2>}
          </CardHeader>
          <CardContent className={styles.CardContent}>
            <FieldTypeInternalLink
              className={styles.Row}
              name="parentZUID"
              label="Select a parent for your link"
              value={state.current.parentZUID}
              options={state.current.internalLinkOptions.filter(
                op => op.value !== state.current.target
              )}
              onChange={onChange}
              onSearch={search}
            />

            {state.current.type === "internal" ? (
              <FieldTypeInternalLink
                className={styles.Row}
                name="target"
                label="Select an item to link to"
                value={state.current.target}
                options={state.current.internalLinkOptions}
                onChange={onChange}
                onSearch={search}
              />
            ) : (
              <FieldTypeUrl
                className={styles.Row}
                label="Provide an external URL to link to"
                name="target"
                value={state.current.target}
                onChange={onChange}
                maxLength={500}
              />
            )}

            <FieldTypeText
              className={styles.Row}
              label="Link title"
              name="metaTitle"
              value={state.current.metaTitle}
              onChange={value => {
                setState({
                  ...state.current,
                  label: value,
                  metaTitle: value
                });
              }}
            />
            <label className={styles.Checkboxes}>
              <Input
                type="checkbox"
                name="targetBlank"
                checked={state.current.targetBlank}
                onClick={evt => {
                  onChange(evt.target.checked, "targetBlank");
                }}
              />
              target = _blank
            </label>
            <label className={styles.Checkboxes}>
              <Input
                type="checkbox"
                name="rel"
                checked={state.current.relNoFollow}
                onClick={evt => {
                  onChange(evt.target.checked, "relNoFollow");
                }}
              />
              rel = nofollow
            </label>
          </CardContent>
          <CardFooter className={styles.LinkEditActions}>
            <Button
              kind="save"
              disabled={state.current.saving}
              onClick={saveLink}
            >
              Save Changes
            </Button>
            {/* <Button
              kind="warn"
              disabled={state.current.saving}
              onClick={deleteLink}
            >
              Delete
            </Button> */}
          </CardFooter>
        </Card>
      </WithLoader>
    </section>
  );
}

export default connect((state, props) => {
  return {
    linkZUID: props.match.params.linkZUID,
    items: state.content
  };
})(LinkEdit);
