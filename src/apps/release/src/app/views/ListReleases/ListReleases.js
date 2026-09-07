import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

import { Release } from "./Release";

import styles from "./ListReleases.less";
export function ListReleases({ isContentSubpage }) {
  const { t } = useTranslation();
  const releases = useSelector((state) => state.releases.data);

  return (
    <>
      <section className={styles.ReleaseHeader}>
        <Button
          component={RouterLink}
          variant="contained"
          data-cy="release-createBtn"
          size="large"
          startIcon={<AddIcon />}
          to={isContentSubpage ? `/content/releases/create` : `/release/create`}
        >
          {t("release.createRelease")}
        </Button>
      </section>

      <table data-cy="ReleaseTable" className={styles.ReleaseTable}>
        <thead>
          <tr>
            <th className={styles.subheadline}>
              {t("shell.legacySearchSortTitle")}
            </th>
            <th className={styles.subheadline}>{t("release.createdAt")}</th>
            <th className={styles.subheadline}>{t("release.members")}</th>
            <th className={styles.subheadline}>
              {t("shell.relationalSortDescription")}
            </th>
          </tr>
        </thead>
        <tbody>
          {releases.map((release) => (
            <Release
              key={release.ZUID}
              release={release}
              isContentSubpage={isContentSubpage}
            ></Release>
          ))}
        </tbody>
      </table>
    </>
  );
}
