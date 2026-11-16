import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { Release } from "./Release";

export function ListReleases({ isContentSubpage }) {
  const { t } = useTranslation();
  const releases = useSelector((state) => state.releases.data);

  return (
    <>
      <section>
        <Button
          component={RouterLink}
          variant="contained"
          data-cy="release-createBtn"
          size="large"
          startIcon={<AddIcon />}
          to={isContentSubpage ? `/content/releases/create` : `/release/create`}
        >
          {t("release.createRelease")}
        </Button>
      </section>

      <Box
        component="table"
        data-cy="ReleaseTable"
        sx={(theme) => ({
          width: "100%",
          borderCollapse: "collapse",
          "& tbody": {
            border: `1px solid ${theme.palette.grey[300]}`,
            borderRadius: "4px 4px 0 0",
            display: "block",
          },
          "& thead tr": {
            borderLeft: `4px solid ${theme.palette.grey[100]}`,
          },
          "& thead tr, & tbody tr": {
            display: "grid",
            gridTemplateColumns: "1fr 1fr 0.5fr 1fr",
            columnGap: 2,
            p: 1.5,
            alignItems: "center",
          },
          "& th": {
            typography: "h5",
            fontWeight: 400,
            letterSpacing: "0.08px",
            textAlign: "left",
          },
        })}
      >
        <thead>
          <tr>
            <th>{t("shell.legacySearchSortTitle")}</th>
            <th>{t("release.createdAt")}</th>
            <th>{t("release.members")}</th>
            <th>{t("shell.relationalSortDescription")}</th>
          </tr>
        </thead>
        <tbody>
          {releases.map((release) => (
            <Release
              key={release.ZUID}
              release={release}
              isContentSubpage={isContentSubpage}
            ></Release>
          ))}
        </tbody>
      </Box>
    </>
  );
}
