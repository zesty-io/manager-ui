import { useState } from "react";
import { useSelector } from "react-redux";
import cx from "classnames";

import { AppLink } from "@zesty-io/core/AppLink";
import { Button } from "@zesty-io/core/Button";
import { Search } from "@zesty-io/core/Search";

import { Release } from "./Release";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import styles from "./ListReleases.less";
export function ListReleases() {
  const releases = useSelector((state) => state.releases.data);

  const [query, setQuery] = useState("");

  return (
    <>
      <section className={styles.ReleaseHeader}>
        <AppLink className={styles.Create} to={`/release/create`}>
          <Button data-cy="release-createBtn" size="large">
            <FontAwesomeIcon icon={faPlus} /> Create Release
          </Button>
        </AppLink>
        <Search
          placeholder="Search Release Title"
          onChange={(value) => {
            setQuery(value);
          }}
        />
      </section>
      <section className={styles.ListReleases}>
        {releases
          .filter((release) => {
            if (query === "") {
              return release;
            } else if (
              release.name.toLowerCase().includes(query.toLowerCase())
            ) {
              return release;
            }
          })
          .map((release) => (
            <Release key={release.ZUID} release={release}></Release>
          ))}
      </section>
    </>
  );
}
