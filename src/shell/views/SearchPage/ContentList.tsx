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

export const ContentList: FC<ContentList> = ({ results, loading }) => {
  const r = loading
    ? new Array(5) // arbitrary length array of junk data
    : results;
  const Row = useCallback(
    ({ index, style }) => {
      if (!loading) {
        const result = results[index];
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
            result={r[index]}
            style={style}
            loading={loading}
          />
        );
      }
    },
    [results]
  );

  return (
    <Stack direction="column" sx={{ width: "100%", height: "100%" }}>
      <AutoSizer>
        {({ height, width }: Size) => (
          <FixedSizeList
            itemSize={72}
            width={width}
            itemCount={r.length}
            height={height}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </Stack>
  );
};
