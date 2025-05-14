import { Typography, Box, Stack } from "@mui/material";
import { DataGridPro } from "@mui/x-data-grid-pro";

const COLUMNS = [
  {
    field: "incomingPath",
    headerName: "Incoming Path",
    flex: 1,
  },
  {
    field: "httpCode",
    headerName: "HTTP Code",
    width: 120,
  },
  {
    field: "targetPath",
    headerName: "Target Path",
    flex: 1,
  },
] as const;

export const Redirects = () => {
  return (
    <Box my={2} mx={4}>
      <Typography variant="h5" fontWeight={700} color="text.primary" mb={0.5}>
        Incoming Redirects
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={1.5}>
        Manage redirects that point to this content item
      </Typography>
      <DataGridPro columns={COLUMNS} />
    </Box>
  );
};
