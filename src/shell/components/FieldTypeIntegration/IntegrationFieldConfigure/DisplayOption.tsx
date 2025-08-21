import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";

import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { DisplayOptionCardProps } from "../configs";
import DisplayCard from "../components/DisplayCard";
import { alpha, Avatar, Grid, Paper, Stack } from "@mui/material";

const DisplayOption = ({
  title,
  description,
  type,
  card,
  disabled = false,
  isSelected = false,
  onSelect,
}: Partial<DisplayOptionCardProps>) => {
  return (
    <Card
      elevation={0}
      variant="outlined"
      data-cy={`integrationDisplayOption-${type}`}
      sx={{
        borderColor: "border",
        height: "140px",
        borderRadius: 1,
      }}
    >
      <CardActionArea
        disabled={disabled}
        onClick={onSelect}
        data-selected={isSelected ? "" : undefined}
        sx={(theme) => ({
          height: "100%",
          "&[data-selected]": {
            outline: "1px solid",
            outlineColor: "primary.main",
            outlineOffset: "-1px",
            pointerEvents: "none",
            "& .left-grid": {
              outline: "1px solid",
              outlineColor: "primary.main",
              outlineOffset: "-1px",
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          },
          "&:disabled": {
            opacity: 0.5,
          },
        })}
      >
        <CardContent sx={{ height: "100%", p: 0 }}>
          <Grid container spacing={0} sx={{ height: "100%" }}>
            <Grid width="240px" className="left-grid">
              <Stack
                height="100%"
                direction="column"
                spacing={0.5}
                p={2}
                sx={{
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                {["shopify", "youtube", "mux", "classy"]?.includes(type) && (
                  <Avatar
                    src={`/images/${type}Icon.svg`}
                    variant="square"
                    sizes="small"
                  />
                )}
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  {title}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={400}
                  color="text.secondary"
                >
                  {description}
                </Typography>
              </Stack>
            </Grid>
            <Grid
              size="grow"
              container
              sx={{
                justifyContent: "center",
                alignItems: "center",
                px: 10,
                bgcolor: "grey.100",
              }}
            >
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderColor: "border",
                  borderRadius: 2,
                }}
              >
                <DragIndicatorRoundedIcon
                  color="action"
                  fontSize="small"
                  sx={{ m: 0.5 }}
                />
                <DisplayCard
                  type={type}
                  heading={card?.heading}
                  subHeading={card?.subHeading}
                  detail={card?.detail}
                  thumbnail={card?.thumbnail}
                  details={card?.details}
                />
                <MoreHorizIcon color="action" sx={{ m: 1.5 }} />
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DisplayOption;
