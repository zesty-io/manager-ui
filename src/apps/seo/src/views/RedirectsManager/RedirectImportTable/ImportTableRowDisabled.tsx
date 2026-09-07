import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface RedirectImportTableRowProps {
  path: string;
  code: number;
  targetType: string;
  target?: string;
  query_string?: string;
  created?: string;
}

const ImportTableRowDisabled = ({
  path,
  code,
  targetType,
  target,
  query_string,
  created,
}: RedirectImportTableRowProps) => {
  const { t } = useTranslation();
  return (
    <Grid
      container
      spacing={3}
      width="100%"
      py={2}
      pl={2}
      pr={1}
      direction="row"
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "nowrap",
        color: "text.secondary",
        "&:nthOfType(even)": {
          background: "grey.50",
        },
      }}
    >
      <Grid size="grow" minWidth="200px">
        <Typography variant="body2" fontWeight={400} color="action.active">
          {path}
        </Typography>
      </Grid>

      <Grid minWidth="115px">
        <ToggleButtonGroup color="primary" value={code} size="small" disabled>
          <ToggleButton value={302}>302</ToggleButton>
          <ToggleButton value={301}>301</ToggleButton>
        </ToggleButtonGroup>
      </Grid>

      <Grid minWidth="130px">
        <Typography
          variant="body2"
          fontWeight={400}
          color="action.active"
          px={1}
        >
          {targetType}
        </Typography>
      </Grid>

      <Grid size="grow" minWidth="200px">
        <Typography
          variant="body2"
          fontWeight={400}
          color="action.active"
          px={1}
        >
          {target}
        </Typography>
      </Grid>
      <Grid width="115px">
        <Typography
          variant="body2"
          fontWeight={400}
          color="action.active"
          textAlign="center"
        >
          {created ? t("seo.importRowCreated") : t("seo.importRowPreExisting")}
        </Typography>
      </Grid>
    </Grid>
  );
};
export default ImportTableRowDisabled;
