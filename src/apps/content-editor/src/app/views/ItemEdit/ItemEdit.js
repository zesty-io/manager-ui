import { Fragment, useEffect, useState } from "react";
import {
  Switch,
  Route,
  Redirect,
  useParams,
  useHistory,
} from "react-router-dom";
import useIsMounted from "ismounted";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { cloneDeep, has } from "lodash";

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
} from "shell/store/content";
import { selectLang } from "shell/store/user";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { PendingEditsModal } from "../../components/PendingEditsModal";
import { LockedItem } from "../../components/LockedItem";
import { Content } from "./Content";
import { Meta } from "./Meta";
import { ItemHead } from "./ItemHead";
import { HeadlessOptions } from "./HeadlessOptions";

import { NotFound } from "../NotFound";

import { PublishState } from "./PublishState.tsx";
import { Header } from "./components/Header";
import Analytics from "../Analytics";
import { ApiDetails } from "../../../../../schema/src/app/components/ModelApi/ApiDetails";
import { ApiCardList } from "../../../../../schema/src/app/components/ModelApi/ApiCardList";
import { theme } from "@zesty-io/material";
import { ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import { ItemEditHeader } from "./components/ItemEditHeader";
import { LayoutsWrapper } from "./LayoutsWrapper";
import { useGetContentModelFieldsQuery } from "../../../../../../shell/services/instance";

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

export default function ItemEdit() {
  const dispatch = useDispatch();
  const history = useHistory();
  const isMounted = useIsMounted();
  const { modelZUID, itemZUID } = useParams();
  const item = useSelector((state) => state.content[itemZUID]);
  const items = useSelector((state) => state.content);
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

  const { data: fields, isLoading: isLoadingFields } =
    useGetContentModelFieldsQuery(modelZUID);

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
    const hasErrors = Object.values(fieldErrors)
      ?.map((error) => {
        return Object.values(error) ?? [];
      })
      ?.flat()
      .some((error) => !!error);

    if (!hasErrors) {
      setSaveClicked(false);
    }
  }, [fieldErrors]);

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
        setNotFound("Item has been deleted");
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

  async function save() {
    setSaving(true);
    setSaveClicked(true);
    try {
      const res = await dispatch(saveItem(itemZUID));
      if (res.err === "MISSING_REQUIRED") {
        const missingRequiredFieldNames = res.missingRequired?.reduce(
          (acc, curr) => {
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
            message: `You are missing data in ${res.missingRequired.map(
              (f) => f.label + " "
            )}`,
            kind: "error",
          })
        );
        return;
      }
      if (res.status === 400) {
        dispatch(
          notify({
            message: `Failed to save new version: ${res.error}`,
            kind: "error",
          })
        );
        return;
      }

      dispatch(
        notify({
          message: `Saved a new ${
            item && item.web.metaLinkText ? item.web.metaLinkText : ""
          } (${
            languages.find((lang) => lang.ID === item.meta.langID)?.code
          }) version`,
          kind: "save",
        })
      );
      // fetch new draft history
      dispatch(fetchAuditTrailDrafting(itemZUID));
    } catch (err) {
      console.error(err);
      // we need to set the item to dirty again because the save failed
      dispatch({
        type: "MARK_ITEM_DIRTY",
        itemZUID,
      });
    } finally {
      if (isMounted.current) {
        setSaving(false);
      }
    }
  }

  function discard() {
    dispatch({
      type: "UNMARK_ITEMS_DIRTY",
      items: [itemZUID],
    });
    // Keep promise chain
    return dispatch(fetchItem(modelZUID, itemZUID));
  }

  const isLocked = !checkingLock && lockState.userZUID !== user.ZUID;

  return (
    <Fragment>
      {notFound ? (
        <NotFound message={notFound} />
      ) : (
        <WithLoader
          condition={
            !loading && item && Object.keys(item).length && !isLoadingFields
          }
          message={
            model?.label ? `Loading ${model.label} Content` : "Loading Content"
          }
        >
          {isLocked && (
            <LockedItem
              timestamp={lockState.timestamp}
              userFirstName={lockState.firstName}
              userLastName={lockState.lastName}
              userEmail={lockState.email}
              itemName={item?.web?.metaLinkText}
              handleUnlock={forceUnlock}
              handleCancel={(evt) => {
                evt.stopPropagation();
                history.goBack();
              }}
              isLocked={isLocked}
            />
          )}

          <PendingEditsModal
            show={item?.dirty}
            title="Unsaved Changes"
            message="You have unsaved changes that will be lost if you leave this page."
            loading={saving}
            onSave={save}
            onDiscard={discard}
          />

          <Box
            component="section"
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <ItemEditHeader onSave={save} saving={saving} />
            <Switch>
              <Route
                exact
                path="/content/:modelZUID/:itemZUID/head"
                render={({ match }) => {
                  // All roles except contributor are allowed to edit the document head
                  return userRole.name !== "Contributor" ? (
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
                  <Meta
                    instance={instance}
                    modelZUID={modelZUID}
                    model={model}
                    itemZUID={itemZUID}
                    item={item}
                    items={items}
                    fields={fields}
                    user={user}
                    onSave={save}
                    dispatch={dispatch}
                    saving={saving}
                  />
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
                  <ThemeProvider theme={theme}>
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
                  </ThemeProvider>
                )}
              />
              <Route
                exact
                path="/content/:modelZUID/:itemZUID/publishings"
                render={() => (
                  <PublishState reloadItem={() => load(modelZUID, itemZUID)} />
                )}
              />
              <Route
                exact
                path="/content/:modelZUID/:itemZUID"
                render={() => (
                  <Content
                    instance={instance}
                    modelZUID={modelZUID}
                    model={model}
                    fields={fields}
                    itemZUID={itemZUID}
                    item={item}
                    items={items}
                    user={user}
                    onSave={save}
                    dispatch={dispatch}
                    loading={loading}
                    saving={saving}
                    saveClicked={saveClicked}
                    onUpdateFieldErrors={(errors) => {
                      setFieldErrors(errors);
                    }}
                    fieldErrors={fieldErrors}
                  />
                )}
              />
              <Route
                exact
                path="/content/:modelZUID/:itemZUID/layouts"
                render={() => <LayoutsWrapper />}
              />
            </Switch>
          </Box>
        </WithLoader>
      )}
    </Fragment>
  );
}
