import { FC } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useHistory } from "react-router";
import { useSelector } from "react-redux";
import { useGetUsersRolesQuery } from "../services/accounts";
import { AppState } from "../store/types";

const AUTHORIZED_ROLE_ZUID: string[] = ["31-71cfc74-4dm13", "31-71cfc74-0wn3r"];
const ROLE_ORDER_MAPPING = { Owner: 1, Admin: 2 };

type ProfileInfoProps = {
  name: string;
  role: string;
  email: string;
  imageUrl?: string;
};

const ProfileInfo: FC<ProfileInfoProps> = ({
  name,
  role,
  email,
  imageUrl = "",
}) => (
  <Box
    display="flex"
    alignItems="center"
    py={1}
    borderBottom="1px solid"
    borderColor="border"
  >
    <Avatar alt={name} src={imageUrl} />
    <Box ml={2}>
      <Typography variant="body2" color="text.primary" fontWeight={600}>
        {name}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
      >{`${role} • ${email}`}</Typography>
    </Box>
  </Box>
);

const AccessDenied = () => {
  const history = useHistory();
  const userRole = useSelector((state: AppState) => state.userRole);
  const { valid } = useSelector((state: AppState) => state.auth);
  const appRoute = location.pathname.split("/")[1];
  const { isLoading, data } = useGetUsersRolesQuery(null, { skip: !valid });

  const profileList = data
    ?.filter((profile: any) =>
      AUTHORIZED_ROLE_ZUID.includes(profile?.role?.systemRole?.ZUID)
    )
    .map((item: any, index: number) => {
      const imagePathPart = !item?.emailHash ? "" : `/${item?.emailHash}?s=40`;
      const imagePath = `https://www.gravatar.com/avatar${imagePathPart}`;
      return {
        id: item?.ZUID,
        name: `${item?.firstName} ${item?.lastName}`,
        role: item?.role?.name,
        email: item?.email,
        imageUrl: imagePath,
        sort:
          (item?.role?.name &&
            ROLE_ORDER_MAPPING[
              item?.role?.name as keyof typeof ROLE_ORDER_MAPPING
            ]) ||
          index + 2,
      };
    })
    .sort((a: any, b: any) => a.sort - b.sort);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "stretch",
        p: 15,
        bgcolor: "grey.50",
      }}
    >
      {isLoading ? (
        <Box
          width="100%"
          height="100%"
          sx={{
            display: "grid",
            placeContent: "center",
          }}
        >
          <CircularProgress size={32} />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            columnGap: 8,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "space-between",
              width: "540px",
              rowGap: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                width: "100%",
                rowGap: 2,
              }}
            >
              <Typography variant="h3" color="text.primary" fontWeight={700}>
                Access Denied
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your current role of {userRole?.name} does not include access to
                the
                {` ${appRoute.charAt(0).toUpperCase()}${appRoute
                  .slice(1)
                  .toLowerCase()} `}
                App. To gain access, please contact the instance owner or one of
                the administrators listed below and request a role upgrade to
                gain access.
              </Typography>
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="stretch"
              width="100%"
              maxHeight="172px"
              sx={{
                overflowY: "auto",
              }}
            >
              {profileList.length > 0 &&
                profileList.map((profile: any) => (
                  <ProfileInfo
                    key={profile.id}
                    name={profile.name}
                    email={profile.email}
                    role={profile.role}
                    imageUrl={profile.imageUrl}
                  />
                ))}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
              }}
            >
              <Button
                startIcon={<ArrowBackIcon />}
                variant="outlined"
                color="primary"
                onClick={() => history.goBack()}
              >
                Go Back
              </Button>
            </Box>
          </Box>
          <Card
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "320px",
              bgcolor: "transparent",
            }}
          >
            <CardMedia
              component="img"
              height="100%"
              width="100%"
              image="/images/restricted.png"
              alt="Page Not Found"
            />
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default AccessDenied;
