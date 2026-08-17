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
  Skeleton,
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

import { ChatSession } from "shell/services/types";

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

type ChatHistoryProps = {
  sessions: ChatSession[];
  isLoading: boolean;
  onSelectSession: (chatZUID: string) => void;
  onNewChat: () => void;
};

export const ChatHistory = ({
  sessions,
  isLoading,
  onSelectSession,
  onNewChat,
}: ChatHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChatSessions = useMemo(() => {
    const normalizedSearchTerm = searchTerm?.trim().toLowerCase();

    if (!normalizedSearchTerm) return sessions;

    return sessions.filter((session) =>
      session.title?.toLowerCase().includes(normalizedSearchTerm)
    );
  }, [sessions, searchTerm]);

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
              <ChatHistoryRows
                isLoading={isLoading}
                sessions={filteredChatSessions}
                searchTerm={searchTerm}
                onSelectSession={onSelectSession}
              />
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Button
        fullWidth
        variant="contained"
        startIcon={<AddCircleIcon />}
        sx={{ mt: 2, flexShrink: 0 }}
        onClick={onNewChat}
      >
        New Chat
      </Button>
    </Stack>
  );
};

const CHAT_HISTORY_SKELETON_ROW_COUNT = 3;

type ChatHistoryRowsProps = {
  isLoading: boolean;
  sessions: ChatSession[];
  searchTerm: string;
  onSelectSession: (chatZUID: string) => void;
};

const ChatHistoryRows = ({
  isLoading,
  sessions,
  searchTerm,
  onSelectSession,
}: ChatHistoryRowsProps) => {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: CHAT_HISTORY_SKELETON_ROW_COUNT }).map(
          (_, index) => (
            <TableRow key={index}>
              <TableCell
                sx={{
                  borderBottom:
                    index === CHAT_HISTORY_SKELETON_ROW_COUNT - 1 ? 0 : 1,
                  borderColor: "border",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.25,
                }}
              >
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="30%" />
              </TableCell>
            </TableRow>
          )
        )}
      </>
    );
  }

  if (!sessions.length) {
    return (
      <TableRow>
        <TableCell>
          <Typography variant="body2">
            {searchTerm
              ? `No chat history available for "${searchTerm}".`
              : "No chat history available."}
          </Typography>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {sessions.map((session, index) => {
        const title = session.title || "Untitled Chat";
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
            onClick={() => onSelectSession(session.chatZuid)}
            sx={{ cursor: "pointer" }}
          >
            <TableCell
              sx={{
                borderBottom: index === sessions.length - 1 ? 0 : 1,
                borderColor: "border",
                display: "flex",
                flexDirection: "column",
                gap: 0.25,
                overflow: "hidden",
              }}
            >
              <Tooltip
                title={title}
                disableInteractive
                enterDelay={500}
                enterNextDelay={500}
              >
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    minWidth: 0,
                  }}
                >
                  {title}
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
    </>
  );
};
