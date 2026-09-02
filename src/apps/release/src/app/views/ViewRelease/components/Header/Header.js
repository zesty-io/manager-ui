import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { createMember } from "shell/store/releaseMembers";
import { fetchVersions } from "shell/store/contentVersions";

import { Button, Select, MenuItem } from "@mui/material";
import FastRewindIcon from "@mui/icons-material/FastRewind";

import ContentSearch from "shell/components/LegacyContentSearch";

import { PublishAll } from "./components/PublishAll";
import { DeleteRelease } from "./components/DeleteRelease";

import styles from "./Header.less";
export function Header({ plan, isContentSubpage }) {
  const { t } = useTranslation();
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
      <Button
        component={RouterLink}
        to={isContentSubpage ? `/content/releases` : `/release`}
        variant="contained"
        className={styles.BackBtn}
      >
        <FastRewindIcon fontSize="small" />
      </Button>

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
        placeholder={t("release.searchPlaceholder")}
        onSelect={onSelect}
        keepResultsOnSelect={true}
      />
      <DeleteRelease isContentSubpage={isContentSubpage} />
    </header>
  );
}
