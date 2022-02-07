import { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import cx from "classnames";

import { faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@zesty-io/core/Button";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";

import { createRelease, fetchReleases } from "shell/store/releases";

import styles from "./CreateRelease.less";
export function CreateRelease() {
  const dispatch = useDispatch();
  const history = useHistory();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = () => {
    if (!name) {
      setError("Missing required release name");
      return;
    }

    setError("");
    setLoading(true);
    dispatch(
      createRelease({
        name,
        description,
      })
    )
      .then((res) => {
        if (res.status === 201) {
          dispatch(fetchReleases(res.data.ZUID))
            .then(() => {
              history.push(`/release/${res.data.ZUID}`);
            })
            .finally(() => setLoading(false));
        } else {
          setError(res.error);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={cx(styles.CreateRelease, styles.bodyText)}>
      <div>
        <FieldTypeText
          data-cy="release-name"
          label="Release Name"
          name="name"
          maxLength={150}
          value={name}
          onChange={(val) => setName(val.trim())}
          required
          error={error}
        />
        <FieldTypeTextarea
          data-cy="release-desc"
          label="Release Description"
          name="description"
          maxLength={150}
          value={description}
          onChange={(val) => setDescription(val)}
        />

        <Button
          data-cy="release-createBtn"
          disabled={loading}
          className={styles.Create}
          kind="save"
          size="large"
          onClick={handleCreate}
        >
          {loading ? (
            <FontAwesomeIcon icon={faSpinner} />
          ) : (
            <FontAwesomeIcon icon={faPlus} />
          )}
          Create Release
        </Button>
      </div>
    </div>
  );
}
