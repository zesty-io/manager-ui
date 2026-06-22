import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Link,
  ListItemText,
  List,
  ListItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BannerImage from "../../../../../../public/images/all-models-empty-state-image.png";
import { useTranslation } from "react-i18next";

export const AllModelsEmptyState = () => {
  const { t } = useTranslation();
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      gap={7}
    >
      <Box>
        <Typography variant="h4" fontWeight={600}>
          {t("schema.emptyStateHeading")}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {t("schema.emptyStateBody")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            mt: 2,
          }}
        >
          {t("schema.createModel")}
        </Button>
        <Box mt={3}>
          <Typography variant="body3">{t("schema.needHelp")}</Typography>
          <List sx={{ listStyleType: "disc", ml: 2, pt: 0 }}>
            <ListItem sx={{ display: "list-item", p: 0 }}>
              <ListItemText
                primaryTypographyProps={{
                  variant: "body3",
                  color: "info.dark",
                }}
              >
                {t("schema.emptyStateLinkBuildingModels")}
              </ListItemText>
            </ListItem>
            <ListItem sx={{ display: "list-item", p: 0 }}>
              <ListItemText
                primaryTypographyProps={{
                  variant: "body3",
                  color: "info.dark",
                }}
              >
                {t("schema.emptyStateLinkBestPractices")}
              </ListItemText>
            </ListItem>
          </List>
        </Box>
      </Box>
      <Box
        component="img"
        src={BannerImage}
        sx={{
          width: "522px",
          height: "219px",
        }}
      />
    </Box>
  );
};
