import { FC, useCallback } from "react";
import { ContentItem } from "../../services/types";
import { ContentListItem } from "./ContentListItem";
import Stack from "@mui/material/Stack";
import { FixedSizeList } from "react-window";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";

type ContentList = {
  results: ContentItem[];
};

export const ContentList: FC<ContentList> = ({ results }) => {
  const Row = useCallback(
    ({ index, style }) => {
      const result = results[index];
      return (
        <ContentListItem key={result.meta.ZUID} result={result} style={style} />
      );
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
            itemCount={results.length}
            height={height}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </Stack>
  );
};
