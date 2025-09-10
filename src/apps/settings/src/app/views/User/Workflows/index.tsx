import { Box } from "@mui/material";
import RestrictedPage from "./RestrictedPage";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../../shell/store/types";
import { AuthorizedUserPage } from "./authorized";
import FormDialogContextProvider from "./authorized/forms-dialogs";
import { AUTHORIZED_ROLES } from "./constants";

type UserType = {
  systemRoleZUID: string;
  staff: boolean;
};

const Workflows = () => {
  const { systemRoleZUID, staff }: UserType = useSelector(
    (state: AppState) => ({
      systemRoleZUID: state?.userRole?.systemRoleZUID,
      staff: state.user?.staff,
    })
  );

  const isAuthorized = AUTHORIZED_ROLES.includes(systemRoleZUID) || staff;

  return (
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
  );
};

export default Workflows;
