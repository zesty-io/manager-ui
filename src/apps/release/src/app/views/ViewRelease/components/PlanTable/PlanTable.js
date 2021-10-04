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
        {members.map((member) => {
          const item = content[member.resourceZUID];
          const lang = languages.find((lang) => lang.ID === item.meta.langID);
          return (
            <PlanStep
              key={member.ZUID}
              item={item}
              versions={contentVersions[member.ZUID]}
              lang={lang?.code}
              step={member}
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
