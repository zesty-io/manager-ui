import { OneToManyOptions } from ".";
import { ContentModelField } from "../../services/types";
import { OneToOneOptions } from "../FieldTypeOneToOne";
import { ResolvedOption } from "./ResolvedOption";
import styles from "./Field.less";

export const resolveRelatedOptions = (
  fields: Record<string, ContentModelField>,
  items: any,
  fieldZUID: string,
  modelZUID: string,
  langID: number,
  value: any
): OneToManyOptions[] | OneToOneOptions[] => {
  // guard against absent data in state
  const field = fields && fields[fieldZUID];
  if (!field || !items) {
    return [];
  }

  return Object.keys(items)
    .map((itemZUID) => {
      if (
        items[itemZUID] &&
        items[itemZUID].meta &&
        items[itemZUID].meta.contentModelZUID === modelZUID &&
        // filter by content language
        (langID === items[itemZUID].meta.langID ||
          // ...unless option already selected
          value?.split(",").includes(itemZUID))
      ) {
        // Matching ItemZUID to languageZUID to get language code {key} to display in dropdown
        let langCode = "";
        if (items[itemZUID].siblings) {
          const match = Object.entries(items[itemZUID].siblings).find(
            (arr) => items[itemZUID].meta.ZUID === arr[1]
          );
          if (match) {
            langCode = match[0];
          }
        }

        return {
          value: itemZUID,
          inputLabel: items[itemZUID].data[field.name] || "",
          component: (
            <ResolvedOption
              modelZUID={modelZUID}
              itemZUID={itemZUID}
              html={
                <div
                  style={{
                    display: "inline-grid",
                    gridTemplateColumns: "minmax(50px, 100%) 41px",
                  }}
                >
                  <span
                    style={{ textOverflow: "ellipsis", overflow: "hidden" }}
                  >
                    {items[itemZUID].data[field.name]}
                  </span>
                  <em className={styles.Language}>&nbsp;{langCode}</em>
                </div>
              }
            />
          ),
        };
      }
    })
    .sort((a, b) => (a.inputLabel > b.inputLabel ? 1 : -1));
};
