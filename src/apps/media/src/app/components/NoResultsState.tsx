import { FC } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

import { EmptyResults } from "shell/components/EmptyResults";
import { Filetype } from "../../../../../shell/store/media-revamp";
import { useParams } from "../../../../../shell/hooks/useParams";

type Props = {
  filetype: Filetype;
};

export const NoResultsState: FC<Props> = ({ filetype }) => {
  const { t } = useTranslation();
  const [, setParams] = useParams();

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
      }}
      className="NoResultsState"
    >
      <EmptyResults
        variant="filter"
        size="page"
        imageHeight={320}
        title={
          filetype === "Folder"
            ? t("media.noResultsStateTitleFolders")
            : t("media.noResultsStateTitleFiletype", { filetype })
        }
        description={t("media.noResultsStateDescription")}
        actionLabel={t("media.noResultsStateClearFilters")}
        onAction={() => {
          setParams(null, "to");
          setParams(null, "from");
          setParams(null, "filetype");
          setParams(null, "sort");
          setParams(null, "dateFilter");
        }}
      />
    </Box>
  );
};
