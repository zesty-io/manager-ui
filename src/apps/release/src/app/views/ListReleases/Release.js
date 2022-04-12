import { useSelector } from "react-redux";

import { AppLink } from "@zesty-io/core/AppLink";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";

import styles from "./ListReleases.less";

export function Release(props) {
  const members = useSelector((state) => state.releaseMembers.data);

  return (
    <tr className={styles.ReleaseStep}>
      <td>{props.release.name}</td>
      <td>{props.release.description}</td>
      <td>
        {members[props.release.ZUID]?.length}
        {/* <span className={styles.Members}>members</span>{" "} */}
      </td>

      <td>
        <AppLink to={`/release/${props.release.ZUID}`}>
          <FontAwesomeIcon icon={faLink} />
          &nbsp; View Release
        </AppLink>
      </td>
    </tr>
  );
}
