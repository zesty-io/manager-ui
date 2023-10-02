import { FC, ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import notFound from "../../../public/images/notFoundTransparent.png";

interface Props {
  title?: string;
  message: string;
  button?: ReactNode;
}

export const NotFound: FC<Props> = ({ title, message, button }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
      width="100%"
      textAlign="center"
    >
      <Box width="400px">
        <img src={notFound} height="320px" />
        {title && (
          <Typography sx={{ mt: 8 }} variant="h4" fontWeight={600}>
            {title}
          </Typography>
        )}
        <>
          <Typography
            sx={{ mt: 1, mb: 3 }}
            variant="body2"
            color="text.secondary"
          >
            {message}
          </Typography>
          {button}
        </>
      </Box>
    </Box>
  );
};
