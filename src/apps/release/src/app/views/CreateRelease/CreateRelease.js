import { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import cx from "classnames";

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@zesty-io/core/Button";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";

import { createRelease } from "shell/store/releases";
import { notify } from "shell/store/notifications";

import styles from "./CreateRelease.less";
export function CreateRelease() {
  const dispatch = useDispatch();
  const history = useHistory();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    dispatch(
      createRelease({
        name,
        description,
      })
    )
      .then((res) => {
        console.log(res);
        if (res.status === 201) {
          history.push(`/release/${res.data.ZUID}`);
          dispatch(
            notify({
              kind: "success",
              message: `Created Release: ${res.data.name}`,
            })
          );
        } else {
          dispatch(
            notify({
              kind: "warn",
              message: res.error,
            })
          );
        }
      })
      .catch((err) => {
        console.error(err);
        dispatch(
          notify({
            kind: "warn",
            message: "Failed creating a release",
          })
        );
      });
  };

  return (
    <div className={cx(styles.CreateRelease, styles.bodyText)}>
      <div>
        <FieldTypeText
          label="Release Name"
          name="name"
          onChange={(val) => setName(val)}
        />
        <FieldTypeTextarea
          label="Release Description"
          name="description"
          onChange={(val) => setDescription(val)}
        />

        <Button
          className={styles.Create}
          kind="save"
          size="large"
          onClick={handleCreate}
        >
          <FontAwesomeIcon icon={faPlus} />
          Create Release
        </Button>
      </div>
    </div>
  );
}
