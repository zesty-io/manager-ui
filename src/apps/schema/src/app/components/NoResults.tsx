import { Box, Typography, Button, SxProps, SvgIcon } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";

import noSearchResults from "../../../../../../public/images/noSearchResults.svg";

const getTextConfig = (t: TFunction) => ({
  search: {
    header: (searchTerm: string) =>
      t("schema.noSearchResultsHeader", { searchTerm }),
    subHeader: t("schema.noSearchResultsSubHeader"),
    buttonText: t("common.searchAgain"),
    buttonIcon: SearchRoundedIcon,
  },
  filter: {
    header: () => t("schema.noFilterResultsHeader"),
    subHeader: t("schema.noFilterResultsSubHeader"),
    buttonText: t("schema.clearFilters"),
    buttonIcon: RestartAltRounded,
  },
});

interface Props {
  type: "search" | "filter";
  searchTerm?: string;
  onButtonClick: () => void;
  sx?: SxProps;
}
export const NoResults = ({ type, searchTerm, onButtonClick, sx }: Props) => {
  const { t } = useTranslation();
  const TEXT_CONFIG = getTextConfig(t);

  return (
    <Box
      data-cy="NoResults"
      textAlign="center"
      sx={{
        ...sx,
        maxWidth: 420,
        mx: "auto",
      }}
    >
      <img src={noSearchResults} alt={t("schema.noSearchResultsAlt")} />
      <Typography
        pt={1.5}
        pb={1}
        variant="h4"
        fontWeight={600}
        color="text.primary"
      >
        {TEXT_CONFIG[type].header(searchTerm ?? "")}
      </Typography>
      <Typography variant="body2" pb={3} color="text.secondary">
        {TEXT_CONFIG[type].subHeader}
      </Typography>
      <Button
        onClick={onButtonClick}
        variant="contained"
        startIcon={<SvgIcon component={TEXT_CONFIG[type].buttonIcon} />}
      >
        {TEXT_CONFIG[type].buttonText}
      </Button>
    </Box>
  );
};
