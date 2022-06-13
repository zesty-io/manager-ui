import { useSelector } from "react-redux";

import Button from "@mui/material/Button";

import AddIcon from "@mui/icons-material/Add";

import { AppLink } from "@zesty-io/core/AppLink";

import { Release } from "./Release";

import styles from "./ListReleases.less";
export function ListReleases() {
  const releases = useSelector((state) => state.releases.data);

  return (
    <>
      <section className={styles.ReleaseHeader}>
        <AppLink className={styles.Create} to={`/release/create`}>
          <Button
            variant="contained"
            data-cy="release-createBtn"
            size="large"
            startIcon={<AddIcon />}
          >
            Create Release
          </Button>
        </AppLink>
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
            <Release key={release.ZUID} release={release}></Release>
          ))}
        </tbody>
      </table>
    </>
  );
}
