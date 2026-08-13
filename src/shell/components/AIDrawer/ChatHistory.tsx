import { useState } from "react";
import {
  Stack,
  Box,
  TextField,
  Typography,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";

export const ChatHistory = () => {
  const [count, setCount] = useState(5);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  return (
    <Stack
      sx={{
        p: 2,
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TextField
          fullWidth
          placeholder="Search Chats"
          InputProps={{
            startAdornment: <SearchIcon color="action" />,
          }}
          sx={{
            mb: 2,
          }}
        />
        <TableContainer
          sx={{
            flex: 1,
            minHeight: 0,
          }}
        >
          <Table
            stickyHeader
            sx={{
              border: 1,
              borderColor: "border",
              borderRadius: 2,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    bgcolor: "grey.100",
                    fontSize: "12px",
                    lineHeight: "20px",
                    fontWeight: 600,
                    borderColor: "border",
                  }}
                >
                  Chat History
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array(count)
                .fill(0)
                .map((_, index) => (
                  <TableRow
                    key={index}
                    hover
                    data-cy="ChatHistoryRow"
                    onClick={() => setSelectedChat(index)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell
                      sx={{
                        borderBottom: index === count - 1 ? 0 : 1,
                        borderColor: "border",
                      }}
                    >
                      lorem ipsum {index}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Button
        fullWidth
        variant="contained"
        startIcon={<AddCircleIcon />}
        sx={{ mt: 2, flexShrink: 0 }}
        onClick={() => setCount(count + 1)}
      >
        New Chat
      </Button>
    </Stack>
  );
};
