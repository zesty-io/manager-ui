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
import { Breadcrumbs } from "shell/components/global-tabs/components/Breadcrumbs";
import { Field } from "./Field";
import { useGetContentModelFieldsQuery } from "../../../../../../shell/services/instance";
import { FieldError } from "./FieldError";

import styles from "./Editor.less";
import { cloneDeep } from "lodash";

export const MaxLengths = {
  text: 150,
  link: 2000,
  textarea: 16000,
};

export default memo(function Editor({
  active,
  scrolled,
  item,
  model,
  onSave,
  itemZUID,
  modelZUID,
  missingRequiredFieldNames,
}) {
  const dispatch = useDispatch();
  const isNewItem = itemZUID.slice(0, 3) === "new";
  const [fieldErrors, setFieldErrors] = useState({});
  const { data: fields } = useGetContentModelFieldsQuery(modelZUID);

  useEffect(() => {
    if (active) {
      scrollToField(active);
    }
  }, [active]);

  useEffect(() => {
    // Show the required field error message
    if (missingRequiredFieldNames?.length) {
      const errors = cloneDeep(fieldErrors);

      missingRequiredFieldNames?.forEach((fieldName) => {
        errors[fieldName] = {
          ...(errors[fieldName] ?? {}),
          MISSING_REQUIRED: true,
        };
      });

      setFieldErrors(errors);
    }
  }, [missingRequiredFieldNames]);

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

  const scrollToField = (fieldZUID) => {
    const node = document.getElementById(fieldZUID);
    if (node) {
      node.scrollIntoView({ behavior: "auto", block: "start" });
      node.querySelector("input") && node.querySelector("input").focus();

      //reset the active prop from the parent
      scrolled();
    }
  };

  const onChange = useCallback(
    (value, name) => {
      if (!name) {
        throw new Error("Input is missing name attribute");
      }

      const isFieldRequired = activeFields.find(
        (field) => field.name === name
      )?.required;
      const fieldDatatype = activeFields.find(
        (field) => field.name === name
      )?.datatype;
      const fieldMaxLength = MaxLengths[fieldDatatype];
      const errors = cloneDeep(fieldErrors);

      // Remove the required field error message when a value has been added
      if (isFieldRequired && value) {
        errors[name] = {
          ...(errors[name] ?? {}),
          MISSING_REQUIRED: false,
        };
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

      setFieldErrors(errors);
      // Always dispatch the data update
      dispatch({
        type: "SET_ITEM_DATA",
        itemZUID: itemZUID,
        key: name,
        value: value,
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

  // This function will be built upon when default values are added to the schema builder
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
    });
  }, [activeFields, itemZUID]);

  useEffect(() => {
    if (isNewItem) {
      applyDefaultValuesToItemData();
    }
  }, [isNewItem]);

  return (
    <div className={styles.Fields}>
      <FieldError />
      {activeFields.length ? (
        activeFields.map((field) => {
          return (
            <div key={`${field.ZUID}`} id={field.ZUID} className={styles.Field}>
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
                maxLength={MaxLengths[field.datatype]}
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
  );
});
