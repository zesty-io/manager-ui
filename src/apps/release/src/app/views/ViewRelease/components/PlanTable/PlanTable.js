import { PlanStep } from "../PlanStep";

import styles from "./PlanTable.less";
export function PlanTable({ members }) {
  return (
    <table data-cy="PlanTable" className={styles.PlanTable}>
      <thead>
        <tr>
          <th className={styles.subheadline}>Lang</th>
          <th className={styles.subheadline}>Version</th>

          <th className={styles.subheadline}>Preview</th>
          {/* sorting by title would be cool but could be a stretch goal */}
          <th className={styles.subheadline}>Title</th>

          <th className={styles.subheadline}>Last Publish</th>
          <th className={styles.subheadline}>Remove</th>
        </tr>
      </thead>
      <tbody>
        <div>
          {members.map((member) => (
            <PlanStep key={member.ZUID} member={member} />
          ))}
        </div>
      </tbody>
      <tfoot>
        <tr>
          <td>
            <div>
              <strong>
                {/* Published {plan.successes}/{plan.successes + plan.data.length} */}
              </strong>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
