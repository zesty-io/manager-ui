import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";

import { actions, publishAll } from "shell/store/releases";
import { createMember } from "shell/store/releaseMembers";
import { fetchVersions } from "shell/store/contentVersions";

import ContentSearch from "shell/components/ContentSearch";
import { Button } from "@zesty-io/core/Button";
import { Select, Option } from "@zesty-io/core/Select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";

import styles from "./Header.less";
export function Header({ plan }) {
  const dispatch = useDispatch();
  const params = useParams();
  const history = useHistory();

  const releases = useSelector((state) => state.releases.data);

  // const canPublish = plan.status !== "pending" && plan.data.length;
  // const showSearch = plan.status !== "success";
  // const showPublishAll = plan.status !== "success";

  const canPublish = false;
  const showSearch = false;
  const showPublishAll = false;

  const onSelect = useCallback(
    (item) => {
      dispatch(
        createMember(plan.ZUID, {
          resourceZUID: item.meta.ZUID,
          version: item.meta.version,
        })
      );
      dispatch(fetchVersions(item.meta.contentModelZUID, item.meta.ZUID));
    },
    [dispatch]
  );

  const onPublishAll = useCallback(() => {
    dispatch(publishAll());
  }, [dispatch]);

  // console.log("Header", releases);

  return (
    <header className={styles.Header}>
      <Select
        name="release"
        value={params.zuid}
        onSelect={(val) => history.push(`/release/${val}`)}
      >
        {releases.map((release) => {
          return (
            <Option
              key={release.ZUID}
              value={release.ZUID}
              text={release.name}
            />
          );
        })}
      </Select>
      <ContentSearch
        placeholder="Search for items to include in your release"
        onSelect={onSelect}
        keepResultsOnSelect={true}
      />
      <Button
        type="alt"
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
    </header>
  );
}
