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

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";

import { FieldTypeText } from "@zesty-io/material";
import { FieldTypeSort } from "@zesty-io/material";

import { FormControl, FormLabel, Select, MenuItem } from "@mui/material";

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
    <Card
      data-cy={tag.hasOwnProperty("createdAt") ? "tagCard" : "newTagCard"}
      className={styles.HeadTag}
      sx={{ m: 2 }}
    >
      <CardHeader
        title={
          <Box
            sx={{
              alignItems: "flex-end",
              display: "flex",
              gap: "8px",
            }}
          >
            <FormControl size="small" sx={{ width: "210px" }}>
              <FormLabel>Tag</FormLabel>
              <Select
                name={tag.ZUID}
                variant="outlined"
                displayEmpty
                value={tag.type}
                onChange={(e) =>
                  dispatch(updateTagType(tag.ZUID, e.target.value))
                }
              >
                <MenuItem value="">- None -</MenuItem>
                <MenuItem value="script">Script</MenuItem>
                <MenuItem value="meta">Meta</MenuItem>
                <MenuItem value="link">Link</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ maxWidth: "200px" }}>
              <FieldTypeSort
                value={tag.sort ? tag.sort.toString() : "0"}
                name={tag.ZUID}
                label="Sort"
                onChange={(evt) =>
                  dispatch(updateTagSort(tag.ZUID, parseInt(evt.target.value)))
                }
              />
            </Box>
            <Button
              title="Add Tag Attribute"
              variant="contained"
              onClick={() => dispatch(addTagAttribute(tag.ZUID))}
              startIcon={<AddIcon />}
            >
              Add attribute
            </Button>
            {tag.hasOwnProperty("createdAt") ? (
              <Button
                variant="contained"
                title="Delete Head Tag"
                onClick={onDelete}
                color="error"
                startIcon={<DeleteIcon />}
                sx={{
                  display: "none",
                  marginLeft: "auto",
                }}
              >
                Delete Tag
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                title="Cancel"
                onClick={onCancel}
                type="error"
                startIcon={<DeleteIcon />}
                sx={{
                  display: "none",
                  marginLeft: "auto",
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        }
      ></CardHeader>
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
                onChange={(evt) =>
                  dispatch(
                    updateTagAttribute(tag.ZUID, index, {
                      key: evt.target.value,
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
                onChange={(evt) =>
                  dispatch(
                    updateTagAttribute(tag.ZUID, index, {
                      key: attr.key,
                      value: evt.target.value,
                    })
                  )
                }
              />
              {attr.key !== "custom" ? (
                <Button
                  variant="contained"
                  color="error"
                  title="Delete Tag Attribute"
                  onClick={() => dispatch(deleteTagAttribute(tag.ZUID, index))}
                  sx={{
                    visibility: "hidden",
                    height: "40px",
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </Button>
              ) : (
                <div style={{ width: "40px" }}></div>
              )}
            </div>
          );
        })}
      </CardContent>
      <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
        {tag.hasOwnProperty("createdAt") && (
          <Button
            color="error"
            variant="contained"
            onClick={onDelete}
            startIcon={
              saving ? <CircularProgress size="20px" /> : <DeleteIcon />
            }
          >
            Delete Head Tag
          </Button>
        )}
        <Button
          title={
            tag.hasOwnProperty("createdAt")
              ? "Save head tag"
              : "Create head tag"
          }
          color="success"
          variant="contained"
          id="SaveItemButton"
          disabled={saving}
          onClick={tag.hasOwnProperty("createdAt") ? onSave : onCreate}
          startIcon={saving ? <CircularProgress size="20px" /> : <SaveIcon />}
        >
          {tag.hasOwnProperty("createdAt")
            ? "Save head tag"
            : "Create head tag"}
        </Button>
      </CardActions>
    </Card>
  );
};
