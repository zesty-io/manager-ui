import { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import cx from "classnames";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";

import { FieldTypeText } from "@zesty-io/material";

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
    if (!name.trim()) {
      setError("Missing required release name");
      return;
    }

    setError("");
    setLoading(true);
    dispatch(
      createRelease({
        name: name.trim(),
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
          maxLength={50}
          value={name}
          onChange={(evt) => setName(evt.target.value)}
          required
          error={error}
        />
        <FieldTypeText
          data-cy="release-desc"
          label="Release Description"
          name="description"
          // TODO should this even really be a text area if the maxlen is 150?
          maxLength={150}
          value={description}
          onChange={(evt) => setDescription(evt.target.value)}
          multiline
          rows={6}
        />

        <Button
          variant="contained"
          data-cy="release-createBtn"
          disabled={loading}
          className={styles.Create}
          kind="save"
          size="large"
          onClick={handleCreate}
          startIcon={loading ? <CircularProgress size="20px" /> : <AddIcon />}
        >
          Create Release
        </Button>
      </div>
    </div>
  );
}
