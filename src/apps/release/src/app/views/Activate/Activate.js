import { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import cx from "classnames";

import { faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@zesty-io/core/Button";

import { activate } from "shell/store/releases";

import styles from "./Activate.less";
export function Activate() {
  const dispatch = useDispatch();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const handleActivate = () => {
    setLoading(true);
    dispatch(activate())
      .then((res) => {
        if (res.status === 204) {
          history.push(`/release/create`);
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className={cx(styles.Activate, styles.bodyText)}>
      <div>
        <h1 className={styles.headline}>Releases</h1>
        <p className={styles.title}>
          Publish groups of content at the same time.
        </p>

        <Button
          disabled={loading}
          className={styles.Add}
          kind="save"
          size="large"
          onClick={handleActivate}
        >
          {loading ? (
            <FontAwesomeIcon icon={faSpinner} />
          ) : (
            <FontAwesomeIcon icon={faPlus} />
          )}
          Activate Release App
        </Button>
      </div>
    </div>
  );
}
