import { Box, Typography } from "@mui/material";

type TitleCellProps = {
  primaryText: string;
  secondaryText: string;
};
export const TitleCell = ({ primaryText, secondaryText }: TitleCellProps) => {
  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      height="100%"
    >
      <Typography
        color="text.primary"
        fontWeight={600}
        variant="body2"
        noWrap
        sx={{
          width: "100%",
        }}
      >
        {primaryText}
      </Typography>
      {!!secondaryText && (
        <Typography
          color="text.secondary"
          variant="body2"
          noWrap
          sx={{
            width: "100%",
          }}
        >
          {secondaryText}
        </Typography>
      )}
    </Box>
  );
};
