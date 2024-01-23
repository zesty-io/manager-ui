import { memo, useCallback, useEffect, useMemo, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppLink } from "@zesty-io/core/AppLink";
import { ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { Field } from "./Field";
import { useGetContentModelFieldsQuery } from "../../../../../../shell/services/instance";
import { FieldError } from "./FieldError";
import { ContentFieldErrorsContext } from "../../../../../../shell/contexts/contentFieldErrorsContext";

import styles from "./Editor.less";

export const MaxLengths = {
  text: 150,
  link: 2000,
  textarea: 16000,
  wysiwyg_basic: 0,
  wysiwyg_advanced: 0,
};

export const Editor = memo(
  ({ active, scrolled, model, itemZUID, modelZUID, saveClicked }) => {
    const dispatch = useDispatch();
    const { fieldErrors } = useContext(ContentFieldErrorsContext);
    const isNewItem = itemZUID.slice(0, 3) === "new";
    const { data: fields } = useGetContentModelFieldsQuery(modelZUID);
    const item = useSelector((state) => state.content[itemZUID]);

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
      <ThemeProvider theme={theme}>
        <div className={styles.Fields}>
          {saveClicked && (
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
                    // onSave={onSave}
                    value={item?.data?.[field.name]}
                    version={item?.meta?.version}
                    langID={item?.meta?.langID}
                    errors={fieldErrors[field.name]}
                    maxLength={MaxLengths[field.datatype]}
                    isFirstTextField={
                      firstTextField && firstTextField.name === field.name
                    }
                    isDataSet={model?.type !== "dataset"}
                    isFirstContentField={
                      firstContentField && firstContentField.name === field.name
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
  }
);
