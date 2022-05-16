import { useDispatch, useSelector } from "react-redux";

import { actions } from "shell/store/ui";

import Button from "@mui/material/Button";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

export function ContentNavToggle() {
  const ui = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  return (
    <Button
      variant="contained"
      title={ui.contentNav ? "Close Content Nav" : "Open Content Nav"}
      data-cy="contentNavButton"
      onClick={() => {
        dispatch(actions.setContentNav(!ui.contentNav));
      }}
      fullWidth
      sx={{
        position: "sticky",
        bottom: "0",
        borderRadius: "0",
        padding: "13px 6px",
        boxShadow: " 2px 2px 5px fade(primary, 50%)",
        "&:hover": {
          color: "warning.main",
        },
      }}
    >
      {ui.contentNav || ui.contentNavHover ? (
        <ChevronLeftIcon />
      ) : (
        <ChevronRightIcon />
      )}
    </Button>
  );
}
