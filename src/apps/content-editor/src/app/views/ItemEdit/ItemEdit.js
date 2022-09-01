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

const selectSortedModelFields = createSelector(
  (state) => state.fields,
  (_, modelZUID) => modelZUID,
  (fields, modelZUID) =>
    Object.keys(fields)
      .filter((fieldZUID) => fields[fieldZUID].contentModelZUID === modelZUID)
      .map((fieldZUID) => fields[fieldZUID])
      .sort((a, b) => a.sort - b.sort)
);

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
  const fields = useSelector((state) =>
    selectSortedModelFields(state, modelZUID)
  );
  const tags = useSelector((state) => selectItemHeadTags(state, itemZUID));
  const languages = useSelector((state) => state.languages);
  const user = useSelector((state) => state.user);
  const userRole = useSelector((state) => state.userRole);
  const instance = useSelector((state) => state.instance);

  const [initialNavLink, setInitialNavLink] = useState("");

  const [lockState, setLockState] = useState({});
  const [checkingLock, setCheckingLock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState("");

  useEffect(() => {
    setNotFound("");

    // on mount and modelZUID/itemZUID update,
    // lock item and load all item data
    lockItem(itemZUID);
    load(modelZUID, itemZUID);

    // on unmount, release lock
    return () => {
      releaseLock(itemZUID);
    };
  }, [modelZUID, itemZUID]);

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

      // set initial navigation link
      // this will be used to compare new NavLink value to the initial value
      if (itemResponse?.data?.web?.metaLinkText) {
        setInitialNavLink(itemResponse.data.web.metaLinkText);
      }

      if (itemResponse?.data?.meta?.langID) {
        // select lang based on content lang
        dispatch(
          selectLang(
            languages.find((lang) => lang.ID === itemResponse.data.meta.langID)
              .code
          )
        );

        // once we selectLang we can fetchFields
        // which triggers middleware which depends on lang
        await Promise.all([
          dispatch(fetchFields(modelZUID)),
          dispatch(fetchItemPublishing(modelZUID, itemZUID)),
        ]);
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
    try {
      const res = await dispatch(saveItem(itemZUID, initialNavLink));
      if (res.err === "MISSING_REQUIRED") {
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
          condition={!loading && item && Object.keys(item).length}
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

          <section style={{ height: "100%" }}>
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
                path="/content/:modelZUID/:itemZUID/headless"
                render={() => (
                  <HeadlessOptions
                    instance={instance}
                    modelZUID={modelZUID}
                    model={model}
                    itemZUID={itemZUID}
                    item={item}
                    items={items}
                    fields={fields}
                    user={user}
                    dispatch={dispatch}
                    saving={saving}
                  />
                )}
              />
              <Route
                exact
                path="/content/:modelZUID/:itemZUID/publishings"
                render={() => (
                  <>
                    <Header
                      instance={instance}
                      modelZUID={modelZUID}
                      model={model}
                      itemZUID={itemZUID}
                      item={item}
                    />
                    <PublishState />
                  </>
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
                    itemZUID={itemZUID}
                    item={item}
                    items={items}
                    fields={fields}
                    user={user}
                    onSave={save}
                    dispatch={dispatch}
                    loading={loading}
                    saving={saving}
                  />
                )}
              />
            </Switch>
          </section>
        </WithLoader>
      )}
    </Fragment>
  );
}
