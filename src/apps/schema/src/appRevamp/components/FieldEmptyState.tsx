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
      width="100%"
      height="100%"
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      px={3}
    >
      <Box
        sx={{
          width: "378px",
        }}
      >
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
        >
          Add Field
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
                Read our guide on Field Types in Schema
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
        src={AddFieldsImage}
        sx={{
          width: "277px",
          height: "192.25px",
        }}
      />
    </Box>
  );
};
