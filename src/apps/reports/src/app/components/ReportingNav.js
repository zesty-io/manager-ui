import { useHistory, useLocation } from "react-router";
import { theme } from "@zesty-io/material";
import {
  Box,
  ListItem,
  ThemeProvider,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import PieChartIcon from "@mui/icons-material/PieChart";
import InsightsIcon from "@mui/icons-material/Insights";

export function ReportingNav() {
  const location = useLocation();
  const history = useHistory();

  const tree = [
    {
      label: "Activity Log",
      path: "/reports/activity-log",
      icon: <HistoryIcon />,
    },
    {
      label: "Metrics",
      path: "/reports/metrics",
      icon: <PieChartIcon />,
    },
    {
      label: "Analytics",
      path: "/reports/analytics",
      icon: <InsightsIcon />,
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minWidth: 200,
          backgroundColor: "background.paper",
          borderColor: "grey.100",
          borderStyle: "solid",
          borderWidth: 1,
        }}
      >
        <Box sx={{ px: 2, pt: 3, pb: 1, color: "text.primary" }}>
          <Typography variant="h4" fontWeight={600}>
            Reports
          </Typography>
        </Box>
        <List sx={{ p: 1 }} color="primary">
          {tree.map(({ label, path, icon }) => (
            <ListItem
              key={path}
              disablePadding
              selected={location.pathname.includes(path)}
              sx={{
                mb: 1,
                borderRadius: "4px",
                "&.Mui-selected": {
                  " .MuiListItemIcon-root": {
                    color: "primary.main",
                  },
                  color: "primary.dark",
                  pointerEvents: "none",
                },
              }}
            >
              <ListItemButton
                sx={{ px: 1.5, py: 0.75, borderRadius: "4px" }}
                onClick={() => history.push(path)}
              >
                <ListItemIcon sx={{ minWidth: "32px" }}>{icon}</ListItemIcon>
                <ListItemText
                  sx={{ m: 0 }}
                  primaryTypographyProps={{
                    variant: "body3",
                    fontWeight: 600,
                  }}
                  primary={label}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </ThemeProvider>
  );
}
