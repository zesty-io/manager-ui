import { FC } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { useGetUsersRolesQuery } from "../../../../../../../shell/services/accounts";
import restrictedImage from "../../../../../../../../public/images/restricted-image.svg";
import { AUTHORIZED_ROLES } from "./constants";

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
    data-cy="user-profile"
    display="flex"
    alignItems="center"
    py={1}
    borderBottom="1px solid"
    borderColor={(theme) => theme.palette.border}
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

const RestrictedPage = () => {
  const { isLoading, isError, data } = useGetUsersRolesQuery();

  const profileList = data
    ?.filter((profile) =>
      AUTHORIZED_ROLES.includes(profile?.role?.systemRoleZUID)
    )
    .map((item, index) => ({
      id: item?.ZUID,
      name: `${item?.firstName} ${item?.lastName}`,
      role: item?.role?.name,
      email: item?.email,
      imageUrl: "",
      sort:
        (item?.role?.name &&
          ROLE_ORDER_MAPPING[
            item?.role?.name as keyof typeof ROLE_ORDER_MAPPING
          ]) ||
        index + 2,
    }))
    .sort((a, b) => a.sort - b.sort);

  return (
    <Box
      width="100%"
      height="100%"
      bgcolor="grey.50"
      display="flex"
      flexDirection="column"
      data-cy="workflows-restricted-page"
    >
      <Box
        px={4}
        pt={4}
        pb={1.5}
        bgcolor="background.paper"
        borderBottom="2px solid"
        borderColor="border"
        display="flex"
        justifyContent="space-between"
        alignItems="baseline"
      >
        <Typography variant="h3" fontWeight={700} color="text.primary">
          Workflows
        </Typography>
      </Box>

      <Box
        px={4}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        flexGrow={1}
      >
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          width="100%"
          columnGap={2}
        >
          <Box
            display="flex"
            flexDirection="column"
            width="60%"
            py={4}
            minWidth="350px"
            flexShrink={0}
            maxWidth="sm"
          >
            <Typography
              variant="h3"
              fontWeight={700}
              color="text.primary"
              mb={2}
            >
              You need permission to view and edit workflows
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              Contact the instance owner or administrators listed below to
              upgrade your role to Admin or Owner.
            </Typography>

            <Box
              data-cy="user-profile-container"
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="stretch"
              width="100%"
              maxHeight="400px"
              sx={{
                overflowY: "auto",
              }}
            >
              {!isLoading &&
                !isError &&
                profileList.length > 0 &&
                profileList.map((profile) => (
                  <ProfileInfo
                    key={profile.id}
                    name={profile.name}
                    email={profile.email}
                    role={profile.role}
                    imageUrl={profile.imageUrl}
                  />
                ))}
            </Box>
          </Box>
          <Box
            boxSizing="border-box"
            width="320px"
            height="100%"
            display="flex"
            flexDirection="row"
            justifyContent="flex-end"
          >
            <img
              data-cy="restricted-image"
              src={restrictedImage}
              loading="lazy"
              style={{ width: "100%" }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RestrictedPage;
