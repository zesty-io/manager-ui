import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import cx from "classnames";
import moment from "moment-timezone";

import { updateMember, deleteMember } from "shell/store/releaseMembers";

import {
  Link,
  Button,
  CircularProgress,
  Select,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { AppLink } from "@zesty-io/core/AppLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDatabase,
  faEye,
  faEyeSlash,
  faFile,
  faListAlt,
  faExternalLinkSquareAlt,
  faLink,
  faHome,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./PlanStep.less";

const ICONS = {
  templateset: faFile,
  pageset: faListAlt,
  dataset: faDatabase,
  external: faExternalLinkSquareAlt,
  internal: faLink,
  item: faFile,
  homepage: faHome,
  socialfeed: faDatabase,
};

export function PlanStep(props) {
  const dispatch = useDispatch();
  const params = useParams();

  const instanceID = useSelector((state) => state.instance.randomHashID);
  const item = useSelector((state) => state.content[props.member.resourceZUID]);

  const versions = useSelector(
    (state) => state.contentVersions[props.member.resourceZUID]
  );

  const lang = useSelector((state) =>
    state.languages.find((lang) => lang.ID === item.meta.langID)
  );

  const modelType = useSelector(
    (state) => state.models[item.meta.contentModelZUID]
  );

  const [loading, setLoading] = useState(false);

  const options = versions
    ? versions.map((content) => {
        let html = (
          <p>
            {content.meta.version === item?.publishing?.version ? (
              <strong>Live </strong>
            ) : (
              ""
            )}
            Version {content.meta.version}{" "}
            <small>
              {" "}
              [
              {moment(content.meta.createdAt).format(
                "MMM Do YYYY, [at] h:mm a"
              )}
              ]{" "}
            </small>
          </p>
        );

        return {
          text: html,
          value: content.meta.version,
        };
      })
    : [
        {
          text: `Version ${props.member.version}`,
          value: props.member.version,
        },
      ];

  const onUpdateVersion = useCallback(
    (version) => {
      dispatch(
        updateMember(props.member.releaseZUID, props.member.ZUID, {
          ...props.member,
          version: Number(version),
        })
      );
    },
    [dispatch, props.member]
  );

  const remove = () => {
    setLoading(true);
    dispatch(deleteMember(params.zuid, props.member.ZUID)).finally(() =>
      setLoading(false)
    );
  };

  return (
    <tr
      className={cx(
        styles.bodyText,
        styles.PlanStep,
        props.member.status === "error" ? styles.error : null
      )}
    >
      <td>{lang.code}</td>

      <td data-cy="release-member-version">
        {/* Update preview link when version is changed */}
        <Select
          onSelect={(e) => onUpdateVersion(e.target.value)}
          name="version"
          defaultValue={props.member.version}
          size="small"
          fullWidth
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.text}
            </MenuItem>
          ))}
        </Select>
      </td>

      <td>
        {/* Preview link should include specific selected version */}
        {item.web.path ? (
          <Link
            underline="none"
            color="secondary"
            target="_blank"
            title={`${CONFIG.URL_PREVIEW_PROTOCOL}${instanceID}${CONFIG.URL_PREVIEW}${item.web.path}?__version=${props.member.version}`}
            href={`${CONFIG.URL_PREVIEW_PROTOCOL}${instanceID}${CONFIG.URL_PREVIEW}${item.web.path}?__version=${props.member.version}`}
          >
            <FontAwesomeIcon icon={faEye} />
          </Link>
        ) : (
          <FontAwesomeIcon icon={faEyeSlash} />
        )}
      </td>

      <td>
        <AppLink
          to={`/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`}
        >
          <p>
            {/* Use icon matched to items model type */}
            <span className={styles.Icon}>
              <FontAwesomeIcon icon={ICONS[modelType.type]} />
            </span>

            {/* Use meta title. Show warning with link to edit if meta title is missing. */}

            {item.web.metaTitle
              ? item.web.metaTitle
              : "Missing Item Meta Title"}
          </p>
        </AppLink>
      </td>

      <td>
        {item.publishing?.isPublished
          ? `Version ${item.publishing.version} was published ${moment(
              item.publishing.publishAt
            ).fromNow()}`
          : "Never published"}
      </td>

      <td data-cy="release-member-delete">
        {loading ? (
          <CircularProgress size="20px" />
        ) : (
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={remove}
          >
            <CloseIcon fontSize="small" />
          </Button>
        )}
      </td>
    </tr>
  );
}
