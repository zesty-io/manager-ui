import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";

import { Divider, Button, Card, CardHeader, CardContent } from "@mui/material";
import { SavedSearch } from "@mui/icons-material";

import { faCheck, faSearchDollar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";

import styles from "./ContentInsights.less";
import { AppState } from "../../../../../../../../../shell/store/types";
import { useGetContentModelFieldsQuery } from "../../../../../../../../../shell/services/instance";
import { ActivityByResource } from "../../../../../../../../reports/src/app/views/ActivityLog/components/ActivityByResource";

const COMMON_WORDS: Readonly<string[]> = [
  "null",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "our",
  "one",
  "two",
  "three",
  "four",
  "five",
  "I'm",
  "that's",
  "it's",
  "aren't",
  "we've",
  "i've",
  "didn't",
  "don't",
  "you'll",
  "you're",
  "we're",
  "Here's",
  "about",
  "actually",
  "always",
  "even",
  "given",
  "into",
  "just",
  "not",
  "Im",
  "thats",
  "its",
  "arent",
  "weve",
  "ive",
  "didnt",
  "dont",
  "the",
  "of",
  "to",
  "and",
  "a",
  "in",
  "is",
  "it",
  "you",
  "that",
  "he",
  "was",
  "for",
  "on",
  "are",
  "with",
  "as",
  "I",
  "his",
  "they",
  "be",
  "at",
  "one",
  "have",
  "this",
  "from",
  "or",
  "had",
  "by",
  "but",
  "some",
  "what",
  "there",
  "we",
  "can",
  "out",
  "were",
  "all",
  "your",
  "when",
  "up",
  "use",
  "how",
  "said",
  "an",
  "each",
  "she",
  "which",
  "do",
  "their",
  "if",
  "will",
  "way",
  "many",
  "then",
  "them",
  "would",
  "like",
  "so",
  "these",
  "her",
  "see",
  "him",
  "has",
  "more",
  "could",
  "go",
  "come",
  "did",
  "my",
  "no",
  "get",
  "me",
  "say",
  "too",
  "here",
  "must",
  "such",
  "try",
  "us",
  "own",
  "oh",
  "any",
  "youll",
  "youre",
  "also",
  "than",
  "those",
  "though",
  "thing",
  "things",
] as const;

// clean up functions
const stripTags = (string: string) => {
  return string.replace(/(<([^>]+)>)/gi, "");
};

const stripEncoded = (string: string) => {
  return string.replace(/(&(.*?);)/gi, " ");
};

const stripHidden = (string: string) => {
  return string.replace(/(\r|\n|\t)/gi, " ");
};

const stripZUIDs = (string: string) => {
  return string.replace(/(\d-(.*?)-(.*?))(,| )/gi, " ");
};

const stripPunctuation = (string: string) => {
  return string.replace(/("|,|:|;|\. |!)/gi, " ");
};

const stripDoubleSpace = (string: string) => {
  return string.replace(/\s\s+/g, " ");
};

const stripDashesAndSlashes = (string: string) => {
  return string.replace(/-|\//g, " ");
};

const findMatch = (needle: string, haystack: string[]) => {
  let truth = false;
  haystack.forEach((word) => {
    if (word.toLowerCase() == needle.toLowerCase()) truth = true;
  });
  return truth;
};

export const ContentInsights = ({}) => {
  const { itemZUID, modelZUID } = useParams<{
    itemZUID: string;
    modelZUID: string;
  }>();
  const item = useSelector((state: AppState) => state.content[itemZUID]);
  const { data: modelFields } = useGetContentModelFieldsQuery(modelZUID, {
    skip: !modelZUID,
  });
  const [showAllWords, setShowAllWords] = useState(false);

  const textFieldNames = useMemo(() => {
    if (modelFields?.length) {
      const textFieldTypes = [
        "text",
        "wysiwyg_basic",
        "wysiwyg_advanced",
        "article_writer",
        "markdown",
        "textarea",
      ];

      return modelFields.reduce((accu: string[], curr) => {
        if (textFieldTypes.includes(curr.datatype) && !curr.deletedAt) {
          accu = [...accu, curr.name];
          return accu;
        }

        return accu;
      }, []);
    }
  }, [modelFields]);

  const contentItemWordsArray = useMemo(() => {
    if (
      item?.data &&
      Object.values(item.data)?.length &&
      textFieldNames?.length
    ) {
      let words: string[] = [];

      textFieldNames.forEach((fieldName) => {
        let value = item?.data[fieldName];

        if (!!value) {
          value = stripDoubleSpace(
            stripPunctuation(
              stripHidden(
                stripEncoded(
                  stripTags(stripZUIDs(String(value).trim().toLowerCase()))
                )
              )
            )
          );

          words = [...words, ...value.split(" ")];
        }
      });

      return words;
    }

    return [];
  }, [textFieldNames, item?.data]);

  const uniqueWordsArray = Array.from(new Set(contentItemWordsArray));
  const uniqueNonCommonWordsArray = Array.from(
    uniqueWordsArray?.filter((word) => !COMMON_WORDS.includes(word))
  );

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

  let combinedString = "";
  let wordCount: Record<string, number> = {};
  let metaWordCount: Record<string, number> = {};

  // Working with Content
  // Content: combine all the text content we find from the item
  for (const [key, value] of Object.entries(item?.data ?? {})) {
    combinedString += " " + value;
  }

  // Content: clean the string up by remove values that are not considered word content
  combinedString = stripDoubleSpace(
    stripPunctuation(
      stripHidden(stripEncoded(stripTags(stripZUIDs(combinedString))))
    )
  );
  combinedString = combinedString.toLowerCase();

  // Meta: build combined string
  let combinedMetaString =
    item?.web?.metaTitle +
    " " +
    item?.web?.path +
    " " +
    item?.web?.metaDescription;
  // Meta: clean the string
  combinedMetaString = stripDoubleSpace(
    stripPunctuation(stripDashesAndSlashes(combinedMetaString.toLowerCase()))
  );

  // Content: get total word counts with initial split
  let splitWords = combinedString.split(" ");
  let totalWords = splitWords.length;

  // Content & Meta: remove common words
  COMMON_WORDS.forEach((commonWord) => {
    let re = new RegExp("\\b" + commonWord.toLowerCase() + "\\b", "ig");
    combinedString = combinedString.replace(re, "");
    combinedMetaString = combinedMetaString.replace(re, "");
  });
  // Content: strip left over double spaces
  combinedString = stripDoubleSpace(combinedString);
  splitWords = combinedString.split(" ");
  let totalNonCommonWords = splitWords.length;

  // Content: use split words to tally total count of numbers
  splitWords.forEach((word) => {
    if (!wordCount.hasOwnProperty(word)) {
      wordCount[word] = 1;
    } else {
      wordCount[word]++;
    }
  });

  // Meta: use split meta words to tally total count of numbers
  let splitMetaWords = combinedMetaString.split(" ");
  splitMetaWords.forEach((word) => {
    if (!metaWordCount.hasOwnProperty(word)) {
      metaWordCount[word] = 1;
    } else {
      metaWordCount[word]++;
    }
  });
  // Meta: Build Word Lists for output
  let metaWordArray = [];
  for (const [key, value] of Object.entries(metaWordCount)) {
    if (key != "") {
      metaWordArray.push({
        word: key,
        count: value,
        match: findMatch(key, splitWords),
      });
    }
  }
  // Content: Sort Word List by more occuring
  metaWordArray = metaWordArray.sort((a, b) => {
    return b.count - a.count;
  });

  // Content: Build Word Lists for output
  let wordArray = [];
  for (const [key, value] of Object.entries(wordCount)) {
    if (key != "") {
      wordArray.push({
        word: key,
        count: value,
        match: findMatch(key, splitMetaWords),
      });
    }
  }
  let totalUniqueNonCommonWords = wordArray.length;
  // Content: Sort Word List by more occuring
  wordArray = wordArray.sort((a, b) => {
    return b.count - a.count;
  });

  return (
    <Card
      className={styles.ContentInsights}
      sx={{
        backgroundColor: "theme.common.white",
        borderColor: "grey.100",
      }}
      variant="outlined"
    >
      <CardHeader
        avatar={<SavedSearch fontSize="small" sx={{ fill: "#10182866" }} />}
        title="Content Insights"
        sx={{
          backgroundColor: "grey.100",
        }}
        titleTypographyProps={{
          sx: {
            color: "text.primary",
          },
        }}
      ></CardHeader>
      <CardContent
        sx={{
          color: "text.primary",
        }}
      >
        <div className={styles.level}>
          <div>
            Total Words <span>{contentItemWordsArray?.length}</span>
          </div>
          <div>
            Non-Common* Words <span>{uniqueNonCommonWordsArray?.length}</span>
          </div>
          <div>
            Unique Words* <span>{uniqueWordsArray?.length}</span>
          </div>
        </div>
        <Divider
          sx={{
            my: 1,
          }}
        />
        <h4>Content and Meta Matched Words</h4>
        <div className={styles.wordBank}>
          {metaWordArray.map((item, i) => {
            if (item.match) {
              return (
                <div
                  className={cx(styles.wordGroup, styles.matched)}
                  key={`${item.word}match${i}`}
                >
                  <strong>
                    <FontAwesomeIcon icon={faCheck} />
                  </strong>
                  <span>{item.word}</span>
                </div>
              );
            }
          })}
        </div>
        <Divider
          sx={{
            my: 1,
          }}
        />
        <h4>
          Word occurrences from this Content Item (not the fully rendered page)
        </h4>
        <div className={styles.wordBank}>
          {wordArray.map((item, i) => {
            if (item.count > 1) {
              return (
                <div className={styles.wordGroup} key={`${item.word}${i}`}>
                  <strong>{item.count}</strong>
                  <span>{item.word}</span>
                </div>
              );
            }
          })}
          {!showAllWords && (
            <Button
              variant="outlined"
              size="small"
              className={styles.toggleButton}
              onClick={() => setShowAllWords(true)}
            >
              Show Non-Recurring Words
            </Button>
          )}
          {showAllWords && (
            <Button
              variant="outlined"
              size="small"
              className={styles.toggleButton}
              onClick={() => setShowAllWords(false)}
            >
              Hide Non-Recurring Words
            </Button>
          )}
        </div>
        {showAllWords && (
          <div className={styles.wordBank}>
            {wordArray.map((item, i) => {
              if (item.count == 1) {
                return (
                  <div className={styles.wordGroup} key={`${item.word}${i}`}>
                    <strong>{item.count}</strong>
                    <span>{item.word}</span>
                  </div>
                );
              }
            })}
          </div>
        )}
        <Divider
          sx={{
            my: 1,
          }}
        />
        <h4>Word occurrences from the URL, Meta Title and Description</h4>
        <div className={styles.wordBank}>
          {metaWordArray.map((item, i) => {
            return (
              <div className={styles.wordGroup} key={`${item.word}${i}`}>
                <strong>{item.count}</strong>
                <span>{item.word}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
