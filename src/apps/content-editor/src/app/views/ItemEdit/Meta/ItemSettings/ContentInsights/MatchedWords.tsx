import { Box, Stack, Typography, Chip } from "@mui/material";
import { Check } from "@mui/icons-material";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";

import {
  stripDashesAndSlashes,
  stripDoubleSpace,
  stripPunctuation,
} from "./index";
import { AppState } from "../../../../../../../../../shell/store/types";

type MatchedWordsProps = {
  uniqueNonCommonWordsArray: string[];
};
export const MatchedWords = ({
  uniqueNonCommonWordsArray,
}: MatchedWordsProps) => {
  const { itemZUID } = useParams<{
    itemZUID: string;
  }>();
  const item = useSelector((state: AppState) => state.content[itemZUID]);

  const contentAndMetaWordMatches = useMemo(() => {
    const textMetaFieldNames = [
      "metaDescription",
      "metaTitle",
      "metaKeywords",
      "pathPart",
    ];

    if (
      item?.web &&
      Object.values(item.web)?.length &&
      uniqueNonCommonWordsArray?.length
    ) {
      const metaWords = Object.entries(item.web)?.reduce(
        (accu: string[], [fieldName, value]) => {
          if (textMetaFieldNames.includes(fieldName) && !!value) {
            const cleanedValue = stripDoubleSpace(
              stripPunctuation(
                stripDashesAndSlashes(value.trim().toLowerCase())
              )
            );

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
  }, [uniqueNonCommonWordsArray, item?.web]);

  return (
    <Box mt={1.5} mb={2}>
      <Typography variant="h6" color="text.secondary" fontWeight={700} mb={1}>
        Content and Meta Matched Words
      </Typography>
      <Stack direction="row" gap={1}>
        {contentAndMetaWordMatches?.map((word) => (
          <Chip
            key={word}
            label={word}
            size="small"
            icon={<Check color="action" />}
            variant="outlined"
          />
        ))}
      </Stack>
    </Box>
  );
};
