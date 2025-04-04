import { Box, Skeleton, Stack } from "@mui/material";
import { LoadingQuote } from "../../components/LoadingQuote";

export const LoadingShell = () => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        height: "inherit",
      }}
    >
      <Stack
        sx={{
          backgroundColor: "grey.900",
          height: "100%",
          p: 1.5,
          gap: 1.5,
        }}
      >
        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            height: 24,
          }}
        >
          <Skeleton
            variant="text"
            width={130}
            height="100%"
            sx={{ backgroundColor: "grey.700" }}
          />
          <Skeleton
            variant="rounded"
            width={16}
            height={16}
            sx={{ backgroundColor: "grey.700" }}
          />
        </Stack>
        <Skeleton
          variant="rounded"
          width="100%"
          height={36}
          sx={{ backgroundColor: "grey.700" }}
        />
        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            height: 24,
            my: 0.75,
            mr: 0.5,
            gap: 1,
          }}
        >
          <Skeleton
            variant="circular"
            width={24}
            height={24}
            sx={{ backgroundColor: "grey.700", flexShrink: 0 }}
          />
          <Skeleton
            variant="text"
            width="100%"
            height="100%"
            sx={{ backgroundColor: "grey.700" }}
          />
        </Stack>
        <Box height={20} width={80}>
          <Skeleton
            variant="text"
            width="100%"
            height="100%"
            sx={{ backgroundColor: "grey.700" }}
          />
        </Box>
        <Stack>
          {Array(10)
            .fill(0)
            .map((_, index) => (
              <Stack
                key={index}
                sx={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  height: 24,
                  mr: 3,
                  gap: 1,
                }}
              >
                <Skeleton
                  variant="circular"
                  width={16}
                  height={16}
                  sx={{ backgroundColor: "grey.700", flexShrink: 0 }}
                />
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={12}
                  sx={{ backgroundColor: "grey.700" }}
                />
              </Stack>
            ))}
        </Stack>
        <Box height={20} width={80}>
          <Skeleton
            variant="text"
            width="100%"
            height="100%"
            sx={{ backgroundColor: "grey.700" }}
          />
        </Box>
        <Stack>
          {Array(10)
            .fill(0)
            .map((_, index) => (
              <Stack
                key={index}
                sx={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  height: 24,
                  mr: 3,
                  gap: 1,
                }}
              >
                <Skeleton
                  variant="circular"
                  width={16}
                  height={16}
                  sx={{ backgroundColor: "grey.700", flexShrink: 0 }}
                />
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={12}
                  sx={{ backgroundColor: "grey.700" }}
                />
              </Stack>
            ))}
        </Stack>
      </Stack>
      <LoadingQuote />
    </Box>
  );
};
