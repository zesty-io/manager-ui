import { useTranslation } from "react-i18next";
import { PlanStep } from "../PlanStep";

import styles from "./PlanTable.less";
export function PlanTable({ members }) {
  const { t } = useTranslation();
  return (
    <table data-cy="PlanTable" className={styles.PlanTable}>
      <thead>
        <tr>
          <th className={styles.subheadline}>{t("release.lang")}</th>
          <th className={styles.subheadline}>
            {t("shell.relationalSortVersion")}
          </th>

          <th className={styles.subheadline}>{t("common.preview")}</th>
          {/* sorting by title would be cool but could be a stretch goal */}
          <th className={styles.subheadline}>
            {t("shell.legacySearchSortTitle")}
          </th>

          <th className={styles.subheadline}>{t("release.lastPublish")}</th>
          <th className={styles.subheadline}>{t("common.remove")}</th>
        </tr>
      </thead>
      <tbody>
        {members.map((member) => (
          <PlanStep key={member.ZUID} member={member} />
        ))}
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
