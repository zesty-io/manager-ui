import { useSelector } from "react-redux";
import { PlanStep } from "../PlanStep";
import styles from "./PlanTable.less";

export function PlanTable({ members }) {
  const content = useSelector((state) => state.content);
  const contentVersions = useSelector((state) => state.contentVersions);
  const languages = useSelector((state) => state.languages);

  return (
    <table className={styles.PlanTable}>
      <thead>
        <tr>
          <th className={styles.subheadline}>Lang</th>
          <th className={styles.subheadline}>Version</th>

          {/* sorting by title would be cool but could be a stretch goal */}
          <th className={styles.subheadline}>Title</th>

          <th className={styles.subheadline}>Last Publish</th>
          <th className={styles.subheadline}>Preview</th>
          <th className={styles.subheadline}>Remove</th>
        </tr>
      </thead>
      <tbody>
        {members.map((step) => {
          const item = content[step.ZUID];
          return (
            <PlanStep
              key={step.ZUID}
              item={item}
              versions={contentVersions[step.ZUID]}
              lang={languages.find((l) => l.ID === item.meta.langID).code}
              step={step}
            />
          );
        })}
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
