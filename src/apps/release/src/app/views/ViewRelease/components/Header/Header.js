import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { createMember } from "shell/store/releaseMembers";
import { fetchVersions } from "shell/store/contentVersions";

import { Box, Button, Select, MenuItem } from "@mui/material";
import FastRewindIcon from "@mui/icons-material/FastRewind";

import ContentSearch from "shell/components/LegacyContentSearch";

import { PublishAll } from "./components/PublishAll";
import { DeleteRelease } from "./components/DeleteRelease";

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
    <Box
      component="header"
      data-cy="ReleaseHeader"
      sx={{
        display: "grid",
        gridTemplateColumns: "auto max-content 225px 1fr max-content",
        columnGap: 2,
        alignItems: "center",
      }}
    >
      <Button
        component={RouterLink}
        to={isContentSubpage ? `/content/releases` : `/release`}
        variant="contained"
        data-cy="releaseBackBtn"
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
    </Box>
  );
}
