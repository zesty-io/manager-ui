import { FC, useCallback } from "react";
import Stack from "@mui/material/Stack";
import { FixedSizeList } from "react-window";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";

import { ContentItem, ContentModel } from "../../../services/types";
import { SearchPageItem } from "../SearchPage";
import { Content } from "./Content";
import { Model } from "./Model";

type SearchPageList = {
  results: SearchPageItem[];
  loading: boolean;
};

export const SearchPageList: FC<SearchPageList> = ({
  results: backendResults,
  loading,
}) => {
  const results = loading
    ? new Array(5) // arbitrary length array of junk data
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
    [backendResults]
  );

  return (
    <Stack
      direction="column"
      sx={{ width: "100%", height: "100%" }}
      data-cy="SearchPageList"
    >
      <AutoSizer>
        {({ height, width }: Size) => (
          <FixedSizeList
            itemSize={72}
            width={width}
            itemCount={results.length}
            height={height}
            style={{ borderRadius: "8px" }}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </Stack>
  );
};
