import {
  Box,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import AddFieldsImage from "../../../../../../public/images/addFieldsImage.png";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

interface Props {
  onAddField: () => void;
}

export const FieldEmptyState = ({ onAddField }: Props) => {
  return (
    <Box
      data-cy="FieldEmptyState"
      width="100%"
      height="100%"
      display="flex"
      flexDirection="row"
      alignItems="center"
      gap={7}
      justifyContent="space-between"
      pl={4}
    >
      <Box>
        <Typography variant="h4" fontWeight={600}>
          Add Fields
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Define the different fields that need to be a <br />
          part of this model.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => onAddField()}
          sx={{
            mt: 2,
          }}
          size="small"
        >
          Add Field
        </Button>
        <Box mt={3}>
          {/* @ts-ignore */}
          <Typography variant="body3">Need help?</Typography>
          <List sx={{ listStyleType: "disc", ml: 2, pt: 0 }}>
            <ListItem
              sx={{ display: "list-item", p: 0, cursor: "pointer" }}
              onClick={() =>
                window.open(
                  "https://zesty.org/services/manager-ui/schema#content-fields-types",
                  "_blank"
                )
              }
            >
              <ListItemText
                primaryTypographyProps={{
                  variant: "body3",
                  color: "info.dark",
                }}
              >
                Read our guide on Field Types in Schema
              </ListItemText>
            </ListItem>
            <ListItem sx={{ display: "list-item", p: 0, cursor: "pointer" }}>
              <ListItemText
                primaryTypographyProps={{
                  variant: "body3",
                  color: "info.dark",
                }}
                onClick={() =>
                  window.open(
                    "https://zesty.org/quick-start-guide/creating-a-content-model",
                    "_blank"
                  )
                }
              >
                Learn Best Practices for creating models
              </ListItemText>
            </ListItem>
          </List>
        </Box>
      </Box>
      <Box
        component="img"
        src={AddFieldsImage}
        sx={{
          width: "277px",
          height: "192.25px",
        }}
      />
    </Box>
  );
};
