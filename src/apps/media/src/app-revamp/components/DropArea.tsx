import { Box, Typography } from "@mui/material";
import FileCopyRoundedIcon from "@mui/icons-material/FileCopyRounded";
import { GroupData, Bin } from "../../../../../shell/services/types";
import { SxProps } from "@mui/system";

interface Props {
  currentGroup: GroupData;
  currentBin: Bin;
  isDefaultBin?: boolean;
  sx?: SxProps;
}

export const DropArea = ({
  currentGroup,
  currentBin,
  isDefaultBin,
  sx = {},
}: Props) => {
  return (
    <Box
      sx={{
        position: "absolute",
        zIndex: 1,
        backgroundColor: "rgba(16, 24, 40, 0.5)",
        mt: -2,
        width: "calc(100% - 220px)",
        height: "calc(100% - 64px)",
        //width: "100%",
        //height: "calc(100% - 134px)",
        //ml: -2,
        display: "flex",
        flexDirection: "column",
        ...sx,
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
          {isDefaultBin
            ? "All Media"
            : currentGroup
            ? currentGroup.name
            : currentBin.name}
        </Typography>
      </Box>
    </Box>
  );
};
