import { Button, Box, Typography, Tooltip } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import { AddRounded } from "@mui/icons-material";
import {
  useGetAllPublishingsQuery,
  useGetAuditsQuery,
  useGetContentModelQuery,
} from "../../../../../../shell/services/instance";
import moment from "moment-timezone";
import { useHistory } from "react-router";
import { useState } from "react";
import { CreateContentItemDialog } from "../../../../../../shell/components/CreateContentItemDialog";

const AnalyticsDashboard = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box color={theme.palette.text.primary} boxSizing="border-box">
        <AnalyticsDashboardHeader />
      </Box>
    </ThemeProvider>
  );
};

export default AnalyticsDashboard;

const AnalyticsDashboardHeader = () => {
  const { data: publishings } = useGetAllPublishingsQuery();
  const { data: audit } = useGetAuditsQuery({
    start_date: moment().utc().subtract(1, "month").format("YYYY-MM-DD"),
    end_date: moment().utc().format("YYYY-MM-DD"),
  });
  const [showCreateContentItemDialog, setShowCreateContentItemDialog] =
    useState(false);

  const usedModelsCounts = audit
    ?.filter((a: any) => a.resourceType === "content" && a.action === 1)
    ?.map((a: any) => a?.meta?.uri?.split("/")[4])
    .reduce((acc, value) => {
      if (value in acc) {
        acc[value]++;
      } else {
        acc[value] = 1;
      }
      return acc;
    }, {});

  const topUsedModels = Object.entries(usedModelsCounts || {})
    ?.sort((a: any, b: any) => b[1] - a[1])
    ?.slice(0, 4);

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        p={2}
        borderBottom={`1px inset ${theme.palette.border}`}
      >
        <Typography variant="h5" fontWeight="600">
          Dashboard
        </Typography>
        <Box display="flex" gap={1.5}>
          {topUsedModels?.reverse()?.map((model: any) => (
            <CreateItemButton modelZUID={model[0]} />
          ))}
          <Button
            variant="contained"
            size="small"
            startIcon={<AddRounded />}
            onClick={() => setShowCreateContentItemDialog(true)}
          >
            Create
          </Button>
        </Box>
      </Box>
      {showCreateContentItemDialog && (
        <CreateContentItemDialog
          open
          onClose={() => setShowCreateContentItemDialog(false)}
        />
      )}
    </>
  );
};

const CreateItemButton = ({ modelZUID }: { modelZUID: string }) => {
  const { data: model, isError } = useGetContentModelQuery(modelZUID);
  const history = useHistory();

  return (
    <Button
      sx={{ display: isError && "none" }}
      variant="outlined"
      size="small"
      color="inherit"
      startIcon={<AddRounded color="action" />}
      onClick={() => history.push(`/content/${model.ZUID}/new`)}
    >
      <Tooltip title={model?.label} placement="bottom" arrow enterDelay={1000}>
        <Typography sx={{ maxWidth: "74px" }} variant="body2" noWrap>
          {model?.label}
        </Typography>
      </Tooltip>
    </Button>
  );
};
