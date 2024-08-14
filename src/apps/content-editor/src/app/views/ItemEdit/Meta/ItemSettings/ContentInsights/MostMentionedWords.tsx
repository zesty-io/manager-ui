import {
  Box,
  Stack,
  Typography,
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { COMMON_WORDS } from ".";

type MostMentionedWordsProps = {
  wordsArray: string[];
};
export const MostMentionedWords = ({ wordsArray }: MostMentionedWordsProps) => {
  const [filterKeyword, setFilterKeyword] = useState("");

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

      return Object.entries(wordsWithCount ?? {})?.sort(
        ([, a], [, b]) => b - a
      );
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
        <Typography variant="h6" color="text.secondary" fontWeight={700}>
          Most Mentioned Words in Content Item
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Check that your focus keywords are occurring a minimum 2 times.
        </Typography>
      </Box>
      <TextField
        value={filterKeyword}
        onChange={(evt) => setFilterKeyword(evt.target.value)}
        size="small"
        placeholder="Filter words"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      <Stack direction="row" gap={1} flexWrap="wrap">
        {filteredWords?.map(([word, count]) => (
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
      </Stack>
    </Stack>
  );
};
