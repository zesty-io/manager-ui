import { useSelector } from "react-redux";
import cx from "classnames";

import { AppLink } from "@zesty-io/core/AppLink";
import { Button } from "@zesty-io/core/Button";

import { Release } from "./Release";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import styles from "./ListReleases.less";
export function ListReleases() {
  const releases = useSelector((state) => state.releases.data);

  return (
    <>
      <section className={styles.ReleaseHeader}>
        <AppLink className={styles.Create} to={`/release/create`}>
          <Button data-cy="release-createBtn" size="large">
            <FontAwesomeIcon icon={faPlus} /> Create Release
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
