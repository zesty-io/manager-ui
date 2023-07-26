import { Box, Stack, Typography } from "@mui/material";
import { ApiCard } from "./ApiCard";
import { apiTypes } from ".";

export const ApiCardList = () => {
  return (
    <Box height="100%" sx={{ overflowY: "auto" }}>
      <Stack
        spacing={0.5}
        px={3}
        py={2}
        sx={{
          position: "sticky",
          top: 0,
          backgroundColor: "common.white",
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          API Access Options
        </Typography>
        <Typography variant="body2">
          Zesty offers multiple APIs for accessing this content, each with
          unique benefits. Select one that best
          <br />
          meets your needs.
        </Typography>
      </Stack>
      <Box bgcolor="grey.50" height="100%">
        <Box
          gap={3}
          px={3}
          py={2}
          maxWidth="1440px"
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            gridColumnGap: "24px",
            gridRowGap: "24px",
          }}
        >
          {apiTypes.map((apiType) => (
            <ApiCard type={apiType} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};
