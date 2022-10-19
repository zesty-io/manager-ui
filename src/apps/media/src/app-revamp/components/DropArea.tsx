import { Box, Typography } from "@mui/material";
import FileCopyRoundedIcon from "@mui/icons-material/FileCopyRounded";
import { GroupData, Bin } from "../../../../../shell/services/types";

interface Props {
  currentGroup: GroupData;
  currentBin: Bin;
}

export const DropArea = ({ currentGroup, currentBin }: Props) => {
  return (
    <Box
      sx={{
        backgroundColor: "primary.main",
        mt: -2,
        width: "100%",
        height: "calc(100% + 16px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          m: 10,
          // Generated from https://kovart.github.io/dashed-border-generator/ to match the dashed border in the design
          backgroundImage: `url(
            "data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='white' stroke-width='3' stroke-dasharray='12%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e"
          )`,
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 4,
          textAlign: "center",
        }}
      >
        <Box>
          <FileCopyRoundedIcon
            sx={{ color: "common.white", width: 38, height: 44 }}
          />
        </Box>
        <Typography variant="h1" fontWeight="600" color="common.white">
          Upload files to{" "}
          {currentGroup
            ? currentGroup.name
            : currentBin
            ? currentBin.name
            : "All Media"}{" "}
        </Typography>
      </Box>
    </Box>
  );
};
