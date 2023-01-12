import {
  Box,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useGetContentModelsQuery } from "../../../../../../shell/services/instance";
import { ModelList } from "./ModelList";
import SchemaRoundedIcon from "@mui/icons-material/SchemaRounded";
import { useHistory } from "react-router";

export const Sidebar = () => {
  const { data: models } = useGetContentModelsQuery();
  const history = useHistory();
  return (
    <Box
      width={240}
      height="100%"
      display="flex"
      flexDirection="column"
      sx={{
        borderRight: (theme) => "1px solid " + theme.palette.border,
      }}
    >
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="h4" fontWeight={600}>
          Schema
        </Typography>
        <ListItemButton
          onClick={() => history.push("/schema")}
          sx={{
            mt: 2,
            borderRadius: "4px",
            "&.Mui-selected .MuiListItemIcon-root ": {
              color: "primary.main",
            },
            "&.Mui-selected .MuiTypography-root": {
              color: "primary.dark",
            },
          }}
          selected={location.pathname === "/schema"}
        >
          <ListItemIcon sx={{ minWidth: "36px" }}>
            <SchemaRoundedIcon />
          </ListItemIcon>
          <ListItemText
            primary="All Models"
            primaryTypographyProps={{
              // @ts-expect-error need body 3 module augmentation
              variant: "body3",
              color: "text.secondary",
            }}
          />
        </ListItemButton>
      </Box>
      <Box
        sx={{
          borderStyle: "solid",
          borderWidth: 0,
          borderTopWidth: 1,
          borderColor: "border",
          px: 2,
          py: 1,
          overflowY: "scroll",
          height: "100%",
        }}
      >
        <ModelList
          title="single page"
          models={models?.filter((model) => model.type === "templateset") || []}
        />
        <Box sx={{ mt: 1 }}>
          <ModelList
            title="multi page"
            models={models?.filter((model) => model.type === "pageset") || []}
          />
        </Box>
        <Box sx={{ mt: 1 }}>
          <ModelList
            title="headless dataset"
            models={models?.filter((model) => model.type === "dataset") || []}
          />
        </Box>
      </Box>
    </Box>
  );
};
