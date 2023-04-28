import { FC, useCallback } from "react";
import { ContentItem } from "../../services/types";
import { ContentListItem } from "./ContentListItem";
import Stack from "@mui/material/Stack";
import { FixedSizeList } from "react-window";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";

type ContentList = {
  results: ContentItem[];
  loading: boolean;
};

export const ContentList: FC<ContentList> = ({
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
        return (
          <ContentListItem
            key={result.meta.ZUID}
            result={result}
            style={style}
          />
        );
      } else {
        return (
          <ContentListItem
            key={index}
            result={results[index]}
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
      data-cy="ContentList"
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
