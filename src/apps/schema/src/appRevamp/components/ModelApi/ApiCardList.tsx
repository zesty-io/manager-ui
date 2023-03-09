import { Box, Stack, Typography } from "@mui/material";
import { ApiCard } from "./ApiCard";
import { apiTypes } from ".";

export const ApiCardList = () => {
  return (
    <Box height="100%" sx={{ overflowY: "auto" }}>
      <Stack spacing={0.5} px={3} py={2}>
        <Typography variant="h5" fontWeight={600}>
          View APIs
        </Typography>
        <Typography variant="body2">
          Zesty offers multiple APIs for reading, creating, updating, deleting,
          and publishing content, each
          <br />
          with unique benefits. Select one that best meets your needs.
        </Typography>
      </Stack>
      <Box
        display="flex"
        bgcolor="grey.50"
        gap={3}
        px={3}
        py={2}
        flexWrap="wrap"
        sx={{ overflowY: "auto" }}
      >
        {apiTypes.map((apiType) => (
          <ApiCard type={apiType} />
        ))}
      </Box>
    </Box>
  );
};
