import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { NavLink } from "react-router-dom";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { ListItem } from "@mui/material";

const FileCard = ({ title, icon, link = "", linkLabel = "", children }) => {
  return (
    <Card
      sx={{
        boxSizing: "border-box",
        bgcolor: "grey.800",
        color: "text.secondary",
        width: "100%",
        minHeight: "100%",
        px: 2,
        pt: 3,
        pb: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch",
        "& span.brackets, & span.fields, & span.keywords, & a": (theme) => ({
          ...theme.typography.body2,
        }),
        "& span.brackets": {
          color: "#95c65c",
        },
        "& span.keywords": {
          color: "#91ace8",
        },
        "& span.fields": {
          color: "blue.50",
        },
        "& a": {
          color: "info.main",
          textDecoration: "none",
          "&:hover": {
            opacity: 0.8,
          },
        },
        "& ul": {
          p: 0,
        },
      }}
    >
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-start"
        gap={2}
        position="relative"
        flexGrow={0}
        width="100%"
        boxSizing="border-box"
      >
        <Box
          component={icon}
          sx={{ position: "absolute", top: 0, left: 0, color: "grey.400" }}
        />
        <Typography
          variant="h6"
          color="text.primary"
          sx={{ pl: "35px", wordBreak: "break-all", boxSizing: "border-box" }}
        >
          {title}
        </Typography>
      </Box>

      <CardContent sx={{ flexGrow: 1, py: 2, px: 0.25 }}>
        {children}
      </CardContent>
      <CardActions sx={{ pt: 1, flexGrow: 0 }}>
        {!!link && (
          <NavLink
            to={link}
            title="Edit Related Model"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 2,
            }}
          >
            <OpenInNewIcon fontSize="small" />
            {linkLabel}
          </NavLink>
        )}
      </CardActions>
    </Card>
  );
};

const FileCardListItem = ({ children }) => {
  return (
    <ListItem
      disablePadding
      sx={{
        alignItems: "baseline",
        overflow: "hidden",
        maxWidth: "100%",
        wordBreak: "break-all",
      }}
    >
      <ListItemIcon sx={{ p: 0, minWidth: "18px" }}>
        <FiberManualRecordRoundedIcon sx={{ fontSize: 10 }} />
      </ListItemIcon>
      <ListItemText
        primary={children}
        sx={(theme) => ({ ...theme.typography.body2 })}
      />
    </ListItem>
  );
};

export { FileCard, FileCardListItem };
