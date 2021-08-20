import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { resetPlan } from "shell/store/release";
import { Button } from "@zesty-io/core/Button";
import styles from "./Completed.less";

export function Completed({ plan }) {
  const dispatch = useDispatch();
  const onStartNewPlan = useCallback(() => {
    dispatch(resetPlan());
  }, [dispatch]);
  return (
    <div className={styles.Completed}>
      <div className={styles.display}>Published {plan.successes} items</div>
      <Button kind="secondary" onClick={onStartNewPlan}>
        Start New Publish Plan
      </Button>
    </div>
  );
}
