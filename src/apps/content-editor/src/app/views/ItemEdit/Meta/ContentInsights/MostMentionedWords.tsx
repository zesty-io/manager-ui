import {
  Box,
  Stack,
  Typography,
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Search, AddRounded, RemoveRounded } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { COMMON_WORDS } from ".";
import SearchBox from "../../../../../../../../shell/components/SearchBox";
import { useTranslation } from "react-i18next";

type MostMentionedWordsProps = {
  wordsArray: string[];
};
export const MostMentionedWords = ({ wordsArray }: MostMentionedWordsProps) => {
  const { t } = useTranslation();
  const [filterKeyword, setFilterKeyword] = useState("");
  const [showAll, setShowAll] = useState(false);

  const wordCount = useMemo(() => {
    if (!!wordsArray?.length) {
      const wordsWithCount = wordsArray?.reduce(
        (accu: Record<string, number>, word) => {
          if (!COMMON_WORDS.includes(word)) {
            if (word in accu) {
              accu[word] += 1;
            } else {
              accu[word] = 1;
            }
          }

          return accu;
        },
        {}
      );

      return Object.entries(wordsWithCount ?? {})
        ?.filter(([, count]) => count > 1)
        ?.sort(([, a], [, b]) => b - a);
    }

    return [];
  }, [wordsArray]);

  const filteredWords = useMemo(() => {
    if (!!filterKeyword) {
      return wordCount?.filter(([word]) =>
        word.includes(filterKeyword.toLowerCase().trim())
      );
    }

    return wordCount;
  }, [filterKeyword, wordCount]);

  return (
    <Stack gap={2}>
      <Box>
        <Typography
          variant="h6"
          color="text.secondary"
          fontWeight={700}
          mb={0.25}
        >
          {t("content.itemEditMetaMostMentionedWords")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("content.itemEditMetaMostMentionedWordsDescription")}
        </Typography>
      </Box>
      <SearchBox
        value={filterKeyword}
        onChange={(evt) => setFilterKeyword(evt.target.value)}
        size="small"
        placeholder={t("content.itemEditMetaFilterWords")}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      <Stack direction="row" gap={1} flexWrap="wrap">
        {!filteredWords?.length && !filterKeyword && (
          <Typography variant="body2" color="text.secondary">
            {t("content.itemEditMetaNoRepeatedWords")}
          </Typography>
        )}
        {filteredWords
          ?.slice(0, showAll ? undefined : 9)
          ?.map(([word, count]) => (
            <Chip
              key={word}
              label={
                <>
                  {word}
                  <Box component="span" color="text.disabled" pl={1}>
                    {count}
                  </Box>
                </>
              }
              size="small"
              variant="outlined"
            />
          ))}
        {filteredWords?.length > 10 && (
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
    </Stack>
  );
};
