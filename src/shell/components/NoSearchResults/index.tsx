import { FC } from "react";
import { useHistory } from "react-router";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Trans, useTranslation } from "react-i18next";

import Search from "@mui/icons-material/Search";
import ArrowBack from "@mui/icons-material/ArrowBack";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

import noResults from "../../../../public/images/noSearchResults.jpg";
import { useParams } from "../../../shell/hooks/useParams";

type Props = {
  query: string;
  ignoreFilters?: boolean;
  hideBackButton?: boolean;
  onSearchAgain?: () => void;
  imageHeight?: number;
  isFilter?: boolean;
};

export const NoSearchResults: FC<Props> = ({
  query,
  onSearchAgain,
  ignoreFilters,
  hideBackButton,
  imageHeight = 200,
  isFilter,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [params, setParams] = useParams();
  const hasFilters =
    (params.get("resource") ||
      params.get("user") ||
      params.get("datePreset") ||
      params.get("from") ||
      params.get("to")) &&
    !ignoreFilters;

  return (
    <Box
      data-cy="NoSearchResults"
      component="main"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        textAlign={"center"}
        className="NoResultsState"
      >
        <Box width="400px">
          <img
            src={noResults}
            height={`${imageHeight}px`}
            alt={t("shell.noSearchResultsAlt")}
          />
          <Typography
            sx={{ mt: 4, mb: 1 }}
            variant="h4"
            fontWeight={600}
            color="text.primary"
          >
            {hasFilters ? (
              t("shell.noFilterResults")
            ) : (
              <Trans
                i18nKey={
                  isFilter
                    ? "shell.filterNoResultsRich"
                    : "shell.searchNoResultsRich"
                }
                values={{ query }}
                components={{
                  strong: <Box component="strong" fontWeight="bold" />,
                }}
              />
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {hasFilters
              ? t("shell.noFilterResultsSuggestion")
              : t("shell.searchNoResultsSuggestion")}
          </Typography>
          <Stack direction="row" justifyContent="center" sx={{ gap: 2 }}>
            {hasFilters ? (
              <Button
                variant="contained"
                onClick={() => {
                  setParams(null, "to");
                  setParams(null, "from");
                  setParams(null, "filetype");
                  setParams(null, "sort");
                  setParams(null, "datePreset");
                  setParams(null, "user");
                  setParams(null, "resource");
                }}
                color="primary"
                startIcon={<RestartAltRoundedIcon />}
              >
                {t("shell.resetFilters")}
              </Button>
            ) : (
              <>
                {!hideBackButton && (
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={() => history.goBack()}
                    disabled={history.action === "POP"}
                    color="inherit"
                    variant="contained"
                  >
                    {t("common.goBack")}
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={() => {
                    if (onSearchAgain) {
                      onSearchAgain();
                      return;
                    }
                    setParams(null, "to");
                    setParams(null, "from");
                    setParams(null, "filetype");
                    setParams(null, "sort");
                    setParams(null, "datePreset");
                    setParams(null, "user");
                    const searchField: HTMLInputElement =
                      document.querySelector(
                        "[data-cy=global-search-textfield] input"
                      );
                    searchField?.focus();
                  }}
                  color="primary"
                  startIcon={<Search />}
                >
                  {t("shell.searchAgain")}
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
