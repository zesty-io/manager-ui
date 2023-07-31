import { FC } from "react";
import { Box, Typography } from "@mui/material";

import notFound from "../../../../../../../../public/images/notFoundTransparent.png";

interface Props {
  navName: string;
}
export const NavError: FC<Props> = ({ navName }) => {
  return (
    <Box p={1.5} textAlign="center">
      <img src={notFound} alt="Not Found" style={{ width: 112, height: 110 }} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        We're sorry we are unable to load your {navName}. Please refresh your
        page and try again.
      </Typography>
    </Box>
  );
};
