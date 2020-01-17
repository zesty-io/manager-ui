import React, { useState } from "react";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { ConfirmDialog } from "@zesty-io/core/ConfirmDialog";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Button } from "@zesty-io/core/Button";
import { Url } from "@zesty-io/core/Url";
import { ToggleButton } from "@zesty-io/core/ToggleButton";

import { Parent } from "./settings/Parent";

import { notify } from "shell/store/notifications";

import {
  updateModel,
  saveModel,
  createModel,
  deleteModel,
  duplicateModel
} from "../../../../store/schemaModels";

import styles from "./SchemaMeta.less";
export default function SchemaMeta(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (name, val) => {
    props.dispatch(updateModel(props.model.ZUID, name, val));
  };

  const duplicate = () => {
    setLoading(true);
    props
      .dispatch(duplicateModel(props.model.ZUID))
      .then(res => {
        if (res.status === 200) {
          window.location = `/schema/${res.data.ZUID}/`;
        } else {
          notify({
            kind: "warn",
            message: res.error
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("SchemaMeta:duplicate:catch", err);
        notify({
          kind: "warn",
          message:
            err.message || `Failed to duplicate model: ${props.model.label}`
        });
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
              <i className="fas fa-cog" />
              &nbsp;
              {zesty.instance.settings.basic_content_api_enabled == 1 ? (
                <Url
                  target="_blank"
                  href={`${CONFIG.URL_PREVIEW}/-/instant/${props.model.ZUID}.json`}
                >
                  {`/-/instant/${props.model.ZUID}.json`}
                </Url>
              ) : (
                <Url href="/config/settings/developer/">Instant JSON API</Url>
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
                      notify({
                        kind: "save",
                        message: `Save ${props.model.label} changes`
                      });
                    } else {
                      console.error(res);
                      notify({
                        kind: "warn",
                        message: `${res.error}`
                      });
                    }
                    setLoading(false);
                  })
                  .catch(err => {
                    console.err(err);
                    notify({
                      kind: "warn",
                      message: `Failed saving ${props.model.label} changes. ${err.message}`
                    });
                    setLoading(false);
                  });
              }}
            >
              <i className="fas fa-save" aria-hidden="true" />
              Save Model
            </Button>
            <Button onClick={duplicate} disabled={loading}>
              {loading ? (
                <i className="fas fa-spinner" />
              ) : (
                <i className="fas fa-clone" />
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
            <i className="far fa-trash-alt" />
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
                    notify({
                      kind: "warn",
                      message:
                        err.message ||
                        `Failed to delete model: ${props.model.label}`
                    });
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
