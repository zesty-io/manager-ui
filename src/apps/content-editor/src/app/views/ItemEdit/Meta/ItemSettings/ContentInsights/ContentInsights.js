import React, { useState } from "react";

import { Url } from "@zesty-io/core/Url";
import { Button } from "@zesty-io/core/Button";
import { Divider } from "@zesty-io/core/Divider";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { faCheck, faSearchDollar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";

import styles from "./ContentInsights.less";
export function ContentInsights(props) {
  const [showAllWords, setShowAllWords] = useState(false);

  // clean up functions
  const stripTags = (string) => {
    return string.replace(/(<([^>]+)>)/gi, "");
  };
  const stripEncoded = (string) => {
    return string.replace(/(&(.*?);)/gi, " ");
  };
  const stripHidden = (string) => {
    return string.replace(/(\r|\n|\t)/gi, " ");
  };
  const stripZUIDs = (string) => {
    return string.replace(/(\d-(.*?)-(.*?))(,| )/gi, " ");
  };
  const stripPunctuation = (string) => {
    return string.replace(/("|,|:|;|\. |!)/gi, " ");
  };
  const stripDoubleSpace = (string) => {
    return string.replace(/\s\s+/g, " ");
  };
  const stripDashesAndSlashes = (string) => {
    return string.replace(/-|\//g, " ");
  };
  const commonwords = [
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
  ];

  const findMatch = (needle, haystack) => {
    let truth = false;
    haystack.forEach((word) => {
      if (word.toLowerCase() == needle.toLowerCase()) truth = true;
    });
    return truth;
  };

  let combinedString = "";
  let wordCount = {};
  let metaWordCount = {};

  // Working with Content
  // Content: combine all the text content we find from the item
  for (const [key, value] of Object.entries(props.content)) {
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
    props.meta.metaTitle +
    " " +
    props.meta.path +
    " " +
    props.meta.metaDescription;
  // Meta: clean the string
  combinedMetaString = stripDoubleSpace(
    stripPunctuation(stripDashesAndSlashes(combinedMetaString.toLowerCase()))
  );

  // Content: get total word counts with initial split
  let splitWords = combinedString.split(" ");
  let totalWords = splitWords.length;

  // Content & Meta: remove common words
  commonwords.forEach((commonWord) => {
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
    <Card className={styles.ContentInsights}>
      <CardHeader>
        <section>
          <div>
            <FontAwesomeIcon icon={faSearchDollar} />
            &nbsp;Content Insights
          </div>
        </section>
      </CardHeader>
      <CardContent>
        <div className={styles.level}>
          <div>
            Total Words <span>{totalWords}</span>
          </div>
          <div>
            Non-Common* Words <span>{totalNonCommonWords}</span>
          </div>
          <div>
            Unique Words* <span>{totalUniqueNonCommonWords}</span>
          </div>
        </div>
        <Divider className={styles.divider} />
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
        <Divider className={styles.divider} />
        <h4>Word Occurences from Content</h4>
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
              size="small"
              className={styles.toggleButton}
              kind="outlined"
              onClick={() => setShowAllWords(true)}
            >
              Show Non-Recurring Words
            </Button>
          )}
          {showAllWords && (
            <Button
              size="small"
              className={styles.toggleButton}
              kind="outlined"
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
        <Divider className={styles.divider} />
        <h4>Words Occurences from the URL, Meta Title and Description</h4>
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
}
