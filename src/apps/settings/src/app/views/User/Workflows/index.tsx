import { useEffect, useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import { theme } from "@zesty-io/material";
import * as WorkflowStatus from "./types";
import RestrictedPage from "./RestrictedPage";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../../shell/store/types";
import { AuthorizedUserPage } from "./authorized";
import FormDialogContextProvider from "./authorized/forms-dialogs";

type UserType = {
  role: string;
  staff: boolean;
};

const Workflows = () => {
  const { role, staff }: UserType = useSelector((state: AppState) => ({
    role: state.userRole?.name,
    staff: state.user?.staff,
  }));

  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    setIsAuthorized(WorkflowStatus.AUTHORIZED_ROLES.includes(role) || staff);
  }, [role, staff]);

  return (
    <ThemeProvider theme={theme}>
      <FormDialogContextProvider>
        <Box
          width="100%"
          height="100%"
          bgcolor="grey.50"
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="stretch"
        >
          {isAuthorized ? <AuthorizedUserPage /> : <RestrictedPage />}
        </Box>
      </FormDialogContextProvider>
    </ThemeProvider>
  );
};

export default Workflows;
