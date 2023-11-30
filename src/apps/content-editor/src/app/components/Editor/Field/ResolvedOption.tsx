import { memo } from "react";
import { AppLink } from "@zesty-io/core/AppLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import styles from "./Field.less";

type ResolvedOptionProps = {
  itemZUID: string;
  modelZUID: string;
  html: JSX.Element;
};
export const ResolvedOption = memo(
  ({ itemZUID, modelZUID, html }: ResolvedOptionProps) => {
    return (
      <span className={styles.ResolvedOption}>
        <span onClick={(evt) => evt.stopPropagation()}>
          <AppLink
            className={styles.relatedItemLink}
            to={`/content/${modelZUID}/${itemZUID}`}
          >
            <FontAwesomeIcon icon={faEdit} />
          </AppLink>
        </span>
        &nbsp;{html}
      </span>
    );
  }
);
