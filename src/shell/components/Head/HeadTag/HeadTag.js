import { useState } from "react";

import { notify } from "shell/store/notifications";

import {
  saveHeadTag,
  deleteHeadTag,
  createHeadTag,
  addTagAttribute,
  deleteTagAttribute,
  updateTagAttribute,
  updateTagSort,
  updateTagType,
} from "shell/store/headTags";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSave,
  faSpinner,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import { Card, CardContent, CardFooter, CardHeader } from "@zesty-io/core/Card";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeSort } from "@zesty-io/core/FieldTypeSort";

import styles from "./HeadTag.less";
export const HeadTag = (props) => {
  const [saving, setSaving] = useState(false);

  const onCreate = () => {
    setSaving(true);

    props
      .dispatch(
        createHeadTag({
          ...props.tag,
          attributes: props.tag.attributes.reduce((acc, attr) => {
            acc[attr.key] = attr.value;
            return acc;
          }, {}),
        })
      )
      .then((res) => {
        props.dispatch(
          notify({
            message: res.data.error ? res.data.error : "New head tag created",
            kind: res.data.error ? "warn" : "success",
          })
        );

        setSaving(false);
      });
  };

  const onSave = () => {
    setSaving(true);

    props
      .dispatch(
        saveHeadTag({
          ...props.tag,
          // Revert shape of attributes to API expectations
          // Be careful not to mutate local props
          attributes: props.tag.attributes.reduce((acc, attr) => {
            acc[attr.key] = attr.value;
            return acc;
          }, {}),
        })
      )
      .then((res) => {
        props.dispatch(
          notify({
            message: res.error
              ? `Failed to update head tag. ${res.status}`
              : "Successfully updated head tag",
            kind: res.error ? "warn" : "success",
          })
        );

        setSaving(false);
      });
  };

  const onDelete = () => {
    props.dispatch(deleteHeadTag(props.tag.ZUID)).then((res) => {
      props.dispatch(
        notify({
          message: res.data.error ? res.data.error : "Head tag deleted",
          kind: res.data.error ? "warn" : "success",
        })
      );
    });
  };

  const onCancel = () => {
    props.dispatch({
      type: "DELETE_HEADTAG",
      id: props.tag.ZUID,
    });
  };

  let { tag, dispatch } = props;
  return (
    <Card data-cy="tagCard" className={styles.HeadTag}>
      <CardHeader className={styles.CardHeader}>
        <FieldTypeDropDown
          className={styles.DropDown}
          name={tag.ZUID}
          label="Tag"
          onChange={(value) => dispatch(updateTagType(tag.ZUID, value))}
          value={tag.type}
          options={[
            { text: "Script", value: "script" },
            { text: "Meta", value: "meta" },
            { text: "Link", value: "link" },
          ]}
        />
        <FieldTypeSort
          value={tag.sort}
          name={tag.ZUID}
          label="Sort"
          className={styles.Sort}
          onChange={(value) => dispatch(updateTagSort(tag.ZUID, value))}
        />
        <Button
          kind="primary"
          onClick={() => dispatch(addTagAttribute(tag.ZUID))}
        >
          <FontAwesomeIcon icon={faPlus} /> Add attribute
        </Button>
        {tag.hasOwnProperty("createdAt") ? (
          <Button
            className={styles.Delete}
            onClick={onDelete}
            type="warn"
            id="DelteHeadtag"
          >
            <FontAwesomeIcon className={styles.Del} icon={faTrash} />
            Delete Tag
          </Button>
        ) : (
          <Button className={styles.Delete} onClick={onCancel} type="warn">
            <FontAwesomeIcon className={styles.Del} icon={faTrash} />
            Cancel
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {tag.attributes.map((attr, index) => {
          return (
            <div className={styles.Pair} key={index}>
              <FieldTypeText
                label="Attribute"
                id="Attribute"
                name={`tag-${tag.ZUID}-${index}-attr`}
                value={attr.key}
                disabled={attr.key === "custom"}
                onChange={(newKey) =>
                  dispatch(
                    updateTagAttribute(tag.ZUID, index, {
                      key: newKey,
                      value: attr.value,
                    })
                  )
                }
              />
              <FieldTypeText
                className={styles.Value}
                label="Value"
                name={`tag-${tag.ZUID}-${index}-val`}
                value={attr.value}
                disabled={attr.key === "custom"}
                onChange={(value) =>
                  dispatch(
                    updateTagAttribute(tag.ZUID, index, {
                      key: attr.key,
                      value: value,
                    })
                  )
                }
              />
              {attr.key !== "custom" ? (
                <Button
                  className={styles.Del}
                  onClick={() => dispatch(deleteTagAttribute(tag.ZUID, index))}
                  type="warn"
                >
                  <FontAwesomeIcon className={styles.Del} icon={faTrash} />
                </Button>
              ) : (
                <div style={{ width: "40px" }}></div>
              )}
            </div>
          );
        })}
      </CardContent>
      <CardFooter className={styles.CardFooter}>
        <Button
          type="save"
          id="SaveItemButton"
          disabled={saving}
          onClick={tag.hasOwnProperty("createdAt") ? onSave : onCreate}
        >
          {saving ? (
            <FontAwesomeIcon spin icon={faSpinner} />
          ) : (
            <FontAwesomeIcon icon={faSave} />
          )}
          {tag.hasOwnProperty("createdAt")
            ? "Save head tag"
            : "Create head tag"}
        </Button>
      </CardFooter>
    </Card>
  );
};
