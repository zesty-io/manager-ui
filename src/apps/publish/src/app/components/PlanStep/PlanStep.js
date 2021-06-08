import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import moment from "moment-timezone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDatabase,
  faEye,
  faSpinner,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import { removeStep, updateStep } from "shell/store/publishPlan";
import { Select, Option } from "@zesty-io/core/Select";
import { AppLink } from "@zesty-io/core/AppLink";
import { Url } from "@zesty-io/core/Url";
import { Button } from "@zesty-io/core/Button";
import styles from "./PlanStep.less";

export function PlanStep({ step, item, versions, lang }) {
  const dispatch = useDispatch();
  const instanceID = useSelector(state => state.instance.randomHashID);
  const options = versions
    ? versions.map(content => {
        return {
          text: `Version ${content.meta.version}`,
          value: content.meta.version
        };
      })
    : [
        {
          text: `Version ${step.version}`,
          value: step.version
        }
      ];

  const onRemove = useCallback(() => {
    dispatch(removeStep(step));
  }, [dispatch, step]);

  const onUpdateVersion = useCallback(
    version => {
      dispatch(updateStep({ ...step, version: +version }));
    },
    [dispatch, step]
  );

  return (
    <tr
      className={cx(
        styles.bodyText,
        styles.PlanStep,
        step.status === "error" ? styles.error : null
      )}
    >
      <td>{lang}</td>

      <td>
        {/* Update preview link when version is changed */}
        <Select onSelect={onUpdateVersion} name="version" value={step.version}>
          {options.map(opt => (
            <Option key={opt.value} value={opt.value} text={opt.text} />
          ))}
        </Select>
      </td>

      <td>
        <AppLink
          to={`/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`}
        >
          {/* Use icon matched to items model type */}
          <FontAwesomeIcon icon={faDatabase} />
          {/* Use meta title. Show warning with link to edit if meta title is missing. */}
          &nbsp;
          {item.web.metaTitle ? item.web.metaTitle : "Missing Item Meta Title"}
        </AppLink>
      </td>

      <td>
        {item.publishing?.isPublished
          ? `Version ${item.publishing.version} was published ${moment(
              item.publishing.publishAt
            ).fromNow()}`
          : "Never published"}
      </td>

      <td>
        {/* Preview link should include specific selected version */}
        <Url
          target="_blank"
          title={`${CONFIG.URL_PREVIEW_PROTOCOL}${instanceID}${CONFIG.URL_PREVIEW}${item.web.path}?__version=${step.version}`}
          href={`${CONFIG.URL_PREVIEW_PROTOCOL}${instanceID}${CONFIG.URL_PREVIEW}${item.web.path}?__version=${step.version}`}
        >
          <FontAwesomeIcon icon={faEye} />
        </Url>
      </td>
      <td>
        {step.status === "pending" ? (
          <FontAwesomeIcon icon={faSpinner} spin />
        ) : (
          <Button onClick={onRemove}>
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        )}
      </td>
    </tr>
  );
}
