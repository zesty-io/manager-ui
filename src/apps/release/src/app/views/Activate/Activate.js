import { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import cx from "classnames";
import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";

import { activate } from "shell/store/releases";

import styles from "./Activate.less";
export function Activate({ isContentSubpage }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const handleActivate = () => {
    setLoading(true);
    dispatch(activate())
      .then((res) => {
        if (res.status === 204) {
          history.push(
            isContentSubpage ? `/content/releases/create` : `/release/create`
          );
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className={cx(styles.Activate, styles.bodyText)}>
      <div>
        <h1 className={styles.headline}>{t("release.releasesHeading")}</h1>
        <p className={styles.title}>{t("release.activateSubtitle")}</p>

        <Button
          variant="contained"
          color="success"
          disabled={loading}
          className={styles.Add}
          size="large"
          onClick={handleActivate}
          startIcon={loading ? <CircularProgress size="20px" /> : <AddIcon />}
        >
          {t("release.activateButton")}
        </Button>
      </div>
    </div>
  );
}
