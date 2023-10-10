import { Box, IconButton } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

interface Props {
  indexToInsert: number;
  disabled: boolean;
  onDividerClick: () => void;
}

export const AddFieldDivider = ({
  indexToInsert,
  disabled,
  onDividerClick,
}: Props) => {
  const styles = !disabled
    ? {
        cursor: "pointer",
        "&:hover div": {
          visibility: "visible",
        },
        "&:hover button": {
          visibility: "visible",
        },
      }
    : {};

  return (
    <Box
      data-cy="InBetweenFieldAddFieldBtn"
      display="flex"
      alignItems={"center"}
      sx={styles}
      onClick={onDividerClick}
      height={12}
    >
      <IconButton
        sx={{
          visibility: "hidden",
          // position: "absolute",
          // left: "-20px",
          // top: "-6px",
          p: 0,
          height: "2px",
        }}
        size="small"
        color="primary"
      >
        <AddRoundedIcon fontSize="small" />
      </IconButton>
      <Box
        visibility="hidden"
        width="100%"
        sx={{
          height: "2px",
          backgroundColor: "primary.main",
        }}
      ></Box>
    </Box>
  );
};
