import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { actions } from "shell/store/releases";

import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

import styles from "./Completed.less";

export function Completed({ plan }) {
  const dispatch = useDispatch();
  const onStartNewPlan = useCallback(() => {
    dispatch(actions.resetPlan());
  }, [dispatch]);
  return (
    <div className={styles.Completed}>
      <div className={styles.display}>Published {plan.successes} items</div>
      <Button
        variant="contained"
        color="secondary"
        onClick={onStartNewPlan}
        startIcon={<AddIcon />}
      >
        Start New Publish Plan
      </Button>
    </div>
  );
}
