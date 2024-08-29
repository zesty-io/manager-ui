import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useIsMounted from "ismounted";
import { useHistory, useParams } from "react-router-dom";
import isEmpty from "lodash/isEmpty";
import { createSelector } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";

import { Divider, Box, Stack, ThemeProvider, Button } from "@mui/material";
import { theme, Brain } from "@zesty-io/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

import { WithLoader } from "@zesty-io/core/WithLoader";
import { NotFound } from "../../../../../../shell/components/NotFound";
import { Header } from "./Header";
import { Editor } from "../../components/Editor";
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
import { Meta } from "../ItemEdit/Meta";
import { SocialMediaPreview } from "../ItemEdit/Meta/SocialMediaPreview";

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
  const [hasSEOErrors, setHasSEOErrors] = useState(false);

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
      const initialData = fields?.reduce((accu, curr) => {
        if (!curr.deletedAt) {
          accu[curr.name] = null;
        }
        return accu;
      }, {});

      dispatch(generateItem(modelZUID, initialData));
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

  const hasSingleLineTextFieldWithValue = useMemo(() => {
    if (!fields?.length && !item?.data) return false;

    return fields.some((field) => {
      // TODO: Clarify if this check should only be for single line text fields
      if (field.datatype === "text") {
        return !!item.data[field.name];
      }

      return false;
    });
  }, [fields, item?.data]);

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
    setSaveClicked(true);

    if (hasErrors || hasSEOErrors) return;

    setSaving(true);

    try {
      const res: any = await dispatch(createItem(modelZUID, itemZUID));
      if (res.err || res.error) {
        if (res.missingRequired || res.lackingCharLength) {
          const missingRequiredFieldNames: string[] =
            res.missingRequired?.reduce(
              (acc: string[], curr: ContentModelField) => {
                acc = [curr.name, ...acc];
                return acc;
              },
              []
            );

          const errors = cloneDeep(fieldErrors);

          if (missingRequiredFieldNames?.length) {
            missingRequiredFieldNames?.forEach((fieldName) => {
              errors[fieldName] = {
                ...(errors[fieldName] ?? {}),
                MISSING_REQUIRED: true,
              };
            });

            dispatch(
              notify({
                message: "Missing Data in Required Fields",
                kind: "error",
              })
            );
          }

          // Map min length validation errors
          if (res.lackingCharLength?.length) {
            res.lackingCharLength?.forEach((field: ContentModelField) => {
              errors[field.name] = {
                ...(errors[field.name] ?? {}),
                LACKING_MINLENGTH: field.settings?.minCharLimit,
              };
            });
          }

          if (res.regexPatternMismatch?.length) {
            res.regexPatternMismatch?.forEach((field: ContentModelField) => {
              errors[field.name] = {
                ...(errors[field.name] ?? {}),
                REGEX_PATTERN_MISMATCH: field.settings?.regexMatchErrorMessage,
              };
            });
          }

          if (res.regexRestrictPatternMatch?.length) {
            res.regexRestrictPatternMatch?.forEach(
              (field: ContentModelField) => {
                errors[field.name] = {
                  ...(errors[field.name] ?? {}),
                  REGEX_RESTRICT_PATTERN_MATCH:
                    field.settings?.regexRestrictErrorMessage,
                };
              }
            );
          }

          if (res.invalidRange?.length) {
            res.invalidRange?.forEach((field: ContentModelField) => {
              errors[field.name] = {
                ...(errors[field.name] ?? {}),
                INVALID_RANGE: `Value must be between ${field.settings?.minValue} and ${field.settings?.maxValue}`,
              };
            });
          }

          setFieldErrors(errors);

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
          direction="row"
          gap={4}
        >
          <Box width="60%" height="100%">
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
            <Divider
              sx={{
                mt: 4,
                mb: 2,
              }}
            />
            <Meta
              onUpdateSEOErrors={(hasErrors) => {
                setHasSEOErrors(hasErrors);
              }}
              isSaving={saving}
            />
          </Box>
          <ThemeProvider theme={theme}>
            <Box position="sticky" top={0} alignSelf="flex-start" width="40%">
              <SocialMediaPreview />
              {!!hasSingleLineTextFieldWithValue && (
                <Button
                  variant="text"
                  color="inherit"
                  size="large"
                  startIcon={
                    <>
                      <svg width={0} height={0}>
                        <linearGradient
                          id="gradientFill"
                          x1={1}
                          y1={0}
                          x2={1}
                          y2={1}
                        >
                          <stop offset="0%" stopColor="#0BA5EC" />
                          <stop offset="50%" stopColor="#EE46BC" />
                          <stop offset="100%" stopColor="#6938EF" />
                        </linearGradient>
                      </svg>
                      <Brain sx={{ fill: "url(#gradientFill)" }} />
                    </>
                  }
                  sx={{
                    mt: 1.5,
                  }}
                >
                  Improve with AI
                </Button>
              )}
            </Box>
          </ThemeProvider>
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
