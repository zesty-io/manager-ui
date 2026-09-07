import {
  Fragment,
  useEffect,
  useState,
  useMemo,
  useCallback,
  createContext,
  useRef,
} from "react";
import {
  Switch,
  Route,
  Redirect,
  useParams,
  useHistory,
  useLocation,
} from "react-router-dom";
import useIsMounted from "ismounted";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";
import { useTranslation } from "react-i18next";

import { notify } from "shell/store/notifications";
import { fetchAuditTrailDrafting } from "shell/store/logs";
import { fetchFields } from "shell/store/fields";
import {
  fetchItem,
  saveItem,
  fetchItemPublishing,
  checkLock,
  lock,
  unlock,
  fetchAllModelPublishings,
} from "shell/store/content";
import { selectLang } from "shell/store/user";
import { PendingEditsModal } from "../../components/PendingEditsModal";
import { LockedItem } from "../../components/LockedItem";
import { Content } from "./Content";
import { ItemHead } from "./ItemHead";

import NotFound from "../NotFound";

import { PublishState } from "./PublishState.tsx";
import Analytics from "../Analytics";
import { ApiDetails } from "../../../../../schema/src/app/components/ModelApi/ApiDetails";
import { ApiCardList } from "../../../../../schema/src/app/components/ModelApi/ApiCardList";
import { Box } from "@mui/material";
import { ItemEditHeader } from "./components/ItemEditHeader";
import {
  useGetContentModelFieldsQuery,
  useGetInstanceSettingsQuery,
} from "../../../../../../shell/services/instance";
import { DuoModeContext } from "../../../../../../shell/contexts/duoModeContext";
import { useLocalStorage } from "react-use";
import { FreestyleWrapper } from "./FreestyleWrapper";
import { Meta } from "./Meta";
import { FieldError } from "../../components/Editor/FieldError";
import { AIGeneratorProvider } from "../../../../../../shell/components/withAi/AIGeneratorProvider";
import { Redirects } from "../Redirects";
import RedirectsDialogContextProvider from "../../../../../seo/src/app/components/RedirectsDialogProvider";

const CONTRIBUTOR_ROLE_ZUID = "31-71cfc74-c0ntr1b0t0r";

const selectItemHeadTags = createSelector(
  (state) => state.headTags,
  (_, itemZUID) => itemZUID,
  (headTags, itemZUID) =>
    Object.keys(headTags)
      .reduce((acc, id) => {
        if (headTags[id].resourceZUID === itemZUID) {
          acc.push(headTags[id]);
        }
        return acc;
      }, [])
      .sort((tagA, tagB) => {
        return tagA.sort > tagB.sort ? 1 : -1;
      })
);

export const ItemLockContext = createContext();

