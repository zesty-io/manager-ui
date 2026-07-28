import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { AppLink } from "shell/components/AppLink";

import styles from "./ListReleases.less";
import { formatLocalized } from "shell/i18n/dates";

export function Release(props) {
  const { t } = useTranslation();
  const members = useSelector((state) => state.releaseMembers.data);
  const createdDate =
    props.release.createdAt && new Date(props.release.createdAt);

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
        {createdDate &&
          t("release.createdOn", {
            time: formatLocalized(createdDate, "hh:mm a"),
            date: formatLocalized(createdDate, "MMMM do, yyyy XXX"),
          })}
      </td>
      <td>{members[props.release.ZUID]?.length}</td>
      <td>{props.release.description}</td>
    </tr>
  );
}
