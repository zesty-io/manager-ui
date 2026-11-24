import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import { PlanStep } from "../PlanStep";

export function PlanTable({ members }) {
  const { t } = useTranslation();
  return (
    <Box
      component="table"
      data-cy="PlanTable"
      sx={(theme) => ({
        mt: 1,
        width: "100%",
        "& tbody": {
          border: `1px solid ${theme.palette.grey[300]}`,
          borderRadius: "4px 4px 0 0",
          height: "100%",
          display: "block",
        },
        "& thead tr": {
          borderLeft: `4px solid ${theme.palette.grey[100]}`,
        },
        "& thead tr, & tbody tr": {
          display: "grid",
          gridTemplateColumns:
            "60px minmax(200px, 400px) 75px minmax(200px, 1fr) minmax(auto, 400px) 90px",
          columnGap: 2,
          p: 1.5,
        },
        "& th": {
          typography: "h5",
          fontWeight: 400,
          letterSpacing: "0.08px",
          textAlign: "left",
        },
        "& tfoot": {
          position: "fixed",
          bottom: "6px",
        },
      })}
    >
      <thead>
        <tr>
          <th>{t("release.lang")}</th>
          <th>{t("shell.relationalSortVersion")}</th>

          <th>{t("common.preview")}</th>
          {/* sorting by title would be cool but could be a stretch goal */}
          <th>{t("shell.legacySearchSortTitle")}</th>

          <th>{t("release.lastPublish")}</th>
          <th>{t("common.remove")}</th>
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
    </Box>
  );
}
