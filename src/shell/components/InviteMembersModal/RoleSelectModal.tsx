import {
  Box,
  Dialog,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import { RoleAccessInfo } from "./RoleAccessInfo";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import RecommendRoundedIcon from "@mui/icons-material/RecommendRounded";

import { useGetCurrentUserRolesQuery } from "../../services/accounts";

const roles = [
  {
    name: "Owner",
  },
  {
    name: "Admin",
  },
  {
    name: "Developer",
  },
  {
    name: "SEO",
  },
  {
    name: "Publisher",
  },
  {
    name: "Contributor",
  },
];

const iconStyles = {
  padding: 1,
  borderRadius: "20px",
  display: "block",
};

const roleIcons = [
  <AdminPanelSettingsRoundedIcon
    color="primary"
    sx={{
      ...iconStyles,
      backgroundColor: "deepOrange.100",
    }}
  />,
  <AdminPanelSettingsRoundedIcon
    sx={{
      ...iconStyles,
      backgroundColor: "success.light",
      color: "success.dark",
    }}
  />,
  <CodeRoundedIcon
    sx={{
      ...iconStyles,
      backgroundColor: "blue.100",
      color: "blue.500",
    }}
  />,
  <RecommendRoundedIcon
    sx={{
      ...iconStyles,
      backgroundColor: "purple.100",
      color: "purple.600",
    }}
  />,
  <AdminPanelSettingsRoundedIcon
    sx={{
      ...iconStyles,
      backgroundColor: "pink.100",
      color: "pink.600",
    }}
  />,
  <EditRoundedIcon
    color="warning"
    sx={{
      ...iconStyles,
      backgroundColor: "#FFFCF5",
    }}
  />,
];

interface Props {
  role: number;
  onSelect: (role: number) => void;
  onClose: () => void;
}

export const RoleSelectModal = ({ role, onSelect, onClose }: Props) => {
  const { data: currentUserRoles } = useGetCurrentUserRolesQuery();
  const [hoveredRoleIndex, setHoveredRoleIndex] = useState(role);

  const isOwner = useMemo(() => {
    if (currentUserRoles?.length) {
      return currentUserRoles.some((role) =>
        ["owner"].includes(role.name?.toLowerCase())
      );
    }
  }, [currentUserRoles]);

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth={"xs"}>
      <Box display="flex" sx={{ height: "400px" }}>
        <Box sx={{ mt: 1 }}>
          {roles.map((roleItem, index) => {
            if (roleItem.name === "Owner" && !isOwner) {
              return <></>;
            }

            return (
              <ListItemButton
                onMouseLeave={() => setHoveredRoleIndex(role)}
                onMouseEnter={() => setHoveredRoleIndex(index)}
                onClick={() => onSelect(index)}
                sx={{
                  width: "171px",
                  ...(role === index && {
                    backgroundColor: (theme) =>
                      alpha(
                        theme.palette.primary.main,
                        theme.palette.action.hoverOpacity
                      ),
                  }),
                }}
              >
                <ListItemText
                  primary={roleItem.name}
                  primaryTypographyProps={{
                    variant: "body1",
                  }}
                />
                <ListItemIcon
                  sx={{
                    visibility: role !== index && "hidden",
                    justifyContent: "flex-end",
                  }}
                >
                  <CheckIcon color="primary" />
                </ListItemIcon>
              </ListItemButton>
            );
          })}
        </Box>
        <Box sx={{ mt: 2, px: 2 }}>
          <Box display="flex" gap={1.5} alignItems="center">
            {roleIcons[hoveredRoleIndex]}
            <Typography variant="h5">
              {roles?.[hoveredRoleIndex]?.name}
            </Typography>
          </Box>
          <RoleAccessInfo role={hoveredRoleIndex} />
        </Box>
      </Box>
    </Dialog>
  );
};
