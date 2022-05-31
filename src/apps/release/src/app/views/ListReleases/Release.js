import { useSelector } from "react-redux";
import moment from "moment";

import { AppLink } from "@zesty-io/core/AppLink";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";

import styles from "./ListReleases.less";

export function Release(props) {
  const members = useSelector((state) => state.releaseMembers.data);

  return (
    <tr className={styles.ReleaseStep}>
      <td>
        <AppLink to={`/release/${props.release.ZUID}`}>
          {props.release.name}
        </AppLink>
      </td>
      <td>
        {moment(props.release.createdAt).format("hh:mm A on MMMM Do, YYYY Z")}
      </td>
      <td>{members[props.release.ZUID]?.length}</td>
      <td>{props.release.description}</td>
    </tr>
  );
}
