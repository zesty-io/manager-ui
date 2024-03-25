import { useMemo } from "react";
import { Stack, Typography, Avatar, IconButton, Box } from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import moment from "moment";

import { useGetUsersQuery } from "../../services/accounts";
import { MD5 } from "../../../utility/md5";

type CommentItemProps = {
  body: string;
  creator: string;
  createdOn: string;
  withResolveButton?: boolean;
  onResolveComment: () => void;
};
export const CommentItem = ({
  body,
  creator,
  createdOn,
  withResolveButton,
  onResolveComment,
}: CommentItemProps) => {
  const { data: users } = useGetUsersQuery();

  const user = useMemo(
    () => users?.find((user) => user.ZUID === creator),
    [users]
  );

  return (
    <Stack gap={1.5}>
      <Stack gap={1.5} direction="row">
        <Stack flex={1} direction="row" gap={1.5} alignItems="center">
          <Avatar
            sx={{ width: 32, height: 32 }}
            src={`https://www.gravatar.com/avatar/${MD5(
              user?.email || ""
            )}?s=32`}
          />
          <Stack>
            <Typography fontWeight={700} variant="body2">
              {`${user?.firstName} ${user?.lastName}`}
            </Typography>
            <Typography variant="body3" fontWeight={600} color="text.secondary">
              {moment(createdOn).fromNow()}
            </Typography>
          </Stack>
        </Stack>
        <Box>
          {withResolveButton && (
            <IconButton size="small" onClick={onResolveComment}>
              <CheckRoundedIcon fontSize="small" color="primary" />
            </IconButton>
          )}
          <IconButton size="small">
            <MoreVertRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Stack>
      <Typography variant="body2">{body}</Typography>
    </Stack>
  );
};
