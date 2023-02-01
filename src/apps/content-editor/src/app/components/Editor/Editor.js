import React, { memo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { AppLink } from "@zesty-io/core/AppLink";
import { Breadcrumbs } from "shell/components/global-tabs/components/Breadcrumbs";
import { Field } from "./Field";

import styles from "./Editor.less";
export default memo(function Editor({
  active,
  fields,
  scrolled,
  item,
  model,
  onSave,
  modelZUID,
  itemZUID,
}) {
  const dispatch = useDispatch();
  const firstTextField = fields.find((field) => field.datatype === "text");
  const firstContentField = fields.find(
    (field) =>
      field.datatype === "textarea" ||
      field.datatype === "article_writer" ||
      field.datatype === "markdown" ||
      field.datatype.includes("wysiwyg")
  );

  useEffect(() => {
    if (active) {
      scrollToField(active);
    }
  }, [active]);

  const scrollToField = (fieldZUID) => {
    const node = document.getElementById(fieldZUID);
    if (node) {
      node.scrollIntoView({ behavior: "auto", block: "start" });
      node.querySelector("input") && node.querySelector("input").focus();

      //reset the active prop from the parent
      scrolled();
    }
  };

  const onChange = useCallback((value, name) => {
    if (value === null || name === null) return;
    if (!name) {
      throw new Error("Input is missing name attribute");
    }

    // Always dispatch the data update
    dispatch({
      type: "SET_ITEM_DATA",
      itemZUID: itemZUID,
      key: name,
      value: value,
    });

    // If we are working with a new item
    if (itemZUID.slice(0, 3) === "new") {
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
  }, []);

  return (
    <div className={styles.Fields}>
      {item.meta && item.meta.ZUID && <Breadcrumbs itemZUID={item.meta.ZUID} />}

      {fields.length ? (
        fields
          .filter((field) => !field.deletedAt)
          .map((field) => {
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
