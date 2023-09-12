import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useIsMounted from "ismounted";
import { useHistory, useParams } from "react-router-dom";
import isEmpty from "lodash/isEmpty";
import { createSelector } from "@reduxjs/toolkit";

import { Divider, Box } from "@mui/material";

import { WithLoader } from "@zesty-io/core/WithLoader";
import { NotFound } from "../../../../../../shell/components/NotFound";
import { Header } from "./Header";
import { Editor } from "../../components/Editor";
import { ItemSettings } from "../ItemEdit/Meta/ItemSettings";
import { DataSettings } from "../ItemEdit/Meta/ItemSettings/DataSettings";
import { fetchFields } from "../../../../../../shell/store/fields";
import {
  createItem,
  generateItem,
  fetchItem,
  fetchItemPublishing,
} from "../../../../../../shell/store/content";
import { notify } from "../../../../../../shell/store/notifications";
import styles from "./ItemCreate.less";
import { AppState } from "../../../../../../shell/store/types";
import { useCreateItemPublishingMutation } from "../../../../../../shell/services/instance";

export type ActionAfterSave =
  | ""
  | "addNew"
  | "publishNow"
  | "schedulePublish"
  | "publishAddNew"
  | "schedulePublishAddNew";

const selectSortedModelFields = createSelector(
  (state: any) => state.fields,
  (_: any, modelZUID: string) => modelZUID,
  (fields, modelZUID) =>
    Object.keys(fields)
      .filter((fieldZUID) => fields[fieldZUID].contentModelZUID === modelZUID)
      .map((fieldZUID) => fields[fieldZUID])
      .sort((a, b) => a.sort - b.sort)
);

export const ItemCreate = () => {
  const history = useHistory();
  const isMounted = useIsMounted();
  const dispatch = useDispatch();
  const { modelZUID } = useParams<{ modelZUID: string }>();
  const itemZUID = `new:${modelZUID}`;
  const model = useSelector((state: AppState) => state.models[modelZUID]);
  const item = useSelector((state: AppState) => state.content[itemZUID]);
  const instance = useSelector((state: AppState) => state.instance);
  const content = useSelector((state: AppState) => state.content);
  const fields = useSelector((state) =>
    selectSortedModelFields(state, modelZUID)
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState();
  const [newItemZUID, setNewItemZUID] = useState();
  const [afterSaveBehavior, setAfterSaveBehavior] = useState();

  const [
    createPublishing,
    { isLoading: isPublishing, isSuccess: isPublished, data: publishedItem },
  ] = useCreateItemPublishingMutation();

  // on mount and update modelZUID, load item fields
  useEffect(() => {
    loadItemFields(modelZUID);
  }, [modelZUID]);

  // if item doesn't exist, generate a new one
  useEffect(() => {
    if (isEmpty(item)) {
      dispatch(generateItem(modelZUID));
    }
  }, [modelZUID, item]);

  // Redirect to the item once published
  useEffect(() => {
    if (!isPublishing && isPublished) {
      history.push(`/content/${modelZUID}/${publishedItem?.data?.itemZUID}`);
      // console.log(publishedItem);
    }
  }, [isPublishing, isPublished, publishedItem]);

  const loadItemFields = async (modelZUID: string) => {
    setLoading(true);
    try {
      await dispatch(fetchFields(modelZUID));
    } catch (err) {
      console.error("ItemCreate:load:error", err);
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const save = async (action: ActionAfterSave) => {
    setSaving(true);
    try {
      const res: any = await dispatch(createItem(modelZUID, itemZUID));
      if (res.err || res.error) {
        if (res.missingRequired) {
          dispatch(
            notify({
              message: `You are missing data in ${res.missingRequired
                .map((f: any) => f.label)
                .join(", ")}`,
              kind: "error",
            })
          );

          // scroll to required field
          if (isMounted.current) {
            setActive(res.missingRequired[0].ZUID);
          }
        }
        if (res.error) {
          dispatch(
            notify({
              message: res.error,
              kind: "warn",
            })
          );
        }
      } else if (res.data && res.data.ZUID) {
        // fetch item we just saved
        await dispatch(fetchItem(modelZUID, res.data.ZUID));

        setNewItemZUID(res.data.ZUID);

        switch (action) {
          case "addNew":
            // Do nothing, just stay on the same page
            break;

          case "publishNow":
            // Make an api call to publish now
            handlePublish(res.data.ZUID);
            break;

          case "schedulePublish":
            // Open schedule publish flyout and redirect to item once done
            break;

          case "publishAddNew":
            // Publish but stay on page
            break;

          case "schedulePublishAddNew":
            // Open schedule publish flyout but stay on page once done
            break;

          default:
            // Redirect to new item
            history.push(`/content/${modelZUID}/${res.data.ZUID}`);
            break;
        }

        dispatch(
          notify({
            message: `Created new ${model.label} item`,
            kind: "success",
          })
        );
      } else {
        dispatch(
          notify({
            message: "Unknown issue creating new item",
            kind: "warn",
          })
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (isMounted.current) {
        setSaving(false);
      }
    }
  };

  const handlePublish = async (newItemZUID: string) => {
    createPublishing({
      modelZUID,
      itemZUID: newItemZUID,
      body: {
        version: 1, // This is always going to be v1 since these are all newly-created items
        publishAt: "now",
        unpublishAt: "never",
      },
    }).then(() => {
      // Retain non rtk-query fetch of item publishing for legacy code
      dispatch(fetchItemPublishing(modelZUID, itemZUID));
    });
  };

  if (!loading && !model) {
    return <NotFound message={`Model "${modelZUID}" not found`} />;
  }

  return (
    <WithLoader condition={!loading && item} message="Creating New Item">
      <section>
        <Header
          onSave={save}
          model={model}
          isLoading={saving || isPublishing}
          isDirty={item?.dirty}
        />
        <Box
          component="main"
          className={styles.ItemCreate}
          sx={{ backgroundColor: "grey.50" }}
        >
          <div className={styles.Editor}>
            <Editor
              // @ts-ignore no types
              active={active}
              scrolled={setActive}
              itemZUID={itemZUID}
              item={item}
              items={content}
              instance={instance}
              modelZUID={modelZUID}
              model={model}
              fields={fields}
              onSave={save}
              dispatch={dispatch}
              loading={loading}
              saving={saving}
              isDirty={item?.dirty}
            />

            <div className={styles.Meta}>
              <Divider
                sx={{
                  mt: 4,
                  mb: 2,
                }}
              />
              <h2 className={styles.title}>Meta Settings</h2>
              {model && model?.type === "dataset" ? (
                <DataSettings item={item} dispatch={dispatch} />
              ) : (
                <ItemSettings
                  // @ts-ignore no types
                  instance={instance}
                  modelZUID={modelZUID}
                  item={item}
                  content={content}
                  dispatch={dispatch}
                />
              )}
            </div>
          </div>
        </Box>
      </section>
    </WithLoader>
  );
};
