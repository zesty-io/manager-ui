import { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import cx from "classnames";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";

import { faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
          variant="contained"
          color="success"
          disabled={loading}
          className={styles.Add}
          size="large"
          onClick={handleActivate}
          startIcon={loading ? <CircularProgress size="20px" /> : <AddIcon />}
        >
          Activate Release App
        </Button>
      </div>
    </div>
  );
}
