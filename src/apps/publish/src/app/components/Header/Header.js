import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { addStep, publishAll } from "shell/store/publishPlan";
import { fetchVersions } from "shell/store/contentVersions";
import { Button } from "@zesty-io/core/Button";
import ContentSearch from "shell/components/ContentSearch";
import styles from "./Header.less";

export function Header({ plan }) {
  const dispatch = useDispatch();
  const canPublish = plan.status !== "pending" && plan.data.length;
  const showSearch = plan.status !== "success";
  const showPublishAll = plan.status !== "success";
  const onSelect = useCallback(
    (item) => {
      dispatch(
        addStep({
          ZUID: item.meta.ZUID,
          version: item.meta.version,
          status: "idle",
        })
      );
      dispatch(fetchVersions(item.meta.contentModelZUID, item.meta.ZUID));
    },
    [dispatch]
  );
  const onPublishAll = useCallback(() => {
    dispatch(publishAll());
  }, [dispatch]);
  return (
    <header className={styles.Header}>
      <h1 className={styles.display}>Publish Plan</h1>
      {showSearch ? (
        <ContentSearch
          placeholder="Search for items to include in your publish plan"
          onSelect={onSelect}
          keepResultsOnSelect={true}
        />
      ) : null}
      {showPublishAll ? (
        <Button
          kind="alt"
          disabled={!canPublish && "disabled"}
          onClick={onPublishAll}
        >
          {plan.status === "pending" ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              &nbsp;Publishing
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCloudUploadAlt} />
              &nbsp;Publish All
            </>
          )}
        </Button>
      ) : null}
    </header>
  );
}
