import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { actions } from "shell/store/releases";

import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

import styles from "./Completed.less";

export function Completed({ plan }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const onStartNewPlan = useCallback(() => {
    dispatch(actions.resetPlan());
  }, [dispatch]);
  return (
    <div className={styles.Completed}>
      <div className={styles.display}>
        {t("release.publishedItems", { count: plan.successes })}
      </div>
      <Button
        variant="contained"
        color="primary"
        onClick={onStartNewPlan}
        startIcon={<AddIcon />}
      >
        {t("release.startNewPublishPlan")}
      </Button>
    </div>
  );
}
