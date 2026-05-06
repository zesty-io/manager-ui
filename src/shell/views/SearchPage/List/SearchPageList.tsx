import { FC, useCallback } from "react";
import Stack from "@mui/material/Stack";
import { List } from "react-window";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";

import {
  ContentItem,
  ContentModel,
  File as MediaFile,
  Group,
} from "../../../services/types";
import { SearchPageItem } from "../SearchPage";
import { File } from "../../../hooks/useSearchCodeFilesByKeyword";
import { Content } from "./Content";
import { Model } from "./Model";
import { Code } from "./Code";
import { Media } from "./Media";
import { Block, BlockModel } from "./Block";

type SearchPageList = {
  results: SearchPageItem[];
  loading: boolean;
};

export const SearchPageList: FC<SearchPageList> = ({
  results: backendResults,
  loading,
}) => {
  const results = loading
    ? new Array(10) // arbitrary length array of junk data
    : backendResults;
  const Row = useCallback(
    ({ index, style }) => {
      if (!loading) {
        const result = backendResults[index];

        switch (result.type) {
          case "content":
            return (
              <Content
                key={result.ZUID}
                data={result.data as ContentItem}
                style={style}
              />
            );

          case "schema":
            return (
              <Model
                key={result.ZUID}
                data={result.data as ContentModel}
                style={style}
              />
            );

          case "block":
            return (
              <Block
                key={result.ZUID}
                data={result.data as BlockModel}
                style={style}
              />
            );

          case "code":
            return (
              <Code
                key={result.ZUID}
                data={result.data as File}
                style={style}
              />
            );

          case "media":
            let data: MediaFile | Group;

            if (result.subType === "item") {
              data = result.data as MediaFile;
            }

            if (result.subType === "folder") {
              data = result.data as Group;
            }

            return (
              <Media
                key={result.ZUID}
                data={data}
                style={style}
                subType={result.subType}
              />
            );

          default:
            break;
        }
      } else {
        return (
          <Content
            key={index}
            data={results[index]}
            style={style}
            loading={loading}
          />
        );
      }
    },
    [backendResults, loading]
  );

  return (
    <List
      rowHeight={92}
      rowCount={results.length}
      style={{ borderRadius: "8px" }}
      rowComponent={Row}
      rowProps={{}}
    />
  );
};
