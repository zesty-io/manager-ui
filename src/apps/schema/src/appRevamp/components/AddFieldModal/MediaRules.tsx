import {
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  TextField,
  FormLabel,
  Tooltip,
} from "@mui/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

export const MediaRules = () => {
  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        gap="20px"
      >
        <FormControlLabel
          sx={{
            alignItems: "flex-start",
          }}
          control={
            <Checkbox
              sx={{
                color: "grey.200",
              }}
            />
          }
          label={
            <Box>
              <Typography variant="body2">
                Allow multiple files to be selected
              </Typography>
              <Typography
                // @ts-expect-error body3 module augmentation required
                variant="body3"
                color="text.secondary"
              >
                Ensures multiple files can be uploaded instead of default of
                just 1 file
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Media Item Limit
                  <Tooltip placement="top" title="">
                    <InfoRoundedIcon
                      sx={{ ml: 1, width: "10px", height: "10px" }}
                      color="action"
                    />
                  </Tooltip>
                </Typography>
                <TextField
                  size="small"
                  variant="outlined"
                  type="number"
                  value={"1"}
                  sx={{
                    mt: 1,
                  }}
                />
              </Box>
            </Box>
          }
        />
        <FormControlLabel
          control={
            <Checkbox
              sx={{
                color: "grey.200",
              }}
            />
          }
          label={
            <>
              <Typography variant="body2">Lock to a folder</Typography>
              <Typography
                // @ts-expect-error body3 module augmentation required
                variant="body3"
                color="text.secondary"
              >
                Ensures files can only be selected from a specific folder
              </Typography>
            </>
          }
        />
      </Box>
    </Box>
  );
};
