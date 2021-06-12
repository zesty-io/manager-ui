import React, { useEffect, useState } from "react";
import {
  Switch,
  Route,
  Redirect,
  useParams,
  useHistory
} from "react-router-dom";
import useIsMounted from "ismounted";
import { useDispatch, useSelector } from "react-redux";
import usePrevious from "react-use/lib/usePrevious";

import { notify } from "shell/store/notifications";
import { fetchAuditTrailDrafting } from "shell/store/logs";
import { fetchFields } from "shell/store/fields";
import {
  fetchItem,
  saveItem,
  fetchItemPublishing,
  checkLock,
  lock,
  unlock
} from "shell/store/content";
import { selectLang } from "shell/store/user";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { PendingEditsModal } from "../../components/PendingEditsModal";
import { LockedItem } from "../../components/LockedItem";
import { Content } from "./Content";
import { Meta } from "./Meta";
import { ItemHead } from "./ItemHead";

const selectSortedModelFields = (state, modelZUID) =>
  Object.keys(state.fields)
    .filter(fieldZUID => state.fields[fieldZUID].contentModelZUID === modelZUID)
    .map(fieldZUID => state.fields[fieldZUID])
    .sort((a, b) => a.sort - b.sort);

const selectItemHeadTags = (state, itemZUID) =>
  Object.keys(state.headTags)
    .reduce((acc, id) => {
      if (state.headTags[id].resourceZUID === itemZUID) {
        acc.push(state.headTags[id]);
      }
      return acc;
    }, [])
    .sort((tagA, tagB) => {
      return tagA.sort > tagB.sort ? 1 : -1;
    });

export default function ItemEdit() {
  const dispatch = useDispatch();
  const history = useHistory();
  const isMounted = useIsMounted();
  const { modelZUID, itemZUID } = useParams();
  const item = useSelector(state => state.content[itemZUID]);
  const items = useSelector(state => state.content);
  const model = useSelector(state => state.models[modelZUID]);
  const fields = useSelector(state =>
    selectSortedModelFields(state, modelZUID)
  );
  const tags = useSelector(state => selectItemHeadTags(state, itemZUID));
  const platform = useSelector(state => state.platform);
  const languages = useSelector(state => state.languages);
  const user = useSelector(state => state.user);
  const userRole = useSelector(state => state.userRole);
  const instance = useSelector(state => state.instance);

  const [lockState, setLockState] = useState({});
  const [checkingLock, setCheckingLock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // handle keyboard shortcut save
  useEffect(() => {
    window.addEventListener("keydown", handleSaveKeyboardShortcut);
    return () => {
      window.removeEventListener("keydown", handleSaveKeyboardShortcut);
    };
  }, []);

  useEffect(() => {
    lockItem(itemZUID);
    load(modelZUID, itemZUID);
    return () => {
      console.log("releasing lock on component unmount", itemZUID);
      releaseLock(itemZUID);
    };
  }, [itemZUID]);

  function releaseLock(itemZUID) {
    if (lockState.userZUID === user.user_zuid) {
      dispatch(unlock(itemZUID));
    }
  }

  async function lockItem() {
    setCheckingLock(true);
    try {
      const lockResponse = await dispatch(checkLock(itemZUID));
      // If no one has a lock then give lock to current user
      if (!lockResponse.userZUID) {
        dispatch(lock(itemZUID));
        setLockState({ userZUID: user.user_zuid });
      } else {
        setLockState(lockResponse);
      }
    } catch (err) {
      // If service is unavailable allow all users ownership
      setLockState({ userZUID: user.user_zuid });
    } finally {
      setCheckingLock(false);
    }
  }

  function handleSaveKeyboardShortcut(event) {
    if (
      ((platform.isMac && event.metaKey) ||
        (!platform.isMac && event.ctrlKey)) &&
      event.key == "s"
    ) {
      event.preventDefault();
      if (item && item.dirty) {
        save();
      }
    }
  }

  function forceUnlock() {
    // Transfer item lock to current session user
    dispatch(unlock(itemZUID)).then(() => {
      dispatch(lock(itemZUID));
    });
    setLockState({ userZUID: user.user_zuid });
  }

  async function load(modelZUID, itemZUID) {
    setLoading(true);

    // Fetch item, fields, publishing
    try {
      const itemResponse = await dispatch(fetchItem(modelZUID, itemZUID));
      if (itemResponse.status === 404) {
        dispatch(
          notify({
            message: itemResponse.message,
            kind: "error"
          })
        );
        throw new Error(itemResponse.message);
      }
      // select lang based on content lang
      dispatch(
        selectLang(
          languages.find(lang => lang.ID === itemResponse.data.meta.langID).code
        )
      );

      // once we selectLang we can fetchFields
      // which triggers middleware which depends on lang
      await Promise.all([
        dispatch(fetchFields(modelZUID)),
        dispatch(fetchItemPublishing(modelZUID, itemZUID))
      ]);
    } catch (err) {
      console.error("ItemEdit:load:error", err);
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await dispatch(saveItem(itemZUID));
      if (res.err === "MISSING_REQUIRED") {
        dispatch(
          notify({
            message: `You are missing data in ${res.missingRequired.map(
              f => f.label + " "
            )}`,
            kind: "error"
          })
        );
        return;
      }
      if (res.status === 400) {
        dispatch(
          notify({
            message: `Failed to save new version: ${res.error}`,
            kind: "error"
          })
        );
        return;
      }
      dispatch(
        notify({
          message: `Saved a new ${
            item && item.web.metaLinkText ? item.web.metaLinkText : ""
          } version`,
          kind: "save"
        })
      );
      // fetch new draft history
      dispatch(fetchAuditTrailDrafting(itemZUID));
    } catch (err) {
      // we need to set the item to dirty again because the save failed
      dispatch({
        type: "MARK_ITEM_DIRTY",
        itemZUID
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
      items: [itemZUID]
    });
    // Keep promise chain
    return dispatch(fetchItem(modelZUID, itemZUID));
  }

  return (
    <WithLoader
      condition={!loading && item && Object.keys(item).length}
      message={
        model?.label ? `Loading ${model.label} Content` : "Loading Content"
      }
    >
      {!checkingLock && lockState.userZUID !== user.user_zuid && (
        <LockedItem
          timestamp={lockState.timestamp}
          userFirstName={lockState.firstName}
          userLastName={lockState.lastName}
          userEmail={lockState.email}
          itemName={item?.web?.metaLinkText}
          handleUnlock={forceUnlock}
          goBack={() => history.goBack()}
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

      <section>
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
  );
}
