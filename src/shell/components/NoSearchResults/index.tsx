import { FC } from "react";
import { useHistory } from "react-router";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import ArrowBack from "@mui/icons-material/ArrowBack";

import { EmptyResults } from "../EmptyResults";
import { useParams } from "../../../shell/hooks/useParams";

type Props = {
  query: string;
};

export const NoSearchResults: FC<Props> = ({ query }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [params, setParams] = useParams();
  const hasFilters = !!(
    params.get("resource") ||
    params.get("user") ||
    params.get("datePreset") ||
    params.get("from") ||
    params.get("to")
  );

  const handleReset = () => {
    setParams(null, "to");
    setParams(null, "from");
    setParams(null, "filetype");
    setParams(null, "sort");
    setParams(null, "datePreset");
    setParams(null, "user");
    setParams(null, "resource");
  };

  const handleSearchAgain = () => {
    setParams(null, "to");
    setParams(null, "from");
    setParams(null, "filetype");
    setParams(null, "sort");
    setParams(null, "datePreset");
    setParams(null, "user");
    const searchField: HTMLInputElement = document.querySelector(
      "[data-cy=global-search-textfield] input"
    );
    searchField?.focus();
  };

  return (
    <Box
      data-cy="NoSearchResults"
      component="main"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
      }}
    >
      <EmptyResults
        variant={hasFilters ? "filter" : "search"}
        size="page"
        query={query}
        onAction={hasFilters ? handleReset : handleSearchAgain}
        secondaryAction={
          hasFilters
            ? undefined
            : {
                label: t("common.goBack"),
                icon: <ArrowBack />,
                onClick: () => history.goBack(),
                disabled: history.action === "POP",
              }
        }
      />
    </Box>
  );
};
