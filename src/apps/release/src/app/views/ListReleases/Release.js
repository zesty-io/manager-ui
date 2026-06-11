import { useSelector } from "react-redux";

import { AppLink } from "shell/components/AppLink";

import styles from "./ListReleases.less";
import { formatLocalized } from "shell/i18n-dates";

export function Release(props) {
  const members = useSelector((state) => state.releaseMembers.data);

  return (
    <tr className={styles.ReleaseStep}>
      <td>
        <AppLink
          to={
            props.isContentSubpage
              ? `/content/releases/${props.release.ZUID}`
              : `/release/${props.release.ZUID}`
          }
        >
          {props.release.name}
        </AppLink>
      </td>
      <td>
        {props.release.createdAt &&
          formatLocalized(
            new Date(props.release.createdAt),
            "hh:mm a 'on' MMMM do, yyyy XXX"
          )}
      </td>
      <td>{members[props.release.ZUID]?.length}</td>
      <td>{props.release.description}</td>
    </tr>
  );
}
