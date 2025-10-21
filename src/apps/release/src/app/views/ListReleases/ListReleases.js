import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

import { Release } from "./Release";

import styles from "./ListReleases.less";
export function ListReleases({ isContentSubpage }) {
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
          Create Release
        </Button>
      </section>

      <table data-cy="ReleaseTable" className={styles.ReleaseTable}>
        <thead>
          <tr>
            <th className={styles.subheadline}>Title</th>
            <th className={styles.subheadline}>Created At</th>
            <th className={styles.subheadline}>Members</th>
            <th className={styles.subheadline}>Description</th>
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
