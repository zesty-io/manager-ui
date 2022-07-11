// import { instanceApi } from "../../../../../../shell/services/instance"
import { useState } from "react";
import {
  Typography,
  Box,
  Tabs,
  Tab,
  TabPanel,
  Link,
  Breadcrumbs,
} from "@mui/material";
import { useLocation, useHistory } from "react-router-dom";
import { instanceApi } from "../../../../../../../shell/services/instance";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export const ResourceDetails = () => {
  const location = useLocation();
  const history = useHistory();
  const { data, isLoading } = instanceApi.useGetAuditsQuery();

  const zuid = location.pathname.split("/").pop();

  const selectedData = data?.find((resource) => resource.ZUID === zuid) || {};

  if (isLoading) return <div>loading...</div>;
  return (
    <>
      <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
        <Link
          underline="none"
          variant="caption"
          color="text.secondary"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            history.push("/reports/activity-log");
          }}
        >
          Activity Log
        </Link>
        <Link
          underline="none"
          variant="caption"
          color="text.secondary"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            history.push("/reports/activity-log/resources");
          }}
        >
          Resources
        </Link>
      </Breadcrumbs>
      {/* <Typography variant='h5' color='text.primary'>{selectedData}</Typography> */}
      <div>{JSON.stringify(selectedData)}</div>
    </>
  );
};
