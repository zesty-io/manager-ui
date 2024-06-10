import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { AppLink } from "@zesty-io/core/AppLink";
import { ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { Breadcrumbs } from "shell/components/global-tabs/components/Breadcrumbs";
import { Field } from "./Field";
import { FieldError } from "./FieldError";

import styles from "./Editor.less";
import { cloneDeep } from "lodash";
import { useGetContentModelFieldsQuery } from "../../../../../../shell/services/instance";

export const MaxLengths = {
  text: 150,
  link: 2000,
  textarea: 16000,
  wysiwyg_basic: 0,
  wysiwyg_advanced: 0,
  fontawesome: 150,
  markdown: 0,
  article_writer: 0,
};

export default memo(function Editor({
  active,
  scrolled,
  item,
  model,
  onSave,
  itemZUID,
  modelZUID,
  saveClicked,
  onUpdateFieldErrors,
  fieldErrors,
  hasErrors,
}) {
  const dispatch = useDispatch();
  const isNewItem = itemZUID.slice(0, 3) === "new";
  const { data: fields } = useGetContentModelFieldsQuery(modelZUID);
  const [isLoaded, setIsLoaded] = useState(false);

  const activeFields = useMemo(() => {
    if (fields?.length) {
      return fields.filter((field) => !field.deletedAt);
    }

    return [];
  }, [fields]);

  const firstTextField = useMemo(() => {
    if (activeFields?.length) {
      return activeFields.find((field) => field.datatype === "text");
    }
  }, [activeFields]);

  const firstContentField = useMemo(() => {
    if (activeFields?.length) {
      return activeFields.find(
        (field) =>
          field.datatype === "textarea" ||
          field.datatype === "article_writer" ||
          field.datatype === "markdown" ||
          field.datatype.includes("wysiwyg")
      );
    }
  });

  const onChange = useCallback(
    (value, name) => {
      if (!name) {
        throw new Error("Input is missing name attribute");
      }

      const field = activeFields?.find((field) => field.name === name);
      const fieldMaxLength =
        field?.settings?.maxCharLimit ?? MaxLengths[field?.datatype];
      const errors = cloneDeep(fieldErrors);

      // Remove the required field error message when a value has been added
      if (field?.required) {
        if (field?.datatype === "yes_no" && value !== null) {
          errors[name] = {
            ...(errors[name] ?? {}),
            MISSING_REQUIRED: false,
          };
        } else if (field?.datatype !== "yes_no" && value) {
          errors[name] = {
            ...(errors[name] ?? {}),
            MISSING_REQUIRED: false,
          };
        }
      }

      // Validate character length
      if (fieldMaxLength) {
        if (value.length > fieldMaxLength) {
          errors[name] = {
            ...(errors[name] ?? []),
            EXCEEDING_MAXLENGTH: value.length - fieldMaxLength,
          };
        } else {
          errors[name] = { ...(errors[name] ?? []), EXCEEDING_MAXLENGTH: 0 };
        }
      }

      onUpdateFieldErrors(errors);

      // Always dispatch the data update
      dispatch({
        type: "SET_ITEM_DATA",
        itemZUID: itemZUID,
        key: name,
        // convert empty strings to null
        value: value === "" ? null : value,
      });

      // If we are working with a new item
      if (isNewItem) {
        if (firstTextField && firstTextField.name === name) {
          dispatch({
            type: "SET_ITEM_WEB",
            itemZUID,
            key: "metaLinkText",
            value: value,
          });
          dispatch({
            type: "SET_ITEM_WEB",
            itemZUID,
            key: "metaTitle",
            value: value,
          });

          // Datasets do not get path parts
          if (model?.type !== "dataset") {
            dispatch({
              type: "SET_ITEM_WEB",
              itemZUID,
              key: "pathPart",
              value: value
                .trim()
                .toLowerCase()
                .replace(
                  /'|-|"|@|%|\(|\)|:|;|\{|\}|\[|\]|\*|\$|!|,|¿|¡|`|™|©|®|€/g,
                  ""
                )
                .replace(/\&/g, "and")
                .replace("æ", "ae")
                .replace("œ", "oe")
                .replace(/å|à|á|â|ä/g, "a")
                .replace(/è|é|ê|ë/g, "e")
                .replace(/ì|í|î|ï/g, "i")
                .replace(/ñ/, "n")
                .replace(/ò|ó|ô|ö/g, "o")
                .replace(/ù|ú|û|ü/g, "u")
                .replace(/\+/g, "plus")
                .replace(/\s+/g, " ") // Important this is before hyphen replacement, this prevent doubling or trippling up hyphens due to mulitple spaces
                .replace(/[^a-zA-Z0-9]/g, "-"),
            });
          }
        }

        if (firstContentField && firstContentField.name === name) {
          dispatch({
            type: "SET_ITEM_WEB",
            itemZUID,
            key: "metaDescription",
            value: value.replace(/<[^>]*>/g, "").slice(0, 160),
          });
        }
      }
    },
    [fieldErrors]
  );

  const applyDefaultValuesToItemData = useCallback(() => {
    activeFields.forEach((field) => {
      if (field.datatype === "sort") {
        dispatch({
          type: "SET_ITEM_DATA",
          itemZUID: itemZUID,
          key: field.name,
          value: 0,
        });
      }

      if (
        field?.settings?.defaultValue !== null &&
        field?.settings?.defaultValue !== undefined
      ) {
        dispatch({
          type: "SET_ITEM_DATA",
          itemZUID: itemZUID,
          key: field.name,
          value: field.settings.defaultValue,
        });
      }

      setIsLoaded(true);
    });
  }, [activeFields, itemZUID]);

  useEffect(() => {
    if (isNewItem) {
      applyDefaultValuesToItemData();
    } else {
      setIsLoaded(true);
    }
  }, [isNewItem, setIsLoaded, applyDefaultValuesToItemData]);

  if (!isLoaded) return null;

  return (
    <ThemeProvider theme={theme}>
      <div className={styles.Fields}>
        {saveClicked && hasErrors && (
          <FieldError errors={fieldErrors} fields={activeFields} />
        )}

        {activeFields.length ? (
          activeFields.map((field) => {
            return (
              <div
                key={`${field.ZUID}`}
                id={field.ZUID}
                className={styles.Field}
              >
                <Field
                  ZUID={field.ZUID}
                  contentModelZUID={field.contentModelZUID}
                  active={active === field.ZUID}
                  name={field.name}
                  label={field.label}
                  description={field.description}
                  required={field.required}
                  relatedFieldZUID={field.relatedFieldZUID}
                  relatedModelZUID={field.relatedModelZUID}
                  datatype={field.datatype}
                  options={field.options}
                  settings={field.settings}
                  onChange={onChange}
                  onSave={onSave}
                  item={item}
                  langID={item?.meta?.langID}
                  errors={fieldErrors[field.name]}
                  maxLength={
                    field.settings?.maxCharLimit ?? MaxLengths[field.datatype]
                  }
                />
              </div>
            );
          })
        ) : (
          <div className={styles.NoFields}>
            <h1 className={styles.Display}>No fields have been added</h1>
            <h2 className={styles.SubHead}>
              Use the{" "}
              <AppLink to={`/schema/${modelZUID}`}>Schema Builder</AppLink> to
              define your items content
            </h2>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
});
