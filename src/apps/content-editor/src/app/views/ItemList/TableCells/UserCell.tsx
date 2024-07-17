import { Stack, Avatar, Typography } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid-pro";
import { MD5 } from "../../../../../../../utility/md5";

type UserCellProps = { params: GridRenderCellParams };
export const UserCell = ({ params }: UserCellProps) => {
  if (!params?.row?.meta?.createdByUserName) <></>;
  return (
    <Stack direction="row" gap={1.5} alignItems="center">
      <Avatar
        alt={params?.row?.meta?.createdByUserName}
        src={`https://www.gravatar.com/avatar/${MD5(
          params?.row?.meta?.createdByUserEmail || ""
        )}?s=32`}
        sx={{ width: 32, height: 32 }}
      />
      <Typography variant="body2">
        {params?.row?.meta?.createdByUserName}
      </Typography>
    </Stack>
  );
};
