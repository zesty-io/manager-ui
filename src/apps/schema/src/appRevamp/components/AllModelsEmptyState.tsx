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

export const AllModelsEmptyState = () => {
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
          Let's start by creating models
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Models define the structure of a content item such as a home page or
          an article similar to the examples of models you seen on the right.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            mt: 2,
          }}
        >
          Create Model
        </Button>
        <Box mt={3}>
          {/* @ts-ignore */}
          <Typography variant="body3">Need help?</Typography>
          <List sx={{ listStyleType: "disc", ml: 2, pt: 0 }}>
            <ListItem sx={{ display: "list-item", p: 0 }}>
              <ListItemText
                primaryTypographyProps={{
                  // @ts-ignore
                  variant: "body3",
                  color: "info.dark",
                }}
              >
                Read our guide on building models
              </ListItemText>
            </ListItem>
            <ListItem sx={{ display: "list-item", p: 0 }}>
              <ListItemText
                primaryTypographyProps={{
                  // @ts-ignore
                  variant: "body3",
                  color: "info.dark",
                }}
              >
                Learn Best Practices for creating models
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
