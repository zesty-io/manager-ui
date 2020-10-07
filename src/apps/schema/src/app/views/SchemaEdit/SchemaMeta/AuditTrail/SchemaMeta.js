import React, { useState } from "react";
import { useHistory } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faClone } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { ConfirmDialog } from "@zesty-io/core/ConfirmDialog";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Button } from "@zesty-io/core/Button";
import { Url } from "@zesty-io/core/Url";
import { AppLink } from "@zesty-io/core/AppLink";

import { Parent } from "./settings/Parent";

import { notify } from "shell/store/notifications";

import {
  updateModel,
  saveModel,
  deleteModel,
  duplicateModel
} from "shell/store/models";

import styles from "./SchemaMeta.less";
export default function SchemaMeta(props) {
  let history = useHistory();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (val, name) => {
    props.dispatch(updateModel(props.model.ZUID, name, val));
  };

  const duplicate = () => {
    setLoading(true);
    props
      .dispatch(duplicateModel(props.model.ZUID))
      .then(res => {
        if (res.status === 200) {
          history.push(`/schema/${res.data.ZUID}/`);
        } else {
          props.dispatch(
            notify({
              kind: "warn",
              message: res.error
            })
          );
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("SchemaMeta:duplicate:catch", err);
        props.dispatch(
          notify({
            kind: "warn",
            message:
              err.message || `Failed to duplicate model: ${props.model.label}`
          })
        );
        setLoading(false);
      });
  };

  return (
    <aside className={styles.SchemaMeta}>
      <Card>
        <CardHeader>Model Settings</CardHeader>
        <CardContent>
          <label>
            <p>
              <FontAwesomeIcon icon={faCog} />
              &nbsp;
              {zestyStore.getState().instance.settings
                .basic_content_api_enabled == 1 ? (
                <Url
                  target="_blank"
                  href={`${CONFIG.URL_PREVIEW}/-/instant/${props.model.ZUID}.json`}
                >
                  {`/-/instant/${props.model.ZUID}.json`}
                </Url>
              ) : (
                <AppLink href="/settings/instance/developer">
                  Instant JSON API
                </AppLink>
              )}
            </p>
          </label>

          <FieldTypeText
            name="zuid"
            label="ZUID (Zesty Universal ID)"
            value={props.model.ZUID}
            disabled
          />

          <FieldTypeText
            name="label"
            label="Display label"
            value={props.model.label}
            onChange={update}
          />

          <FieldTypeText
            name="name"
            label="Parsley reference name (no spaces)"
            value={props.model.name}
            onChange={update}
          />

          <FieldTypeTextarea
            name="description"
            label="Description"
            value={props.model.description}
            maxLength={500}
            onChange={update}
          />

          {/* <label>
            <p>Display in "Add New Item"?</p>
            <ToggleButton
              name="listed"
              offValue="No"
              onValue="Yes"
              value={Number(props.model.listed)}
              onChange={() => update("listed", !props.model.listed)}
            />
          </label>

          <FieldTypeDropDown
            name="sort_by"
            label="Sort table by"
            options={props.fields.map(field => {
              return {
                text: field.label,
                value: field.ZUID
              };
            })}
            onChange={update}
          />

          <FieldTypeDropDown
            name="sort_direction"
            label="Sort direction"
            options={[
              {
                value: "ASC",
                text: "Ascending Order"
              },
              {
                value: "DSC",
                text: "Descending Order"
              }
            ]}
            onChange={update}
          /> */}

          <Parent parentZUID={props.model.parentZUID} onChange={update} />
        </CardContent>
        <CardFooter>
          <ButtonGroup>
            <Button
              kind="save"
              disabled={!props.model.dirty || loading}
              onClick={() => {
                setLoading(true);
                props
                  .dispatch(saveModel(props.model.ZUID, props.model))
                  .then(res => {
                    if (res.status === 200) {
                      props.dispatch(
                        notify({
                          kind: "save",
                          message: `Save ${props.model.label} changes`
                        })
                      );
                    } else {
                      console.error(res);
                      props.dispatch(
                        notify({
                          kind: "warn",
                          message: `${res.error}`
                        })
                      );
                    }
                    setLoading(false);
                  })
                  .catch(err => {
                    console.err(err);
                    props.dispatch(
                      notify({
                        kind: "warn",
                        message: `Failed saving ${props.model.label} changes. ${err.message}`
                      })
                    );
                    setLoading(false);
                  });
              }}
            >
              <FontAwesomeIcon icon={faSave} />
              Save Model
            </Button>
            <Button onClick={duplicate} disabled={loading}>
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} />
              ) : (
                <FontAwesomeIcon icon={faClone} />
              )}
              Duplicate Model
            </Button>
          </ButtonGroup>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>Delete Model</CardHeader>
        <CardContent>
          <p>
            Deleting a model is a permanent action that can not be undone. By
            doing so all content items created from this model will be deleted
            along with it. Ensure you want to do this action.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            kind="warn"
            onClick={() => setIsOpen(true)}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTrash} />
            Delete Model
          </Button>

          <ConfirmDialog
            isOpen={isOpen}
            prompt={`Are you sure you want to delete the model: ${props.model.label}?`}
          >
            <Button
              id="deleteConfirmButton"
              kind="warn"
              onClick={() => {
                props
                  .dispatch(deleteModel(props.model.ZUID))
                  .then(() => {
                    setIsOpen(false);
                  })
                  .catch(err => {
                    console.error(err);
                    setIsOpen(false);
                    props.dispatch(
                      notify({
                        kind: "warn",
                        message:
                          err.message ||
                          `Failed to delete model: ${props.model.label}`
                      })
                    );
                  });
              }}
            >
              Delete
            </Button>
            <Button
              id="deleteCancelButton"
              kind="cancel"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </ConfirmDialog>
        </CardFooter>
      </Card>
    </aside>
  );
}
