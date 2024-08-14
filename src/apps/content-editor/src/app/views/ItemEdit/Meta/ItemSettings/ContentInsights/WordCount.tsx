import { NumberInputOwnerState } from "@mui/base";
import { Stack, Box, Typography, Divider } from "@mui/material";

type WordCountProps = {
  totalWords: number;
  totalUniqueWords: number;
  totalUniqueNonCommonWords: number;
};
export const WordCount = ({
  totalWords,
  totalUniqueWords,
  totalUniqueNonCommonWords,
}: WordCountProps) => {
  return (
    <Stack
      direction="row"
      height={84}
      bgcolor="background.paper"
      border={1}
      borderColor="border"
      borderRadius={2}
      width="100%"
      p={2}
      boxSizing="border-box"
    >
      <Box flex={1}>
        <Typography variant="body2" color="text.secondary">
          Words
        </Typography>
        <Typography variant="h4" color="text.primary" fontWeight={600}>
          {totalWords}
        </Typography>
      </Box>
      <Divider
        orientation="vertical"
        variant="middle"
        flexItem
        sx={{ mx: 2, my: 0, borderRightWidth: "2px" }}
      />
      <Box flex={1}>
        <Typography variant="body2" color="text.secondary">
          Unique Words
        </Typography>
        <Typography variant="h4" color="text.primary" fontWeight={600}>
          {totalUniqueWords}
        </Typography>
      </Box>
      <Divider
        orientation="vertical"
        variant="middle"
        flexItem
        sx={{ mx: 2, my: 0, borderRightWidth: "2px" }}
      />
      <Box flex={1}>
        <Typography variant="body2" color="text.secondary">
          Non Common Words
        </Typography>
        <Typography variant="h4" color="text.primary" fontWeight={600}>
          {totalUniqueNonCommonWords}
        </Typography>
      </Box>
    </Stack>
  );
};
