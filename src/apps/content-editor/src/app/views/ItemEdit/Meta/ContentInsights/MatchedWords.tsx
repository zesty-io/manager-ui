import { Box, Stack, Typography, Chip } from "@mui/material";
import { Check, AddRounded, RemoveRounded } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";

import { AppState } from "../../../../../../../../shell/store/types";
import { cleanContent } from "./index";
import { DYNAMIC_META_FIELD_NAMES } from "../index";
import { useTranslation } from "react-i18next";

type MatchedWordsProps = {
  uniqueNonCommonWordsArray: string[];
};
export const MatchedWords = ({
  uniqueNonCommonWordsArray,
}: MatchedWordsProps) => {
  const { t } = useTranslation();
  const { itemZUID } = useParams<{
    itemZUID: string;
  }>();
  const item = useSelector((state: AppState) => state.content[itemZUID]);
  const [showAll, setShowAll] = useState(false);

  const contentAndMetaWordMatches = useMemo(() => {
    const textMetaFieldNames = [
      "metaDescription",
      "metaTitle",
      "metaKeywords",
      "pathPart",
      ...DYNAMIC_META_FIELD_NAMES,
    ];

    if (
      item?.web &&
      Object.values(item.web)?.length &&
      item?.data &&
      Object.values(item.data)?.length &&
      uniqueNonCommonWordsArray?.length
    ) {
      const metaWords = Object.entries({ ...item.web, ...item.data })?.reduce(
        (accu: string[], [fieldName, value]) => {
          if (textMetaFieldNames.includes(fieldName) && !!value) {
            // Replace all new line characters with a space and remove all special characters
            const cleanedValue = cleanContent(value);

            accu = [...accu, ...cleanedValue?.split(" ")];

            return accu;
          }

          return accu;
        },
        []
      );

      const uniqueMetaWords = Array.from(new Set(metaWords));

      return uniqueMetaWords.filter((metaWord) =>
        uniqueNonCommonWordsArray.includes(metaWord)
      );
    }

    return [];
  }, [uniqueNonCommonWordsArray, item?.web, item?.data]);

  return (
    <Box mt={1.5} mb={2}>
      <Typography variant="h6" color="text.secondary" fontWeight={700} mb={1}>
        {t("content.itemEditMetaContentAndMetaMatchedWords")}
      </Typography>
      <Stack direction="row" gap={1} flexWrap="wrap">
        {!contentAndMetaWordMatches?.length && (
          <Typography variant="body2" color="text.secondary">
            {t("content.itemEditMetaNoMatchingWords")}
          </Typography>
        )}
        {contentAndMetaWordMatches
          ?.slice(0, showAll ? undefined : 9)
          ?.map((word) => (
            <Chip
              key={word}
              label={word}
              size="small"
              icon={<Check color="action" />}
              variant="outlined"
            />
          ))}
        {contentAndMetaWordMatches?.length > 10 && (
          <Chip
            label={
              showAll
                ? t("content.itemEditMetaSeeLess")
                : t("content.itemEditMetaSeeMore")
            }
            size="small"
            variant="outlined"
            icon={
              showAll ? (
                <RemoveRounded color="action" />
              ) : (
                <AddRounded color="action" />
              )
            }
            onClick={() => setShowAll(!showAll)}
          />
        )}
      </Stack>
    </Box>
  );
};
