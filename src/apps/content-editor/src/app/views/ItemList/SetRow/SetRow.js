import React from "react";
import { useHistory } from "react-router-dom";
import cx from "classnames";
import { connect } from "react-redux";

import { DateCell } from "./DateCell";
import { ImageCell } from "./ImageCell";
import { FileCell } from "./FileCell";
import { LinkCell } from "./LinkCell";
import { SortCell } from "./SortCell";
import { TextCell } from "./TextCell";
import { WYSIWYGcell } from "./WYSIWYGcell";
import { ToggleCell } from "./ToggleCell";
import { ColorCell } from "./ColorCell";
import { OneToOneCell } from "./OneToOneCell";
import { OneToManyCell } from "./OneToManyCell";
import { DropdownCell } from "./DropdownCell";
import { InternalLinkCell } from "./InternalLinkCell";
import { PublishStatusCell } from "./PublishStatusCell";

import styles from "./SetRow.less";
export default connect()(function SetRow(props) {
  let history = useHistory();

  const item = props.allItems[props.itemZUID];

  const selectRow = (name, value) => {
    if (name && typeof value != "undefined") {
      // props.onChange(props.itemZUID, name, value);
    } else {
      if (props.itemZUID.slice(0, 3) === "new") {
        history.push(`/content/${props.modelZUID}/new`);
      } else {
        history.push(`/content/${props.modelZUID}/${props.itemZUID}`);
      }
    }
  };

  return (
    <article
      className={cx(styles.SetRow, props.isDirty && styles.Dirty)}
      style={{ ...props.style }}
    >
      <PublishStatusCell
        type={props.model && props.model.type ? props.model.type : null}
        item={item}
      />
      <div className={styles.Cells} onClick={selectRow}>
        {props.fields.map(field => {
          switch (field.datatype) {
            case "one_to_one":
              return (
                <OneToOneCell
                  key={field.name + props.itemZUID}
                  className={styles.Cell}
                  field={field}
                  loadItem={props.loadItem}
                  value={props.data[field.name]}
                  allItems={props.allItems}
                  allFields={props.allFields}
                />
              );

            case "one_to_many":
              return (
                <OneToManyCell
                  key={field.name + props.itemZUID}
                  className={styles.Cell}
                  onRemove={(value, name) => {
                    return props.onChange(props.itemZUID, name, value);
                  }}
                  value={props.data[field.name] || ""}
                  name={field.name}
                  field={field}
                  settings={field.settings}
                  allItems={props.allItems}
                  allFields={props.allFields}
                />
              );

            case "dropdown":
              return (
                <DropdownCell
                  key={field.name + props.itemZUID}
                  className={styles.Cell}
                  field={field}
                  value={props.data[field.name]}
                />
              );

            case "internal_link":
              return (
                <InternalLinkCell
                  key={field.name + props.itemZUID}
                  className={styles.Cell}
                  field={field}
                  relatedItemZUID={props.data[field.name]}
                  allItems={props.allItems}
                  searchItem={props.searchItem}
                />
              );

            case "wysiwyg_advanced":
            case "wysiwyg_basic":
            case "article_writer":
            case "markdown":
              return (
                <div className={styles.Cell} key={field.name + props.itemZUID}>
                  <WYSIWYGcell value={props.data[field.name]} />
                </div>
              );

            case "text":
            case "textarea":
            case "uuid":
              return (
                <div className={styles.Cell} key={field.name + props.itemZUID}>
                  <TextCell value={props.data[field.name]} />
                </div>
              );

            case "files":
              return (
                <FileCell
                  key={field.name + props.itemZUID}
                  className={styles.Cell}
                  data={props.data[field.name]}
                  dispatch={props.dispatch}
                />
              );

            case "images":
              return (
                <ImageCell
                  key={field.name + props.itemZUID}
                  className={styles.Cell}
                  value={props.data[field.name]}
                />
              );

            case "yes_no":
              return (
                <ToggleCell
                  key={field.name + props.itemZUID}
                  className={cx("ToggleCell", styles.Cell)}
                  name={field.name}
                  field={field}
                  value={props.data[field.name]}
                  onChange={(value, name) =>
                    props.onChange(props.itemZUID, name, value)
                  }
                />
              );

            case "color":
              return (
                <ColorCell
                  key={field.name + props.itemZUID}
                  className={styles.Cell}
                  value={props.data[field.name]}
                />
              );

            case "sort":
              return (
                <SortCell
                  key={field.name + props.itemZUID}
                  className={cx("SortCell", styles.Cell)}
                  name={field.name}
                  value={props.data[field.name]}
                  onChange={(value, name) => {
                    return props.onChange(props.itemZUID, name, value);
                  }}
                />
              );

            case "link":
              return (
                <LinkCell
                  key={field.name + props.itemZUID}
                  className={styles.Cell}
                  value={props.data[field.name]}
                />
              );

            case "date":
            case "datetime":
              return (
                <DateCell
                  key={field.name + props.itemZUID}
                  className={styles.Cell}
                  value={props.data[field.name]}
                />
              );
              break;

            default:
              return (
                <span
                  key={field.name + props.itemZUID}
                  className={cx(styles.Cell, styles.DefaultCell)}
                >
                  {props.data[field.name]}
                </span>
              );
          }
        })}
      </div>
    </article>
  );
});

// export class SetRow extends Component {

//   selectRow = (name, value) => {
//     if (name && typeof value != "undefined") {
//       // props.onChange(props.itemZUID, name, value);
//     } else {
//       if (props.itemZUID.slice(0, 3) === "new") {
//         window.location = `/content/${props.modelZUID}/new`;
//       } else {
//         window.location = `/content/${props.modelZUID}/${props.itemZUID}`;
//       }
//     }
//   };

//   componentDidMount() {
//     // TODO: Replace individual row lookup with instance level publishing records
//     // const item = props.allItems[props.itemZUID];
//     // if (item && !item.publishing) {
//     //   props.loadItemPublishData(props.modelZUID, props.itemZUID);
//     // }
//   }

//   render() {

//   }
// }
