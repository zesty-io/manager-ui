import { useEffect, useState } from "react";
import { ThemeProvider, Box } from "@mui/material";

import { theme } from "@zesty-io/material";

import * as WorkflowStatus from "./constants";
import RestrictedPage from "./Restricted";

import { useSelector } from "react-redux";
import { AppState } from "../../../../../../../shell/store/types";

import { WorkflowProvider } from "./WorkflowsContext";

import AuthorizedPage from "./AuthorizedPage";

const Workflows = (props: any) => {
  // const { data: currentUserRoles } = useGetCurrentUserRolesQuery();
  const userRole: WorkflowStatus.RoleNameTypes = useSelector(
    (state: AppState) => state?.userRole?.name
  );

  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    const roleNames = Object.values(WorkflowStatus.ROLE_NAMES);
    setIsAuthorized(roleNames.includes(userRole));
  }, [userRole]);

  return (
    <ThemeProvider theme={theme}>
      <WorkflowProvider>
        <Box
          width="100%"
          height="100%"
          maxHeight="100%"
          overflow="hidden"
          bgcolor="grey.50"
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="stretch"
        >
          {isAuthorized ? <AuthorizedPage /> : <RestrictedPage />}
        </Box>
      </WorkflowProvider>
    </ThemeProvider>
  );
};
export default Workflows;
