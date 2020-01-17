import React, { useState, useEffect, useReducer } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import cx from "classnames";

import { request } from "utility/request";
import { notify } from "shell/store/notifications";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { FieldTypeBinary } from "@zesty-io/core/FieldTypeBinary";
import { Button } from "@zesty-io/core/Button";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";

import { fetchParents } from "../../../store/parents";
import { createModel } from "../../../store/schemaModels";
import { formatName } from "../../../store/schemaFields";

const SCHEMA_TYPES = [
  {
    value: "templateset",
    html:
      '<i class="fas fa-file" aria-hidden="true"></i>&nbsp;Single Page Model'
  },
  {
    value: "pageset",
    html:
      '<i class="fas fa-list-alt" aria-hidden="true"></i>&nbsp;Multi Page Model'
  },
  {
    value: "dataset",
    html:
      '<i class="fas fa-database" aria-hidden="true"></i>&nbsp;Headless Data Model'
  }
];

import styles from "./SchemaCreate.less";
export default connect(state => {
  return {
    user: state.user,
    parents: state.parents.map(p => {
      return {
        value: p.ZUID,
        text: p.label
      };
    })
  };
})(function SchemaCreate(props) {
  let history = useHistory();

  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [listed, setListed] = useState(true);
  const [parent, setParent] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    props.dispatch(fetchParents());
  }, []);

  const [{ url, multiple, type }, setType] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "url":
          return {
            ...state,
            url: action.payload,
            type: action.payload
              ? state.multiple
                ? "pageset"
                : "templateset"
              : "dataset"
          };
        case "multiple":
          return {
            ...state,
            multiple: action.payload,
            type: state.url
              ? action.payload
                ? "pageset"
                : "templateset"
              : "dataset"
          };
        case "type":
          return { ...state, type: action.payload };
        default:
          return state;
      }
    },
    {
      url: 0,
      multiple: 0,
      type: "dataset"
    }
  );

  return (
    <section className={styles.SchemaCreate}>
      {/* {props.user.first_time && (
        <Card className={styles.Card}>
          <CardHeader>
            <h1 className={styles.display}>
              Welcome to your new instance. Lets get started by creating your
              first content model.
            </h1>
          </CardHeader>
          <CardContent>
            <p>
              Content models are what you will use to create a structure for
              your content editors to enter their content. You get to design
              what fields and requirments are provided to you the content
              editors. The way you design your models also effects your overall
              instance structure. e.g. Webpage URLs and API endpoints.
            </p>
          </CardContent>
        </Card>
      )} */}

      <Card className={styles.Card}>
        <CardHeader>
          <h1 className={styles.headline}>
            You are creating a new content model
          </h1>
        </CardHeader>
        <CardContent className={styles.CardContent}>
          <section className={cx(styles.Step, styles.SchemaType)}>
            <h2 className={styles.StepTitle}>1. Model Type</h2>
            <p className={styles.StepDesc}>
              There are three different types of models. The type you choose
              affects how the admin interface displays, content items render and
              urls are routed.
            </p>

            <div className={styles.questionnaire}>
              <FieldTypeBinary
                name="url"
                label="Will this content be a public webpage and need a url?"
                offValue={"No"}
                onValue={"Yes"}
                value={url}
                onChange={(name, val) =>
                  setType({
                    type: "url",
                    payload: val
                  })
                }
              />
            </div>

            <div className={styles.questionnaire}>
              <FieldTypeBinary
                name="multiple"
                label="Will this content have multiple entries?"
                offValue={"No"}
                onValue={"Yes"}
                value={multiple}
                onChange={(name, val) =>
                  setType({
                    type: "multiple",
                    payload: val
                  })
                }
              />
            </div>

            <FieldTypeDropDown
              name="type"
              label="Selected Model Type"
              value={type}
              onChange={(name, val) =>
                setType({
                  type: "type",
                  payload: val
                })
              }
              options={SCHEMA_TYPES}
              error={errors["type"]}
            />

            <main className={cx(styles.Types)}>
              <div
                className={cx(
                  "Type",
                  styles.Type,
                  type === "templateset" ? styles.selected : styles.hidden
                )}
              >
                <h3>Pages are individually routed</h3>
                <p>
                  <em>e.g. Homepages, Landing Pages, Unique Page Designs</em>
                </p>
                <p>
                  The Single Page Model represents a set of single pages of
                  content. Each page created in this model can live in separate
                  places on a website. Which means they can also have different
                  page parents.
                </p>

                <p>
                  A template file will be created which is shared by all pages
                  created in this model.
                </p>
              </div>

              <div
                className={cx(
                  "Type",
                  styles.Type,
                  type === "pageset" ? styles.selected : styles.hidden
                )}
              >
                <h3>Pages are routed as a group</h3>
                <p>
                  <em>e.g. Blog Posts, Team Members, or Services.</em>
                </p>

                <p>
                  All content created in this model is routed to a single page
                  parent. For example articles to a category page or team
                  members to a team page.
                </p>

                <p>
                  A template file will be created which is shared by all pages
                  created in this model.
                </p>
              </div>

              <div
                className={cx(
                  "Type",
                  styles.Type,
                  type === "dataset" ? styles.selected : styles.hidden
                )}
              >
                <h3>No routing</h3>
                <p>
                  <em>e.g. Tags, Categories, API data</em>
                </p>
                <p>
                  Headless Data Models typically represent data that can be
                  referenced in other content items inside of your instance or
                  will be used as headless API data consumed by external
                  clients. They are useful for relational or miscellaneous
                  grouping of data.
                </p>

                <p>
                  Headless models do not have views therefore no template file
                  is created.
                </p>
              </div>
            </main>

            {errors["type"] && <p className={styles.error}>{errors["type"]}</p>}
          </section>

          <section className={cx(styles.Step, styles.SchemaMeta)}>
            <h2 className={styles.StepTitle}>2. Model Description</h2>
            <p className={styles.StepDesc}>
              Name and describe your model. This will be displayed to content
              editors providing them insight into the purpose of this model.
            </p>

            <FieldTypeText
              name="label"
              label="Display Name"
              description="This is what is shown to content editors"
              placeholder=""
              value={label}
              maxLength="100"
              onChange={(name, value) => {
                setLabel(value);
                // When changing the label update the reference name as well
                setName(formatName(value));
              }}
              error={errors["label"]}
            />

            <FieldTypeText
              name="name"
              label="Reference Name"
              description="This is what is used to reference this model in Parsley"
              placeholder=""
              value={name}
              maxLength="100"
              onChange={(name, value) => setName(formatName(value))}
              error={errors["name"]}
            />

            <FieldTypeTextarea
              name="description"
              label="Description"
              description="A description of this model is shown to content editors. It can be helpful to provide context and explain what this model is used for."
              value={description}
              maxLength={500}
              onChange={(name, value) => setDescription(value)}
            />
          </section>

          <section className={cx(styles.Step, styles.SchemaMeta)}>
            <h2 className={styles.StepTitle}>3. Model Parent</h2>
            <p className={styles.StepDesc}>
              Parenting a model will affect how it displays in the admin
              navigation and default routing for this model's items.
            </p>

            <FieldTypeDropDown
              name="parent"
              label="Select this model's parent"
              onChange={(name, value) => setParent(value)}
              options={props.parents}
            />

            <div className={styles.questionnaire}>
              <FieldTypeBinary
                name="listed"
                label="Should this model be listed?"
                description="Listed models have their content items available to programatic
                navigation calls."
                offValue="No"
                onValue="Yes"
                value={Number(listed)}
                onChange={() => setListed(!listed)}
              />
            </div>
          </section>
        </CardContent>

        <CardFooter>
          <Button
            kind="save"
            onClick={() => {
              const errors = [];

              if (!type || type == 0) {
                errors["type"] =
                  "Select which type of model you would like to create.";
              }
              if (!label) {
                errors["label"] =
                  "Provide a label for this model to display to content editors.";
              }
              if (!name) {
                errors["name"] =
                  "Provide a reference name for using in your templates.";
              }

              if (Object.keys(errors).length) {
                setErrors(errors);
                return;
              }

              props
                .dispatch(
                  createModel({
                    parentZUID: parent,
                    name,
                    label,
                    description,
                    listed,
                    type
                  })
                )
                .then(res => {
                  if (res.status === 200) {
                    notify({
                      kind: "save",
                      message: `Created ${label} model`
                    });

                    if (res.data.ZUID) {
                      if (type === "templateset") {
                        // Create initial item
                        request(
                          `${CONFIG.API_INSTANCE}/content/models/${res.data.ZUID}/items`,
                          {
                            method: "POST",
                            json: true,
                            body: {
                              data: {},
                              web: {
                                canonicalTagMode: 1,
                                metaLinkText: label,
                                metaTitle: label,
                                pathPart: name,
                                parentZUID: parent
                              },
                              meta: {
                                contentModelZUID: res.data.ZUID,
                                createdByUserZUID: props.user.user_zuid
                              }
                            }
                          }
                        );
                      }

                      history.push(`/schema/${res.data.ZUID}`);
                    } else {
                      notify({
                        kind: "error",
                        message: `Model ${label} is missing ZUID.`
                      });
                    }
                  } else {
                    notify({
                      kind: "error",
                      message: `Failed creating ${label} model. ${res.error}`
                    });
                  }
                })
                .catch(err => {
                  console.error(err);
                  notify({
                    kind: "error",
                    message: `Network error occured. Failed to create ${label} model.`
                  });
                });
            }}
          >
            <FontAwesomeIcon icon={faPlus} />
            Create New Model
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
});
