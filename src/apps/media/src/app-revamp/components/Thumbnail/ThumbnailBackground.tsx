import { Box } from "@mui/material";

const base = {
  backgroundColor: "grey.100",
  boxSizing: "border-box",
  height: "160px",
  overflow: "hidden",
  display: "flex",
};

const background = {
  green: {
    backgroundColor: "green.100",
  },
  blue: {
    backgroundColor: "blue.50",
  },
  red: {
    backgroundColor: "red.50",
  },
  purple: {
    backgroundColor: "purple.100",
  },
  black: {
    backgroundColor: "#000",
  },
};

export function ThumbnailBackground({
  color,
  children,
}: {
  color?: keyof typeof background;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        ...base,
        ...background[color],
      }}
    >
      {children}
    </Box>
  );
}
