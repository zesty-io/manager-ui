import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useIsMounted from "ismounted";
import { useHistory, useParams } from "react-router-dom";
import isEmpty from "lodash/isEmpty";
import { createSelector } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";

import { Divider, Box, Stack } from "@mui/material";

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
import {
  useCreateItemPublishingMutation,
  useGetContentItemQuery,
  useGetContentModelFieldsQuery,
} from "../../../../../../shell/services/instance";
import { Error } from "../../components/Editor/Field/FieldShell";
import {
  ContentItemWithDirtyAndPublishing,
  ContentModelField,
} from "../../../../../../shell/services/types";
import { SchedulePublish } from "../../../../../../shell/components/SchedulePublish";

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

type FieldError = {
  [key: string]: Error;
};

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
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [willRedirect, setWillRedirect] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [saveClicked, setSaveClicked] = useState(false);

  const [
    createPublishing,
    { isLoading: isPublishing, isSuccess: isPublished, data: publishedItem },
  ] = useCreateItemPublishingMutation();
  const { data: newItemData, isLoading: isLoadingNewItem } =
    useGetContentItemQuery(newItemZUID, {
      skip: !newItemZUID,
    });

  const {
    isSuccess: isSuccessNewModelFields,
    isFetching: isFetchingNewModelFields,
  } = useGetContentModelFieldsQuery(modelZUID);

  // on mount and update modelZUID, load item fields
  useEffect(() => {
    loadItemFields(modelZUID);
  }, [modelZUID]);

  // if item doesn't exist, generate a new one
  useEffect(() => {
    if (isEmpty(item) && !saving) {
      console.log("generate new draft");
      dispatch(generateItem(modelZUID));
    }
  }, [modelZUID, item, saving]);

  // Redirect to the item once published
  useEffect(() => {
    if (!isPublishing && isPublished) {
      // console.log("will it redirect?", redirect);
      if (willRedirect) {
        history.push(`/content/${modelZUID}/${publishedItem?.data?.itemZUID}`);
      }
    }
  }, [isPublishing, isPublished, publishedItem, willRedirect]);

  const hasErrors = useMemo(() => {
    const hasErrors = Object.values(fieldErrors)
      ?.map((error) => {
        return Object.values(error) ?? [];
      })
      ?.flat()
      .some((error) => !!error);

    if (!hasErrors) {
      setSaveClicked(false);
    }

    return hasErrors;
  }, [fieldErrors]);

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
    setSaveClicked(true);
    try {
      const res: any = await dispatch(createItem(modelZUID, itemZUID));
      if (res.err || res.error) {
        if (res.missingRequired) {
          const missingRequiredFieldNames: string[] =
            res.missingRequired?.reduce(
              (acc: string[], curr: ContentModelField) => {
                acc = [curr.name, ...acc];
                return acc;
              },
              []
            );

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
          dispatch(
            notify({
              message: "Missing Data in Required Fields",
              kind: "error",
            })
          );

          // scroll to required field
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
            setWillRedirect(true);
            break;

          case "schedulePublish":
            // Open schedule publish flyout and redirect to item once done
            setIsScheduleDialogOpen(true);
            setWillRedirect(true);
            break;

          case "publishAddNew":
            // Publish but stay on page
            handlePublish(res.data.ZUID);
            setWillRedirect(false);

            break;

          case "schedulePublishAddNew":
            // Open schedule publish flyout but stay on page once done
            setIsScheduleDialogOpen(true);
            setWillRedirect(false);
            break;

          default:
            // Redirect to new item
            history.push(`/content/${modelZUID}/${res.data.ZUID}`);
            break;
        }

        dispatch(
          notify({
            message: `Created Item: ${item.web.metaLinkText}`,
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
      dispatch(fetchItemPublishing(modelZUID, newItemZUID));
    });
  };

  if (!loading && !model) {
    return <NotFound message={`Model "${modelZUID}" not found`} />;
  }

  return (
    <WithLoader
      condition={
        !loading && item && isSuccessNewModelFields && !isFetchingNewModelFields
      }
      message="Creating New Item"
    >
      <Box component="section">
        <Header
          onSave={save}
          model={model}
          isLoading={saving || isPublishing || isLoadingNewItem}
          isDirty={item?.dirty}
        />
        <Stack
          component="main"
          className={styles.ItemCreate}
          bgcolor="grey.50"
          alignItems="center"
        >
          <Box minWidth={640} width="60%">
            <Editor
              // @ts-ignore no types
              hasErrors={hasErrors}
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
              saveClicked={saveClicked}
              fieldErrors={fieldErrors}
              // @ts-ignore  untyped component
              onUpdateFieldErrors={(errors: FieldError) => {
                setFieldErrors(errors);
              }}
            />
          </Box>
          <Box className={styles.Meta} minWidth={640} width="60%">
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
          </Box>
        </Stack>
      </Box>
      {isScheduleDialogOpen && !isLoadingNewItem && (
        <SchedulePublish
          item={newItemData as ContentItemWithDirtyAndPublishing}
          onClose={() => setIsScheduleDialogOpen(false)}
          onPublishNow={() => handlePublish(newItemZUID)}
          onScheduleSuccess={() => {
            setIsScheduleDialogOpen(false);

            if (willRedirect) {
              history.push(`/content/${modelZUID}/${newItemData?.meta?.ZUID}`);
            }
          }}
        />
      )}
    </WithLoader>
  );
};
