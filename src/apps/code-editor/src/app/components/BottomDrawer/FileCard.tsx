import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import { ListItem } from "@mui/material";
import { ReactNode, ElementType } from "react";
import { useTranslation } from "react-i18next";

type FileCardProps = {
  title: string;
  icon: ElementType;
  link?: string;
  linkLabel?: string;
  children?: ReactNode;
};

const FileCard: React.FC<FileCardProps> = ({
  title,
  icon: Icon,
  link = "",
  linkLabel = "",
  children,
}) => {
  const { t } = useTranslation();
  return (
    <Card
      sx={{
        boxSizing: "border-box",
        // Temporary: will be updated once the design is final
        bgcolor: "#0D1116",
        color: "grey.400",
        width: "100%",
        px: 2,
        pt: 2,
        pb: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch",
        "& .MuiCardContent-root": {
          "& a": {
            width: "fit-content",
          },
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
        overflow="hidden"
      >
        <Box
          component={Icon}
          sx={{ position: "absolute", top: 0, left: 0, color: "grey.400" }}
        />
        <Typography
          variant="h6"
          color="grey.300"
          width="100%"
          sx={{
            pl: "35px",
            boxSizing: "border-box",
            wordWrap: "break-word",
          }}
        >
          {title}
        </Typography>
      </Box>

      <CardContent sx={{ flexGrow: 1, py: 2, px: 0.25 }}>
        {children}
      </CardContent>
      <CardActions sx={{ pt: 1, flexGrow: 0 }}>
        {!!link && (
          <Link
            to={link}
            title={t("code.editRelatedModel")}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              columnGap: "5px",
              fontSize: "14px",
            }}
          >
            <LinkRoundedIcon fontSize="small" />
            {linkLabel}
          </Link>
        )}
      </CardActions>
    </Card>
  );
};

type FileCardListItemProps = {
  children: ReactNode;
  gap?: string | number;
};

const FileCardListItem: React.FC<FileCardListItemProps> = ({
  gap = "4px",
  children,
}) => {
  return (
    <ListItem
      disablePadding
      sx={{
        display: "flex",
        alignItems: "baseline",
        overflow: "hidden",
        maxWidth: "100%",
      }}
    >
      <ListItemIcon sx={{ minWidth: "16px", color: "grey.400" }}>
        <FiberManualRecordRoundedIcon sx={{ fontSize: 10 }} />
      </ListItemIcon>
      <ListItemText
        primary={children}
        sx={(theme) => ({
          ...theme.typography.body2,
          color: "grey.400",
          my: gap,
          wordBreak: "break-all",
        })}
      />
    </ListItem>
  );
};

export { FileCard, FileCardListItem };
