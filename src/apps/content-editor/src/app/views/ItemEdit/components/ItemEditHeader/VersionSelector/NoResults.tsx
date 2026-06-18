import { Button, Box, Stack, Typography } from "@mui/material";
import { Search } from "@mui/icons-material";

import noResults from "../../../../../../../../../../public/images/noSearchResults.jpg";
import { Trans, useTranslation } from "react-i18next";

type NoResultsProps = {
  query: string;
  onSearchAgain: () => void;
};
export const NoResults = ({ query, onSearchAgain }: NoResultsProps) => {
  const { t } = useTranslation();
  return (
    <Stack gap={2.5} alignItems="center" p={2.5}>
      <img
        src={noResults}
        alt={t("content.itemListNoSearchResultsAlt")}
        loading="lazy"
        height={120}
      />
      <Box width={339} sx={{ whiteSpace: "break-spaces", textAlign: "center" }}>
        <Typography variant="h5" fontWeight={600}>
          <Trans
            i18nKey="content.itemEditStatusSearchNoResultsTitle"
            values={{ search: query }}
            components={{ strong: <strong /> }}
          />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("content.itemListSearchNoResultsBody")}
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<Search />}
        onClick={onSearchAgain}
      >
        {t("common.searchAgain")}
      </Button>
    </Stack>
  );
};
