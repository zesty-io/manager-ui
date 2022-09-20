import { Box, Typography, Button } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";

interface Props {
  title: string;
}

export const Header = ({ title }: Props) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        py: 2,
        px: 3,
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: "grey.100",
        mb: 2,
      }}
    >
      <Typography variant="h4" fontWeight={600}>
        {title}
      </Typography>
      <Button startIcon={<FileUploadIcon />} variant="contained">
        Upload
      </Button>
    </Box>
  );
};
