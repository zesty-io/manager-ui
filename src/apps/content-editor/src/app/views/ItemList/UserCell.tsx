import React from "react";
import { Stack, Avatar, Typography } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid-pro";

import { useGetUsersQuery } from "../../../../../../shell/services/accounts";
import { MD5 } from "../../../../../../utility/md5";

type UserCellProps = { params: GridRenderCellParams };
export const UserCell = ({ params }: UserCellProps) => {
  const { data: users } = useGetUsersQuery();

  const user = users.find(
    (user) => user.ZUID === params?.row?.meta?.createdByUserZUID
  );

  if (!user) {
    return <></>;
  }

  return (
    <Stack direction="row" gap={1.5} alignItems="center">
      <Avatar
        alt={`${user.firstName} ${user.lastName}`}
        src={`https://www.gravatar.com/avatar/${MD5(user.email || "")}?s=32`}
        sx={{ width: 32, height: 32 }}
      />
      <Typography variant="body2">
        {user.firstName} {user.lastName}
      </Typography>
    </Stack>
  );
};
