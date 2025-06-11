import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";

type Props = {};

const DisplayTypes = () => {
  const [selectedCard, setSelectedCard] = React.useState(0);
  return (
    <Card>
      <CardActionArea
        onClick={() => setSelectedCard(1)}
        data-active={selectedCard === 1 ? "" : undefined}
        sx={{
          height: "100%",
          "&[data-active]": {
            backgroundColor: "action.selected",
            "&:hover": {
              backgroundColor: "action.selectedHover",
            },
          },
        }}
      >
        <CardContent sx={{ height: "100%" }}>
          <Typography variant="h5" component="div">
            Chugging through Sri Lanka's tea plantations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The beautiful train from Kandy to Ella
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DisplayTypes;
