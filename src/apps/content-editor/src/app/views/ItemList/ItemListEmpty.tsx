import { Box, Button, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import emptyItemsList from "../../../../../../../public/images/emptyItemsList.png";
import { useHistory, useParams } from "react-router";

export const ItemListEmpty = () => {
  const history = useHistory();
  const { modelZUID } = useParams<{ modelZUID: string }>();
  return (
    <Box
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent={"space-between"}
      gap={8}
    >
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Start Creating Content Now
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1} mb={2}>
          Add your content here. Start by creating your first item.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          size="small"
          onClick={() => {
            history.push(`/content/${modelZUID}/new`);
          }}
        >
          Create
        </Button>
      </Box>
      <Box component="img" src={emptyItemsList} />
    </Box>
  );
};
