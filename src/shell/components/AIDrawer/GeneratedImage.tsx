import { Box, CircularProgress } from "@mui/material";
import { useState } from "react";

export const GeneratedImage = ({ src }: { src: string }) => {
  const [loading, setLoading] = useState(true);

  return (
    <Box position="relative" width={200} height={200}>
      {loading && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          sx={{ transform: "translate(-50%, -50%)" }}
        >
          <CircularProgress size={40} />
        </Box>
      )}
      <Box
        data-cy="AIDrawerGeneratedImage"
        component="img"
        display="block"
        width="100%"
        height="100%"
        sx={{ objectFit: "cover" }}
        src={`${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${src}/getimage/?w=200&h=200&type=fit`}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)} // hide spinner if image fails
        style={{ visibility: loading ? "hidden" : "visible" }}
      />
    </Box>
  );
};
