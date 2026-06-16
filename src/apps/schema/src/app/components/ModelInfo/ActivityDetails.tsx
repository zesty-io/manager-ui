import { Box, Typography, Button, Avatar } from "@mui/material";
import { useGetContentModelsQuery } from "../../../../../../shell/services/instance";
import { useHistory, useParams } from "react-router";
import { formatLocalized } from "shell/i18n/dates";
import { isValid } from "date-fns";
import { useGetUsersQuery } from "../../../../../../shell/services/accounts";
import { useState } from "react";
import { MD5 } from "../../../../../../utility/md5";

type Params = {
  id: string;
};

export const ActivityDetails = () => {
  const params = useParams<Params>();
  const { id } = params;
  const history = useHistory();
  const { data: models } = useGetContentModelsQuery();
  const model = models?.find((model) => model.ZUID === id);
  const { data: users } = useGetUsersQuery();
  const createdByUser = users?.find(
    (user) => user.ZUID === model?.createdByUserZUID
  );
  const updatedByUser = users?.find(
    (user) => user.ZUID === model?.updatedByUserZUID
  );

  const [isCopied, setIsCopied] = useState("");

  const createdDate = model?.createdAt ? new Date(model.createdAt) : null;
  const updatedDate = model?.updatedAt ? new Date(model.updatedAt) : null;

  const createdOn =
    createdDate && isValid(createdDate)
      ? formatLocalized(createdDate, "do MMMM, yyyy 'at' h:mm a")
      : "";

  const updatedOn =
    updatedDate && isValid(updatedDate)
      ? formatLocalized(updatedDate, "do MMMM, yyyy 'at' h:mm a")
      : "";

  const handleCopy = (data: string) => {
    navigator?.clipboard
      ?.writeText(data)
      .then(() => {
        setIsCopied(data);
        setTimeout(() => {
          setIsCopied("");
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600}>
        Activity Details
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        Learn when the model was created, updated, and by whom
      </Typography>
      <Box
        borderRadius="8px"
        border="1px solid"
        borderColor="border"
        sx={{ backgroundColor: "background.paper" }}
      >
        <Box
          display="flex"
          alignItems="center"
          p={2}
          sx={{
            borderBottom: (theme) => `1px solid ${theme.palette.border}`,
          }}
        >
          <Box minWidth={280}>
            <Typography color="text.primary">Created On</Typography>
          </Box>
          <Box flex={1}>
            <Typography>{createdOn}</Typography>
          </Box>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          px={2}
          py={1.5}
          sx={{
            borderBottom: (theme) => `1px solid ${theme.palette.border}`,
          }}
        >
          <Box minWidth={280}>
            <Typography color="text.primary">Created By</Typography>
          </Box>
          <Box flex={1} display="flex" gap={1.5} alignItems="center">
            <Avatar
              sx={{ width: 32, height: 32 }}
              src={`https://www.gravatar.com/avatar/${MD5(
                createdByUser?.email || ""
              )}?d=mm&s=32`}
            />
            <Typography>
              {createdByUser?.firstName} {createdByUser?.lastName}
            </Typography>
          </Box>
          <Box>
            <Button
              onClick={() => handleCopy(createdByUser?.email)}
              size="small"
            >
              {isCopied ? "Copied!" : "Copy Email"}
            </Button>
          </Box>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          p={2}
          sx={{
            borderBottom: (theme) => `1px solid ${theme.palette.border}`,
          }}
        >
          <Box minWidth={280}>
            <Typography color="text.primary">Last Updated On</Typography>
          </Box>
          <Box flex={1}>
            <Typography>{updatedOn}</Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" px={2} py={1.5}>
          <Box minWidth={280}>
            <Typography color="text.primary">Last Updated By</Typography>
          </Box>
          <Box flex={1} display="flex" gap={1.5} alignItems="center">
            <Avatar
              sx={{ width: 32, height: 32 }}
              src={`https://www.gravatar.com/avatar/${MD5(
                updatedByUser?.email || ""
              )}?d=mm&s=32`}
            />
            <Typography>
              {updatedByUser?.firstName} {updatedByUser?.lastName}
            </Typography>
          </Box>
          <Box>
            <Button
              onClick={() => handleCopy(updatedByUser?.email)}
              size="small"
            >
              {isCopied ? "Copied!" : "Copy Email"}
            </Button>
          </Box>
        </Box>
      </Box>
      <Button
        sx={{ mt: 2 }}
        size="large"
        variant="outlined"
        onClick={() => history.push(`/reports/activity-log/resources/${id}`)}
      >
        View All Activity
      </Button>
    </Box>
  );
};
