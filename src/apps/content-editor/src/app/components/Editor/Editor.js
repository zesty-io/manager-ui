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
import { unescape } from "lodash";
import { Breadcrumbs } from "shell/components/global-tabs/components/Breadcrumbs";
import { Field } from "./Field";
import { FieldError } from "./FieldError";

import styles from "./Editor.less";
import { cloneDeep } from "lodash";
import { useGetContentModelFieldsQuery } from "../../../../../../shell/services/instance";
import { DYNAMIC_META_FIELD_NAMES } from "../../views/ItemEdit/Meta";

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
  onUpdateFieldErrors,
  fieldErrors,
}) {
  const dispatch = useDispatch();
  const isNewItem = itemZUID.slice(0, 3) === "new";
  const { data: fields } = useGetContentModelFieldsQuery(modelZUID);
  const [isLoaded, setIsLoaded] = useState(false);

  const metaFields = useMemo(() => {
    if (fields?.length) {
      return fields.reduce((accu, curr) => {
        if (
          !curr.deletedAt &&
          DYNAMIC_META_FIELD_NAMES.includes(curr.name.toLowerCase())
        ) {
          accu[curr.name] = curr;
        }

        return accu;
      }, {});
    }

    return {};
  }, [fields]);

  const activeFields = useMemo(() => {
    if (fields?.length) {
      return fields.filter(
        (field) =>
          !field.deletedAt &&
          ![
            "og_image",
            "og_title",
            "og_description",
            "tc_title",
            "tc_description",
          ].includes(field.name)
      );
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

      if (field?.settings?.minCharLimit) {
        if (value.length < field?.settings?.minCharLimit) {
          errors[name] = {
            ...(errors[name] ?? []),
            LACKING_MINLENGTH: field?.settings?.minCharLimit - value.length,
          };
        } else {
          errors[name] = { ...(errors[name] ?? []), LACKING_MINLENGTH: 0 };
        }
      }

      if (field?.settings?.regexMatchPattern) {
        const regex = new RegExp(field?.settings?.regexMatchPattern);
        if (!regex.test(value)) {
          errors[name] = {
            ...(errors[name] ?? []),
            REGEX_PATTERN_MISMATCH: field?.settings?.regexMatchErrorMessage,
          };
        } else {
          errors[name] = {
            ...(errors[name] ?? []),
            REGEX_PATTERN_MISMATCH: "",
          };
        }
      }

      if (field?.settings?.regexRestrictPattern) {
        const regex = new RegExp(field?.settings?.regexRestrictPattern);
        if (regex.test(value)) {
          errors[name] = {
            ...(errors[name] ?? []),
            REGEX_RESTRICT_PATTERN_MATCH:
              field?.settings?.regexRestrictErrorMessage,
          };
        } else {
          errors[name] = {
            ...(errors[name] ?? []),
            REGEX_RESTRICT_PATTERN_MATCH: "",
          };
        }
      }

      if (
        field?.settings?.minValue !== null &&
        field?.settings?.maxValue !== null
      ) {
        if (
          value < field?.settings?.minValue ||
          value > field?.settings?.maxValue
        ) {
          errors[name] = {
            ...(errors[name] ?? []),
            INVALID_RANGE: `Value must be between ${field?.settings?.minValue} and ${field?.settings?.maxValue}`,
          };
        } else {
          errors[name] = {
            ...(errors[name] ?? []),
            INVALID_RANGE: "",
          };
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

          if ("og_title" in metaFields) {
            dispatch({
              type: "SET_ITEM_DATA",
              itemZUID,
              key: "og_title",
              value: value,
            });
          }

          if ("tc_title" in metaFields) {
            dispatch({
              type: "SET_ITEM_DATA",
              itemZUID,
              key: "tc_title",
              value: value,
            });
          }

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
          // Remove tags and replace MS smart quotes with regular quotes
          const cleanedValue = unescape(
            value
              ?.replace(/<[^>]*>/g, "")
              ?.replaceAll(/[\u2018\u2019\u201A]/gm, "'")
              ?.replaceAll("&rsquo;", "'")
              ?.replaceAll(/[\u201C\u201D\u201E]/gm, '"')
              ?.replaceAll("&ldquo;", '"')
              ?.replaceAll("&rdquo;", '"')
              ?.replaceAll("&nbsp;", " ")
              ?.slice(0, 160) || ""
          );

          dispatch({
            type: "SET_ITEM_WEB",
            itemZUID,
            key: "metaDescription",
            value: cleanedValue,
          });

          if ("og_description" in metaFields) {
            dispatch({
              type: "SET_ITEM_DATA",
              itemZUID,
              key: "og_description",
              value: cleanedValue,
            });
          }

          if ("tc_description" in metaFields) {
            dispatch({
              type: "SET_ITEM_DATA",
              itemZUID,
              key: "tc_description",
              value: cleanedValue,
            });
          }
        }
      }
    },
    [fieldErrors, metaFields]
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
                  minLength={field.settings?.minCharLimit ?? 0}
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
