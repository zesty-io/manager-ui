import React, { useState } from "react";

import { notify } from "../../../../../../../shell/store/notifications";

import {
  saveHeadTag,
  deleteHeadTag,
  createHeadTag
} from "../../../../store/headTags";
import {
  addTagAttribute,
  deleteTagAttribute,
  updateTagAttribute,
  updateTagSort,
  updateTagType
} from "../../../../store/headTags";

import { Button } from "@zesty-io/core/Button";
import { Card, CardContent, CardFooter, CardHeader } from "@zesty-io/core/Card";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeSort } from "@zesty-io/core/FieldTypeSort";

import styles from "./HeadTag.less";
export const HeadTag = props => {
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
          }, {})
        })
      )
      .then(res => {
        props.dispatch(
          notify({
            message: res.data.error ? res.data.error : "New head tag created",
            kind: res.data.error ? "warn" : "success"
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
          }, {})
        })
      )
      .then(res => {
        props.dispatch(
          notify({
            message: res.data.error
              ? `Failed to update head tag. ${res.data.status}`
              : "Successfully updated head tag",
            kind: res.data.error ? "warn" : "success"
          })
        );

        setSaving(false);
      });
  };

  const onDelete = () => {
    props.dispatch(deleteHeadTag(props.tag.ZUID)).then(res => {
      props.dispatch(
        notify({
          message: res.data.error ? res.data.error : "Head tag deleted",
          kind: res.data.error ? "warn" : "success"
        })
      );
    });
  };

  const onCancel = () => {
    props.dispatch({
      type: "DELETE_HEADTAG",
      id: props.tag.ZUID
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
          onChange={(name, value) => dispatch(updateTagType(tag.ZUID, value))}
          value={tag.type}
          options={[
            { text: "Script", value: "script" },
            { text: "Meta", value: "meta" },
            { text: "Link", value: "link" }
          ]}
        />
        <FieldTypeSort
          value={tag.sort}
          name={tag.ZUID}
          label="Sort"
          className={styles.Sort}
          onChange={(name, value) => dispatch(updateTagSort(tag.ZUID, value))}
        />
        <Button
          kind="primary"
          onClick={() => dispatch(addTagAttribute(tag.ZUID))}
        >
          <i className="fa fa-plus" /> Add attribute
        </Button>
        {tag.hasOwnProperty("createdAt") ? (
          <Button className={styles.Delete} onClick={onDelete} kind="warn">
            <i className={`fa fa-trash ${styles.Del}`} />
            Delete Tag
          </Button>
        ) : (
          <Button className={styles.Delete} onClick={onCancel} kind="warn">
            <i className={`fa fa-trash ${styles.Del}`} />
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
                name={`tag-${tag.ZUID}-${index}-attr`}
                value={attr.key}
                disabled={attr.key === "custom"}
                onChange={(name, newKey) =>
                  dispatch(
                    updateTagAttribute(tag.ZUID, index, {
                      key: newKey,
                      value: attr.value
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
                onChange={(name, value) =>
                  dispatch(
                    updateTagAttribute(tag.ZUID, index, {
                      key: attr.key,
                      value: value
                    })
                  )
                }
              />
              {attr.key !== "custom" ? (
                <Button
                  className={styles.Del}
                  onClick={() => dispatch(deleteTagAttribute(tag.ZUID, index))}
                  kind="warn"
                >
                  <i className={`fa fa-trash ${styles.Del}`} />
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
          kind="save"
          id="SaveItemButton"
          disabled={saving}
          onClick={tag.hasOwnProperty("createdAt") ? onSave : onCreate}
        >
          {saving ? (
            <i className="fa fa-spinner fa-spin" aria-hidden="true" />
          ) : (
            <i className="fas fa-save" aria-hidden="true" />
          )}
          {tag.hasOwnProperty("createdAt")
            ? "Save head tag"
            : "Create head tag"}
        </Button>
      </CardFooter>
    </Card>
  );
};
