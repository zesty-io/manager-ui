import { FC, useCallback } from "react";
import { ContentItem } from "../../services/types";
import { ContentListItem } from "./ContentListItem";
import Stack from "@mui/material/Stack";
import { FixedSizeList } from "react-window";

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
    <Stack direction="column" sx={{ width: "100%" }}>
      <FixedSizeList
        itemSize={72}
        width="100%"
        itemCount={results.length}
        height={500}
      >
        {Row}
      </FixedSizeList>
    </Stack>
  );
};
