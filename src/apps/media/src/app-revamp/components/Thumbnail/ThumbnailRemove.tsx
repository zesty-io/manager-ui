import { Box } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export function ThumbnailRemove() {
  const onRemove = () => {};

  return (
    <>
      {onRemove && (
        <Box
          onClick={onRemove}
          sx={{
            right: 9,
            top: 8,
            position: "absolute",
            backgroundColor: "grey.100",
            width: "24px",
            height: "24px",
            borderRadius: "100%",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          <CloseRoundedIcon
            fontSize="small"
            sx={{
              mt: 0.3,
              color: "grey.400",
            }}
          />
        </Box>
      )}
    </>
  );
}
