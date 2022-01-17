import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { createMember } from "shell/store/releaseMembers";
import { fetchVersions } from "shell/store/contentVersions";

import ContentSearch from "shell/components/ContentSearch";
import { Select, Option } from "@zesty-io/core/Select";

import { PublishAll } from "./components/PublishAll";

import styles from "./Header.less";
export function Header({ plan }) {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();

  const releases = useSelector((state) => state.releases.data);

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

  return (
    <header data-cy="ReleaseHeader" className={styles.Header}>
      <Select
        name="release"
        value={params.zuid}
        onSelect={(val) => navigate(`/release/${val}`)}
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
      <PublishAll />
    </header>
  );
}
