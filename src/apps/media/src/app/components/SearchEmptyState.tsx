import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import BackupTableRoundedIcon from "@mui/icons-material/BackupTableRounded";
import { useSelector } from "react-redux";

import { EmptyResults } from "shell/components/EmptyResults";
import { State } from "../../../../../shell/store/media-revamp";

interface Props {
  searchTerm: string;
}

export const SearchEmptyState = ({ searchTerm }: Props) => {
  const { t } = useTranslation();
  const history = useHistory();
  const isSelectDialog = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.isSelectDialog
  );

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <EmptyResults
        variant="search"
        size="page"
        title={t("media.searchEmptyStateTitle", { searchTerm })}
        description={t("media.searchEmptyStateDescription")}
        secondaryAction={
          isSelectDialog
            ? undefined
            : {
                label: t("media.goToAllMedia"),
                icon: <BackupTableRoundedIcon color="action" />,
                onClick: () => history.push("/media"),
              }
        }
        onAction={() =>
          history.push(`/media/search?term=${searchTerm}&cf=true`)
        }
      />
    </Box>
  );
};
