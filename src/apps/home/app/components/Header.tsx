import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";

export const Header = () => {
  const userFirstName = useSelector((state: any) => state.user.firstName);
  return (
    <Box
      sx={{
        height: "160px",
        color: "common.white",
        px: 3,
        py: 2,
        // @ts-ignore
        background: (theme) =>
          `linear-gradient(91.57deg, ${theme.palette.deepOrange?.[500]} 0%, ${theme.palette.deepOrange?.[600]} 100%)`,
      }}
    >
      <Typography variant="h4" fontWeight={600}>
        Good Morning, {userFirstName}
      </Typography>
      <Typography variant="subtitle1" marginTop={0.5}>
        Here is your instance summary of the last 30 days
      </Typography>
    </Box>
  );
};
