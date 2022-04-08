import { useSelector } from "react-redux";

import { AppLink } from "@zesty-io/core/AppLink";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";

import styles from "./ListReleases.less";

export function Release(props) {
  const members = useSelector((state) => state.releaseMembers.data);

  return (
    <Card className={styles.Card}>
      <CardHeader className={styles.CardHeader}>
        <p>{props.release.name}</p>
        <p className={styles.title}>
          {members[props.release.ZUID]?.length}{" "}
          <span className={styles.Members}>members</span>{" "}
        </p>
      </CardHeader>
      <CardContent className={styles.CardContent}>
        <p>{props.release.description}</p>
        <AppLink to={`/release/${props.release.ZUID}`}>
          <FontAwesomeIcon icon={faLink} />
          &nbsp; View Release
        </AppLink>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
