import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";

import { AppState } from "../../../../../../../../shell/store/types";
import { useGetContentModelFieldsQuery } from "../../../../../../../../shell/services/instance";
import { WordCount } from "./WordCount";
import { MatchedWords } from "./MatchedWords";
import { MostMentionedWords } from "./MostMentionedWords";
import { DYNAMIC_META_FIELD_NAMES } from "../index";

export const COMMON_WORDS: Readonly<string[]> = [
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

const findMatch = (needle: string, haystack: string[]) => {
  let truth = false;
  haystack.forEach((word) => {
    if (word.toLowerCase() == needle.toLowerCase()) truth = true;
  });
  return truth;
};

export const cleanContent = (string: string) => {
  return string
    ?.replaceAll(/(\d-(.*?)-(.*?))(,| )/gi, "") // Remove zuids
    ?.replaceAll(/(<([^>]+)>)/gi, "") // Remove html tags
    ?.replaceAll(/(&(.*?);)/gi, " ") // Remove encoded characters
    ?.replaceAll(/[^a-zA-Z0-9\s']|(?<![a-zA-Z])'(?![a-zA-Z])/gi, "") // Remove non-digits and non-letters except apostrophe if it's used between letters
    ?.replaceAll(/\s\s+/g, " ") // Prevent double spaces
    ?.replaceAll(/(\r|\n|\t)/gi, " ") // Remove all hidden whitespaces
    ?.toLowerCase()
    ?.trim();
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
        if (
          textFieldTypes.includes(curr.datatype) &&
          !curr.deletedAt &&
          !DYNAMIC_META_FIELD_NAMES.includes(curr.name)
        ) {
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
          // value = stripDoubleSpace(
          //   stripPunctuation(
          //     stripHidden(
          //       stripEncoded(
          //         stripTags(stripZUIDs(String(value).trim().toLowerCase()))
          //       )
          //     )
          //   )
          // );
          value = cleanContent(String(value));

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

  return (
    <>
      <WordCount
        totalWords={contentItemWordsArray?.length}
        totalUniqueWords={uniqueWordsArray?.length}
        totalUniqueNonCommonWords={uniqueNonCommonWordsArray?.length}
      />
      <MatchedWords uniqueNonCommonWordsArray={uniqueNonCommonWordsArray} />
      <MostMentionedWords wordsArray={contentItemWordsArray} />
    </>
  );
};