export default function ItemEdit() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const isMounted = useIsMounted();
  const location = useLocation();
  const { modelZUID, itemZUID } = useParams();
  const metaRef = useRef(null);
  const fieldErrorRef = useRef(null);
  const item = useSelector((state) => state.content[itemZUID]);
  const model = useSelector((state) => state.models[modelZUID]);
  const tags = useSelector((state) => selectItemHeadTags(state, itemZUID));
  const languages = useSelector((state) => state.languages);
  const user = useSelector((state) => state.user);
  const userRole = useSelector((state) => state.userRole);
  const instance = useSelector((state) => state.instance);
  const [lockState, setLockState] = useState({});
  const [checkingLock, setCheckingLock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState("");
  const [saveClicked, setSaveClicked] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [SEOErrors, setSEOErrors] = useState({});
  // const [hasSEOErrors, setHasSEOErrors] = useState(false);
  const {
    data: fields,
    isError: fieldsLoadingError,
    isLoading: isLoadingFields,
  } = useGetContentModelFieldsQuery({ modelZUID });
  const [showDuoModeLS, setShowDuoModeLS] = useLocalStorage(
    "zesty:content:duoModeOpen",
    true
  );
  const { data: instanceSettings, isFetching } = useGetInstanceSettingsQuery();
  const duoModeDisabled =
    isFetching ||
    instanceSettings?.find((setting) => {
      // Makes sure that the CSP value is either empty or contains
      // frame-ancestors 'self' zesty.io *.zesty.io anywhere in the value
      const invalidCSPSettings =
        setting.key === "content_security_policy" && !!setting.value
          ? !setting.value.includes("frame-ancestors") ||
            !setting.value.includes("'self'") ||
            !(
              setting.value.includes("zesty.io") ||
              setting.value.includes("*.zesty.io")
            )
          : false;

      // if any of these settings are present then DuoMode is unavailable
      return (
        (setting.key === "basic_content_api_key" && setting.value) ||
        (setting.key === "headless_authorization_key" && setting.value) ||
        (setting.key === "authorization_key" && setting.value) ||
        (setting.key === "x_frame_options" &&
          !!setting.value &&
          setting.value !== "sameorigin") ||
        (setting.key === "referrer_policy" &&
          !!setting.value &&
          setting.value !== "strict-origin-when-cross-origin") ||
        invalidCSPSettings
      );
    }) ||
    model?.type === "dataset";

  useEffect(() => {
    if (duoModeDisabled && !isFetching) {
      setShowDuoModeLS(false);
    }
  }, [duoModeDisabled, isFetching]);

  useEffect(() => {
    setNotFound("");

    // on mount and modelZUID/itemZUID update,
    // lock item and load all item data
    lockItem(itemZUID);
    load(modelZUID, itemZUID);
    setSaveClicked(false);

    // on unmount, release lock
    return () => {
      releaseLock(itemZUID);
    };
  }, [modelZUID, itemZUID]);

  useEffect(() => {
    setSaveClicked(false);
    setFieldErrors({});
    setSEOErrors({});
  }, [location.pathname]);

  useEffect(() => {
    if (loading || isLoadingFields) return;
    if (fieldsLoadingError && !!model) {
      dispatch(
        notify({
          message: t("content.itemEditFailedLoadFields"),
          kind: "error",
        })
      );
    }
  }, [fieldsLoadingError, model, isLoadingFields, loading]);

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

  const hasSEOErrors = useMemo(() => {
    const hasErrors = Object.values(SEOErrors)
      ?.map((error) => {
        return Object.values(error) ?? [];
      })
      ?.flat()
      .some((error) => !!error);

    return hasErrors;
  }, [SEOErrors]);

  const activeFields = useMemo(() => {
    if (fields?.length) {
      return fields.filter(
        (field) => !field.deletedAt && !["og_image"].includes(field.name)
      );
    }

    return [];
  }, [fields]);

  async function lockItem() {
    setCheckingLock(true);
    try {
      const lockResponse = await dispatch(checkLock(itemZUID));
      // If no one has a lock then give lock to current user
      if (isMounted.current) {
        if (!lockResponse.userZUID) {
          dispatch(lock(itemZUID));
          setLockState({ userZUID: user.ZUID });
        } else {
          setLockState(lockResponse);
        }
      }
    } catch (err) {
      // If service is unavailable allow all users ownership
      if (isMounted.current) {
        setLockState({ userZUID: user.ZUID });
      }
    } finally {
      if (isMounted.current) {
        setCheckingLock(false);
      }
    }
  }

  // Fetch item, fields, publishing
  async function load(modelZUID, itemZUID) {
    setLoading(true);

    try {
      const itemResponse = await dispatch(fetchItem(modelZUID, itemZUID));

      if (itemResponse.status === 404 || itemResponse.status === 400) {
        setNotFound(itemResponse.message || itemResponse.error);
      }

      if (itemResponse.data === null) {
        setNotFound(t("content.itemEditDeletedNotFound"));
      }

      if (itemResponse?.data?.meta?.langID) {
        const selectedLang = languages.find(
          (lang) => lang.ID === itemResponse.data.meta.langID
        )?.code;

        // Make sure that lang code exists
        if (selectedLang) {
          // select lang based on content lang
          dispatch(selectLang(selectedLang));

          // once we selectLang we can fetchFields
          // which triggers middleware which depends on lang
          await Promise.all([
            dispatch(fetchFields(modelZUID)),
            dispatch(fetchItemPublishing(modelZUID, itemZUID)),
          ]);
        }
      }
    } catch (err) {
      console.error("ItemEdit:load:error", err);
      setNotFound(err?.message || t("content.itemEditNotFound"));
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }

  function releaseLock(itemZUID) {
    if (lockState.userZUID === user.ZUID) {
      dispatch(unlock(itemZUID));
    }
  }

  function forceUnlock() {
    // Transfer item lock to current session user
    dispatch(unlock(itemZUID)).then(() => {
      dispatch(lock(itemZUID));
    });
    setLockState({ userZUID: user.ZUID });
  }

  const save = useCallback(async () => {
    setSaveClicked(true);

    try {
      if (
        hasErrors ||
        hasSEOErrors ||
        metaRef.current?.validateMetaFields?.()
      ) {
        throw new Error(
          t("content.itemEditCannotSaveTitle", {
            title: item.web.metaTitle,
          })
        );
      }

      setSaving(true);

      // Skip content item fields validation when in the meta tab since this
      // means that the user only wants to update the meta fields
      const res = await dispatch(
        saveItem({
          itemZUID,
          skipContentItemValidation:
            location?.pathname?.split("/")?.pop() === "meta",
        })
      );
      if (res.err === "VALIDATION_ERROR") {
        const missingRequiredFieldNames = res.missingRequired?.reduce(
          (acc, curr) => {
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
              heading: t("content.itemEditCannotSaveTitle", {
                title: item.web.metaTitle,
              }),
              message: t("content.itemEditMissingRequiredData"),
              kind: "error",
            })
          );
        }

        // Map min length validation errors
        if (res.lackingCharLength?.length) {
          res.lackingCharLength?.forEach((field) => {
            errors[field.name] = {
              ...(errors[field.name] ?? {}),
              LACKING_MINLENGTH: field.settings?.minCharLimit,
            };
          });
        }

        if (res.regexPatternMismatch?.length) {
          res.regexPatternMismatch?.forEach((field) => {
            errors[field.name] = {
              ...(errors[field.name] ?? {}),
              REGEX_PATTERN_MISMATCH: field.settings?.regexMatchErrorMessage,
            };
          });
        }

        if (res.regexRestrictPatternMatch?.length) {
          res.regexRestrictPatternMatch?.forEach((field) => {
            errors[field.name] = {
              ...(errors[field.name] ?? {}),
              REGEX_RESTRICT_PATTERN_MATCH:
                field.settings?.regexRestrictErrorMessage,
            };
          });
        }

        if (res.invalidRange?.length) {
          res.invalidRange?.forEach((field) => {
            errors[field.name] = {
              ...(errors[field.name] ?? {}),
              INVALID_RANGE: t("content.valueMustBeBetween", {
                min: field.settings?.minValue,
                max: field.settings?.maxValue,
              }),
            };
          });
        }

        if (res.invalidBlockVariantValue?.length) {
          res.invalidBlockVariantValue?.forEach((field) => {
            errors[field.name] = {
              ...(errors[field.name] ?? {}),
              INVALID_BLOCK_VARIANT: true,
            };
          });
        }

        setFieldErrors(errors);
        throw new Error(errors);
      }
      if (res.status === 400) {
        // Handles backend validation error for when the data is too long
        if (res.error?.toLowerCase()?.includes("data too long")) {
          const dataLongErrorMatch = res.error?.match(/'([^']*)'/);

          if (dataLongErrorMatch?.[1]) {
            const fieldName = dataLongErrorMatch[1];
            const errors = cloneDeep(fieldErrors);
            const oneToManyFieldNames = activeFields?.reduce(
              (names, currItem) => {
                if (currItem?.datatype === "one_to_many") {
                  return [...names, currItem?.name];
                }

                return names;
              },
              []
            );

            errors[fieldName] = {
              ...(errors[fieldName] ?? {}),
              CUSTOM_ERROR: oneToManyFieldNames?.includes(fieldName)
                ? t("content.itemEditCannotSaveTooManySelected")
                : t("content.itemEditCannotSaveValueTooLong"),
            };

            setFieldErrors(errors);
          }
        }

        dispatch(
          notify({
            message: t("content.itemEditCannotSaveWithError", {
              title: item.web.metaTitle,
              error: res.error,
            }),
            kind: "error",
          })
        );
        throw new Error(
          t("content.itemEditCannotSaveWithError", {
            title: item.web.metaTitle,
            error: res.error,
          })
        );
      }

      dispatch(
        notify({
          message: t("content.itemEditSavedNotification", {
            title: item?.web?.metaTitle || item?.web?.metaLinkText,
          }),
          kind: "save",
        })
      );
      // fetch new draft history
      await Promise.resolve(dispatch(fetchAuditTrailDrafting(itemZUID)));
    } catch (err) {
      // we need to set the item to dirty again because the save failed
      dispatch({
        type: "MARK_ITEM_DIRTY",
        itemZUID,
      });
      fieldErrorRef.current?.scrollToErrors?.();
      throw new Error(err);
    } finally {
      if (isMounted.current) {
        await Promise.resolve(
          dispatch(
            fetchAllModelPublishings({
              modelZUID,
            })
          )
        );

        setSaving(false);
      }
    }
  }, [itemZUID, fieldErrors, hasErrors, hasSEOErrors, location.pathname]);

  function discard() {
    dispatch({
      type: "UNMARK_ITEMS_DIRTY",
      items: [itemZUID],
    });
    // Keep promise chain
    return dispatch(fetchItem(modelZUID, itemZUID));
  }

  const isLocked =
    isMounted.current && !checkingLock && lockState.userZUID !== user.ZUID;

  const handleSave = useCallback(() => {
    return save().catch((err) => {
      console.error("ItemEdit:onSave:error", err);
    });
  }, [save]);
  return (
    <Fragment>
      {!isLoadingFields && !loading && notFound ? (
        <NotFound />
      ) : (
        <>
          {isLocked && (
            <Box sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}>
              <LockedItem
                viewTimestamp={lockState.timestamp}
                currentViewerFirstName={lockState.firstName}
                currentViewerLastName={lockState.lastName}
                itemName={item?.web?.metaLinkText}
                onUnlock={forceUnlock}
                onCancel={(evt) => {
                  evt.stopPropagation();
                  history.goBack();
                }}
              />
            </Box>
          )}

          <PendingEditsModal
            show={item?.dirty}
            loading={saving}
            onSave={save}
            onDiscard={discard}
          />
          <DuoModeContext.Provider
            value={{
              value: showDuoModeLS,
              setValue: setShowDuoModeLS,
              isDisabled: duoModeDisabled,
            }}
          >
            <Box
              component="section"
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                bgcolor: "grey.50",
              }}
            >
              <ItemEditHeader
                onSave={() => save().catch((err) => console.error(err))}
                saving={saving}
                hasError={Object.keys(fieldErrors)?.length}
                isLoadingItem={loading || isLoadingFields}
              />
              <Switch>
                <Route
                  exact
                  path="/content/:modelZUID/:itemZUID/head"
                  render={({ match }) => {
                    // All roles except contributor are allowed to edit the document head
                    return userRole.systemRoleZUID !== CONTRIBUTOR_ROLE_ZUID ? (
                      <ItemHead
                        instance={instance}
                        modelZUID={modelZUID}
                        model={model}
                        itemZUID={itemZUID}
                        item={item}
                        tags={tags}
                        dispatch={dispatch}
                      />
                    ) : (
                      <Redirect
                        to={`/content/${match.params.modelZUID}/${match.params.itemZUID}`}
                      />
                    );
                  }}
                />
                <Route
                  exact
                  path="/content/:modelZUID/:itemZUID/meta"
                  render={() => (
                    <AIGeneratorProvider>
                      <Meta
                        ref={metaRef}
                        onUpdateSEOErrors={(errors) => {
                          setSEOErrors(errors);
                        }}
                        item={item}
                        isSaving={saving}
                        errors={SEOErrors}
                        errorComponent={
                          saveClicked &&
                          hasSEOErrors && (
                            <FieldError
                              ref={fieldErrorRef}
                              errors={{ ...fieldErrors, ...SEOErrors }}
                              fields={activeFields}
                            />
                          )
                        }
                      />
                    </AIGeneratorProvider>
                  )}
                />
                <Route
                  exact
                  path="/content/:modelZUID/:itemZUID/analytics"
                  render={() => <Analytics item={item} />}
                />
                <Route
                  path="/content/:contentModelZUID/:contentItemZUID/api"
                  render={() => (
                    <Box
                      sx={{
                        color: "text.primary",
                        flex: "1",
                        overflow: "hidden",
                        "*": {
                          boxSizing: "border-box",
                        },
                        bgcolor: "grey.50",
                      }}
                    >
                      <Route
                        exact
                        path="/content/:contentModelZUID/:contentItemZUID/api/:type"
                        component={ApiDetails}
                      />
                      <Route
                        exact
                        path="/content/:contentModelZUID/:contentItemZUID/api"
                        component={ApiCardList}
                      />
                    </Box>
                  )}
                />
                <Route
                  exact
                  path="/content/:modelZUID/:itemZUID/publishings"
                  render={() => (
                    <PublishState
                      reloadItem={() => load(modelZUID, itemZUID)}
                    />
                  )}
                />
                <Route
                  exact
                  path={[
                    "/content/:modelZUID/:itemZUID",
                    "/content/:modelZUID/:itemZUID/comment/:resourceZUID",
                    "/content/:modelZUID/:itemZUID/comment/:resourceZUID/:commentZUID",
                    "/blocks/:modelZUID/:itemZUID",
                    "/blocks/:modelZUID/:itemZUID/comment/:resourceZUID",
                    "/blocks/:modelZUID/:itemZUID/comment/:resourceZUID/:commentZUID",
                  ]}
                  render={() => (
                    <ItemLockContext.Provider value={isLocked}>
                      <AIGeneratorProvider>
                        <Content
                          instance={instance}
                          modelZUID={modelZUID}
                          model={model}
                          fields={fields}
                          itemZUID={itemZUID}
                          item={item}
                          user={user}
                          onSave={handleSave}
                          dispatch={dispatch}
                          loading={loading || isLoadingFields}
                          saving={saving}
                          saveClicked={saveClicked}
                          onUpdateFieldErrors={(errors) => {
                            setFieldErrors(errors);
                          }}
                          fieldErrors={fieldErrors}
                          hasErrors={hasErrors}
                          activeFields={activeFields}
                          fieldErrorRef={fieldErrorRef}
                        />
                      </AIGeneratorProvider>
                    </ItemLockContext.Provider>
                  )}
                />
                <Route
                  exact
                  path="/content/:modelZUID/:itemZUID/freestyle"
                  render={() => <FreestyleWrapper />}
                />
                <Route
                  exact
                  path="/content/:modelZUID/:itemZUID/redirects"
                  render={() => (
                    <RedirectsDialogContextProvider>
                      <Redirects />
                    </RedirectsDialogContextProvider>
                  )}
                />
              </Switch>
            </Box>
          </DuoModeContext.Provider>
        </>
      )}
    </Fragment>
  );
}
