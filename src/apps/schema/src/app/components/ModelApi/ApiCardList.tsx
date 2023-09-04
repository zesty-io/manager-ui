import { Box, Stack, Typography } from "@mui/material";
import { ApiCard } from "./ApiCard";
import { apiTypes } from ".";

export const ApiCardList = () => {
  return (
    <Stack height="100%" pl={4} pt={2} sx={{ overflowY: "auto" }}>
      <Stack
        spacing={0.5}
        pb={2.5}
        sx={{
          backgroundColor: "grey.50",
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

      <Box
        gap={3}
        py={2}
        pr={4}
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(auto, 510px))",
          gridTemplateRows: "repeat(2, 378px)",
          gridColumnGap: "24px",
          gridRowGap: "24px",
          overflow: "auto",
          height: "100%",
        }}
      >
        {apiTypes.map((apiType) => (
          <ApiCard type={apiType} />
        ))}
      </Box>
    </Stack>
  );
};
