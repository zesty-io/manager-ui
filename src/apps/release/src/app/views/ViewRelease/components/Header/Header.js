import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";

import { createMember } from "shell/store/releaseMembers";
import { fetchVersions } from "shell/store/contentVersions";

import { Button, Select, MenuItem } from "@mui/material";
import FastRewindIcon from "@mui/icons-material/FastRewind";

import ContentSearch from "shell/components/LegacyContentSearch";
import { AppLink } from "@zesty-io/core/AppLink";

import { PublishAll } from "./components/PublishAll";
import { DeleteRelease } from "./components/DeleteRelease";

import styles from "./Header.less";
export function Header({ plan, isContentSubpage }) {
  const dispatch = useDispatch();
  const params = useParams();
  const history = useHistory();

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
      <AppLink to={isContentSubpage ? `/content/releases` : `/release`}>
        <Button variant="contained" className={styles.BackBtn}>
          <FastRewindIcon fontSize="small" />
        </Button>
      </AppLink>
      <PublishAll />
      <Select
        name="release"
        value={params.zuid}
        onChange={(evt) =>
          history.push(
            isContentSubpage
              ? `/content/releases/${evt.target.value}`
              : `/release/${evt.target.value}`
          )
        }
        size="small"
      >
        {releases.map((release) => {
          return (
            <MenuItem key={release.ZUID} value={release.ZUID}>
              {release.name}
            </MenuItem>
          );
        })}
      </Select>
      <ContentSearch
        placeholder="Search by ZUID or Meta Title to include in your release "
        onSelect={onSelect}
        keepResultsOnSelect={true}
      />
      <DeleteRelease isContentSubpage={isContentSubpage} />
    </header>
  );
}
