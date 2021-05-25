import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import cx from "classnames";
import moment from "moment-timezone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDatabase,
  faEdit,
  faEye,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import { removeStep, updateStep } from "shell/store/publishPlan";
import { Select, Option } from "@zesty-io/core/Select";
import { AppLink } from "@zesty-io/core/AppLink";
import { Button } from "@zesty-io/core/Button";
import styles from "./PlanStep.less";

export function PlanStep({ step, content, versions, languages }) {
  const dispatch = useDispatch();
  const itemLanguage = languages.find(l => l.ID === content.meta.langID).code;
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
        step.status === "error" ? styles.error : null,
        step.status === "pending" ? styles.pending : null
      )}
    >
      <td>{itemLanguage}</td>

      <td>
        {/* Update preview link when version is changed */}
        <Select onSelect={onUpdateVersion} name="version" value={step.version}>
          {options.map(opt => (
            <Option key={opt.value} value={opt.value} text={opt.text} />
          ))}
        </Select>
      </td>

      <td>
        {/* Use icon matched to items model type */}
        <FontAwesomeIcon icon={faDatabase} />
        {/* Use meta title. Show warning with link to edit if meta title is missing. */}
        &nbsp;
        {content.web.metaTitle
          ? content.web.metaTitle
          : "Missing Item Meta Title"}
      </td>

      <td>
        {content.publishing?.isPublished
          ? `Version ${content.publishing.version} was published ${moment(
              content.publishing.publishAt
            ).fromNow()}`
          : "Never published"}
      </td>

      <td className={styles.actions}>
        <AppLink
          to={`/content/${content.meta.contentModelZUID}/${content.meta.ZUID}`}
        >
          <FontAwesomeIcon icon={faEdit} />
        </AppLink>

        {/* Preview link should include specific selected version */}
        <AppLink
          to={`/content/${content.meta.contentModelZUID}/${content.meta.ZUID}`}
        >
          <FontAwesomeIcon icon={faEye} />
        </AppLink>

        <Button onClick={onRemove}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </td>
    </tr>
  );
}
