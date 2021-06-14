import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useIsMounted from "ismounted";
import { useParams } from "react-router-dom";
import isEmpty from "lodash/isEmpty";

import { WithLoader } from "@zesty-io/core/WithLoader";
import { Divider } from "@zesty-io/core/Divider";
import { Header } from "./Header";
import { Editor } from "../../components/Editor";
import { ItemSettings } from "../ItemEdit/Meta/ItemSettings";
import { DataSettings } from "../ItemEdit/Meta/ItemSettings/DataSettings";
import { fetchFields } from "shell/store/fields";
import { createItem, generateItem, fetchItem } from "shell/store/content";
import { notify } from "shell/store/notifications";
import styles from "./ItemCreate.less";

const selectSortedModelFields = (state, modelZUID) =>
  Object.keys(state.fields)
    .filter(fieldZUID => state.fields[fieldZUID].contentModelZUID === modelZUID)
    .map(fieldZUID => state.fields[fieldZUID])
    .sort((a, b) => a.sort - b.sort);

export default function ItemCreate() {
  const isMounted = useIsMounted();
  const dispatch = useDispatch();
  const { modelZUID } = useParams();
  const itemZUID = `new:${modelZUID}`;
  const model = useSelector(state => state.models[modelZUID]);
  const item = useSelector(state => state.content[itemZUID]);
  const instance = useSelector(state => state.instance);
  const content = useSelector(state => state.content);
  const platform = useSelector(state => state.platform);
  const fields = useSelector(state =>
    selectSortedModelFields(state, modelZUID)
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState();

  useEffect(() => {
    window.addEventListener("keydown", handleSave);
    return () => {
      window.removeEventListener("keydown", handleSave);
    };
  }, []);

  useEffect(() => {
    load(modelZUID);
    if (isEmpty(item)) {
      dispatch(generateItem(modelZUID));
    }
  }, []);

  function handleSave(event) {
    if (
      ((platform.isMac && event.metaKey) ||
        (!platform.isMac && event.ctrlKey)) &&
      event.key == "s"
    ) {
      event.preventDefault();
      save();
    }
  }

  async function load(modelZUID) {
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
  }

  async function save() {
    setSaving(true);
    try {
      const res = await dispatch(createItem(modelZUID, itemZUID));
      if (res.err || res.error) {
        if (res.missingRequired) {
          dispatch(
            notify({
              message: `You are missing data in ${res.missingRequired
                .map(f => f.label)
                .join(", ")}`,
              kind: "error"
            })
          );

          // scroll to required field
          setActive(res.missingRequired[0].ZUID);
        }
        if (res.error) {
          dispatch(
            notify({
              message: res.error,
              kind: "warn"
            })
          );
        }
      } else if (res.data && res.data.ZUID) {
        // fetch item we just saved
        await dispatch(fetchItem(modelZUID, res.data.ZUID));

        // Redirect to new item after creating
        history.push(`/content/${modelZUID}/${res.data.ZUID}`);

        dispatch(
          notify({
            message: `Created new ${model.label} item`,
            kind: "save"
          })
        );
      } else {
        dispatch(
          notify({
            message: "Unknown issue creating new item",
            kind: "warn"
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
  }

  return (
    <WithLoader condition={!loading && item} message="Creating New Item">
      <section>
        <Header
          onSave={save}
          model={model}
          saving={saving}
          isDirty={item?.dirty}
          makeActive={setActive}
        />
        <main className={styles.ItemCreate}>
          <div className={styles.Editor}>
            <Editor
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
              <Divider className={styles.Divider} />
              <h2 className={styles.title}>Meta Settings</h2>
              {model && model.type === "dataset" ? (
                <DataSettings item={item} dispatch={dispatch} />
              ) : (
                <ItemSettings
                  instance={instance}
                  modelZUID={modelZUID}
                  item={item}
                  content={content}
                  dispatch={dispatch}
                />
              )}
            </div>
          </div>
        </main>
      </section>
    </WithLoader>
  );
}
