import { FC } from "react";
import { Box, Typography, Avatar } from "@mui/material";

// import restrictedImage from "../../../../../../../../public/images/restricted-image.svg";

type ProfileInfoProps = {
  name: string;
  role: string;
  email: string;
  imageUrl: string;
};

const ProfileInfo: FC<ProfileInfoProps> = ({
  name,
  role,
  email,
  imageUrl,
}: ProfileInfoProps) => (
  <Box
    display="flex"
    flexDirection="row"
    justifyContent="flex-start"
    alignItems="center"
    py={1}
    columnGap={2}
  >
    <Avatar alt={name} src={imageUrl} />
    <Box>
      <Typography variant="body2" color="text.primary">
        {name}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
      >{`${role} • ${email}`}</Typography>
    </Box>
  </Box>
);

const UserProfileList = [
  {
    name: "Randy Apuzzo",
    role: "Owner",
    email: "randy@zesty.io",
    imageUrl:
      "https://zestyio.media.zestyio.com/randy-apuzzo-headshot.jpg?width=64&height=64",
  },
  {
    name: "Stuart Runyan",
    role: "Administrator",
    email: "stuart@zesty.io",
    imageUrl:
      "https://zestyio.media.zestyio.com/stuart-300x300.jpg?width=64&height=64",
  },
  {
    name: "Todd Sabo",
    role: "Administrator",
    email: "todd@zesty.io",
    imageUrl:
      "https://kfg6bckb.media.zestyio.com/Todd-Sabo.jpg?width=64&height=64",
  },
];

const RestrictedPage = () => {
  return (
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
      <Box
        px={4}
        pt={4}
        pb={1.5}
        bgcolor="background.paper"
        borderBottom="2px solid"
        borderColor="border"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="baseline"
        flexGrow={0}
      >
        <Typography variant="h3" fontWeight={700} color="text.primary">
          Workflows
        </Typography>
      </Box>
      <Box
        px={4}
        py={1.5}
        display="flex"
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        flexGrow={1}
        columnGap={4}
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          rowGap={3}
          minWidth="350px"
        >
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            alignItems="flex-start"
            rowGap={1}
            maxWidth="sm"
          >
            <Typography variant="h3" fontWeight={700} color="text.primary">
              You need permission to view and edit workflows
            </Typography>
            <Typography variant="body2" fontWeight={400} color="text.secondary">
              Contact the instance owner or administrators listed below to
              upgrade your role to Admin or Owner for this capability.
            </Typography>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="flex-start"
            width="100%"
            maxHeight="400px"
            sx={{
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {UserProfileList.map((profile: ProfileInfoProps, index: number) => (
              <ProfileInfo
                key={profile.email}
                name={profile?.name}
                email={profile.email}
                role={profile?.role}
                imageUrl={profile.imageUrl}
              />
            ))}
          </Box>
        </Box>
        <Box>
          <img src="/restricted-image.svg" loading="lazy" />
        </Box>
      </Box>
    </Box>
  );
};
export default RestrictedPage;
