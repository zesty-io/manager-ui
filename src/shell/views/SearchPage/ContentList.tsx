import { FC } from "react";
import { ContentItem } from "../../services/types";
import { ContentListItem } from "./ContentListItem";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

type ContentList = {
  results: ContentItem[];
};

export const ContentList: FC<ContentList> = ({ results }) => {
  return (
    <Stack direction="column" sx={{ width: "100%" }}>
      {results.map((result) => (
        <ContentListItem key={result.meta.ZUID} result={result} />
      ))}
    </Stack>
  );
};
