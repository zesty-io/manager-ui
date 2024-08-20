import { useParams } from "react-router";
import { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { ApiCard } from "./ApiCard";
import { apiTypes } from ".";
import { useGetContentModelQuery } from "../../../../../../shell/services/instance";

export const ApiCardList = () => {
  const { contentModelZUID } = useParams<{ contentModelZUID: string }>();
  const { data: modelData } = useGetContentModelQuery(contentModelZUID, {
    skip: !contentModelZUID,
  });

  const filteredApiTypes = useMemo(() => {
    if (modelData?.type === "dataset") {
      return apiTypes.filter((apiType) => apiType !== "site-generators");
    }

    return apiTypes;
  }, [modelData]);

  return (
    <Stack height="100%" pl={4} pt={2} sx={{ overflowY: "auto" }}>
      <Stack
        spacing={0.5}
        pb={2}
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
        pb={2}
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
        {filteredApiTypes?.map((apiType) => (
          <ApiCard type={apiType} />
        ))}
      </Box>
    </Stack>
  );
};
