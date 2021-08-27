import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { searchItems } from "shell/store/content";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faAsterisk,
  faExternalLinkAlt,
  faFile,
  faFileAlt,
  faLink,
  faTrashAlt,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import { Url } from "@zesty-io/core/Url";

import styles from "./RedirectsTableRow.less";
export default function RedirectsTableRow(props) {
  const dispatch = useDispatch();
  const content = useSelector((state) => state.content);

  const [path, setPath] = useState("");
  const [modelZuid, setModelZuid] = useState("");

  const findTarget = Object.values(content).find(
    (item) => item.meta.ZUID === props.target
  );

  useEffect(() => {
    if (props.targetType === "page") {
      if (findTarget) {
        setModelZuid(findTarget?.meta?.contentModelZUID);
        setPath(findTarget.web.path);
      } else {
        dispatch(searchItems(props.target)).then((res) => {
          if (res && res.data) {
            setModelZuid(res.data[0].meta.contentModelZUID);
            setPath(res.data[0].web.path);
          }
        });
      }
    }
  }, [props.target]);

  return (
    <div className={styles.RedirectsTableRow}>
      <span className={styles.RedirectsTableRowCell}>
        <code>{props.path}</code>
      </span>

      <span className={styles.RedirectsTableRowCell}>
        {props.code}&nbsp;
        <FontAwesomeIcon icon={faArrowRight} />
      </span>

      <span className={styles.RedirectsTableRowCell}>
        {props.targetType === "external" ? (
          <span>
            <FontAwesomeIcon icon={faExternalLinkAlt} />
            External&nbsp;
          </span>
        ) : props.targetType === "path" ? (
          <span>
            <FontAwesomeIcon icon={faFile} />
            Wildcard&nbsp;
          </span>
        ) : (
          <span>
            <FontAwesomeIcon icon={faFileAlt} />
            Internal&nbsp;
          </span>
        )}
      </span>

      {props.targetType === "page" ? (
        <span className={cx(styles.RedirectsTableRowCell, styles.to)}>
          <Link
            className={styles.internalLink}
            to={`/content/${modelZuid}/${props.target}`}
          >
            <FontAwesomeIcon className={styles.icon} icon={faLink} />
            &nbsp;
            <code>{path}</code>
          </Link>
        </span>
      ) : props.targetType === "external" ? (
        <span className={cx(styles.RedirectsTableRowCell, styles.to)}>
          <Url href={props.target} target="_blank" title="Redirect URL">
            <FontAwesomeIcon icon={faExternalLinkAlt} />
            &nbsp;<code>{props.target}</code>
          </Url>
        </span>
      ) : (
        <span className={cx(styles.RedirectsTableRowCell, styles.to)}>
          <FontAwesomeIcon icon={faAsterisk} />
          <code>{props.target}</code>
        </span>
      )}

      <span>{/* Helper for grid spacing to match header  */}</span>

      <span className={styles.RedirectsTableRowCell}>
        <Button
          className={cx(styles.removeBtn, "button deleteButton")}
          onClick={props.removeRedirect}
        >
          <FontAwesomeIcon icon={faTrashAlt} />
          Remove
        </Button>
      </span>
    </div>
  );
}
