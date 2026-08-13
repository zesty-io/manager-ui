import { useMemo, useState } from "react";
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
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { debounce } from "lodash";
import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  isValid,
} from "date-fns";

import { useGetChatSessionsQuery } from "shell/services/mcp";

const formatShortRelativeTime = (date: Date) => {
  const now = new Date();

  const years = differenceInYears(now, date);
  if (years > 0) return `${years}y ago`;

  const months = differenceInMonths(now, date);
  if (months > 0) return `${months}mo ago`;

  const days = differenceInDays(now, date);
  if (days > 0) return `${days}d ago`;

  const hours = differenceInHours(now, date);
  if (hours > 0) return `${hours}h ago`;

  const minutes = differenceInMinutes(now, date);
  if (minutes > 0) return `${minutes}m ago`;

  return `${Math.max(differenceInSeconds(now, date), 0)}s ago`;
};

export const ChatHistory = () => {
  const [count, setCount] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const { data: chatSessions } = useGetChatSessionsQuery();

  const relevantChatSessions = useMemo(() => {
    if (!chatSessions) return [];

    return chatSessions.filter(
      (session) => session.referer === window.location.href
    );
  }, [chatSessions, window.location.href]);

  const filteredChatSessions = useMemo(() => {
    const normalizedSearchTerm = searchTerm?.trim().toLowerCase();

    if (!normalizedSearchTerm) return relevantChatSessions;

    return relevantChatSessions.filter((session) =>
      session.title?.toLowerCase().includes(normalizedSearchTerm)
    );
  }, [relevantChatSessions, searchTerm]);

  const handleSearch = debounce((term: string) => {
    setSearchTerm(term);
  }, 300);

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
          onChange={(e) => handleSearch(e.target.value)}
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
              tableLayout: "fixed",
              width: "100%",
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    bgcolor: "grey.100",
                    borderColor: "border",
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Chat History
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredChatSessions.map((session, index) => {
                const updatedDate = session.updatedAt
                  ? new Date(session.updatedAt)
                  : null;
                const updatedAgo =
                  updatedDate && isValid(updatedDate)
                    ? formatShortRelativeTime(updatedDate)
                    : "";

                return (
                  <TableRow
                    key={session.chatZuid}
                    hover
                    data-cy="ChatHistoryRow"
                    // onClick={() => setSelectedChat(index)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell
                      sx={{
                        borderBottom:
                          index === filteredChatSessions.length - 1 ? 0 : 1,
                        borderColor: "border",
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.25,
                        overflow: "hidden",
                      }}
                    >
                      <Tooltip title={session.title || "Untitled Chat"}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            minWidth: 0,
                          }}
                        >
                          {session.title || "Untitled Chat"}
                        </Typography>
                      </Tooltip>
                      <Typography
                        variant="body3"
                        color="text.disabled"
                        fontWeight={600}
                      >
                        {updatedAgo}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
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
