import React from "react";
import { useSelector } from "react-redux";
import { PlanStep } from "../PlanStep";
import styles from "./PlanTable.less";

export function PlanTable({ plan }) {
  const content = useSelector(state => state.content);
  const contentVersions = useSelector(state => state.contentVersions);
  const languages = useSelector(state => state.languages);
  return (
    <table className={styles.PlanTable}>
      <thead>
        <tr>
          <th className={styles.subheadline}>Lang</th>
          <th className={styles.subheadline}>Version</th>

          {/* sorting by title would be cool but could be a stretch goal */}
          <th className={styles.subheadline}>Title</th>

          <th className={styles.subheadline}>Last Publish</th>
          <th className={styles.subheadline}>Edit/View/Remove</th>
        </tr>
      </thead>
      <tbody>
        {plan.data.map(step => (
          <PlanStep
            key={step.ZUID}
            content={content[step.ZUID]}
            versions={contentVersions[step.ZUID]}
            languages={languages}
            step={step}
          />
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={5}>
            <div>Total plan steps 000</div>
            <div>Successful steps 000</div>
            <div>Failed steps 000</div>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
