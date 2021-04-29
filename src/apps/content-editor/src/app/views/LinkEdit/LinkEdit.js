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

function LinkEdit(props) {
  const history = useHistory();
  const isMounted = useRef(false);

  const [state, setState] = useState({
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
      if (props.linkZUID !== state.linkZUID) {
        console.log(props.linkZUID, state.linkZUID);
        setState({
          ...state,
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
      ...state,
      loading: true
    });

    return request(`${CONFIG.API_INSTANCE}/content/links/${linkZUID}`)
      .then(res => {
        if (isMounted.current) {
          setState({
            ...state,
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
                  ...state,
                  internalLinkOptions: [
                    ...state.internalLinkOptions,
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
                  ...state,
                  internalLinkOptions: [
                    ...state.internalLinkOptions,
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
              ...state,
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
          ...state,
          loading: false
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
      target: state.target
    };

    return request(`${CONFIG.API_INSTANCE}/content/links/${params.ZUID}`, {
      method: "PUT",
      json: true,
      body: params
    })
      .then(res => {
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
          props.dispatch(
            notify({
              message: `Error saving link: ${message}`,
              kind: "error"
            })
          );
        } else {
          setState({ ...state, saving: false });
          props.dispatch(notify({ message: "Saved link", kind: "save" }));
        }
      })
      .catch(err => {
        console.error(err);
        setState({ ...state, saving: false });
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
          ...state.internalLinkOptions,
          ...searchResults
        ].reduce((acc, el) => {
          if (!acc.find(opt => opt.value === el.value)) {
            acc.push(el);
          }

          return acc;
        }, []);

        setState(s => {
          return {
            ...s,
            internalLinkOptions: dedupeOptions
          };
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
      ...state,
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
              options={state.internalLinkOptions.filter(
                op => op.value !== state.target
              )}
              onChange={onChange}
              onSearch={search}
            />

            {state.type === "internal" ? (
              <FieldTypeInternalLink
                className={styles.Row}
                name="target"
                label="Select an item to link to"
                value={state.target}
                options={state.internalLinkOptions}
                onChange={onChange}
                onSearch={search}
              />
            ) : (
              <FieldTypeUrl
                className={styles.Row}
                label="Provide an external URL to link to"
                name="target"
                value={state.target}
                onChange={onChange}
                maxLength={500}
              />
            )}

            <FieldTypeText
              className={styles.Row}
              label="Link title"
              name="metaTitle"
              value={state.metaTitle}
              onChange={value => {
                setState({
                  ...state,
                  label: value,
                  metaTitle: value
                });
              }}
            />
            <label className={styles.Checkboxes}>
              <Input
                type="checkbox"
                name="targetBlank"
                checked={state.targetBlank}
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
                checked={state.relNoFollow}
                onClick={evt => {
                  onChange(evt.target.checked, "relNoFollow");
                }}
              />
              rel = nofollow
            </label>
          </CardContent>
          <CardFooter className={styles.LinkEditActions}>
            <Button kind="save" disabled={state.saving} onClick={saveLink}>
              Save Changes
            </Button>
            {/* <Button
              kind="warn"
              disabled={state.saving}
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
