import { FC, useState } from "react";
import { Button, Box, MenuItem, Menu } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { AppState } from "../../../store/types";
import { useParams } from "../../../hooks/useParams";
import { useSearchContentQuery } from "../../../services/instance";

export const UserFilter: FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const [params, setParams] = useParams();
  const query = params.get("q") || "";
  const { data: results, isLoading } = useSearchContentQuery(
    { query, order: "created", dir: "desc" },
    { skip: !query }
  );

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleChange = (userZuid: string) => {
    setParams(userZuid, "user");
    handleClose();
  };

  const userZuids = results
    .map((result) => result.web.createdByUserZUID)
    .filter((zuid) => zuid);

  const uniqueUserZuids = [...new Set(userZuids)];
  console.log(uniqueUserZuids);

  return (
    <>
      <Button
        endIcon={<ArrowDropDownIcon />}
        onClick={handleClick}
        variant="outlined"
        size="small"
        color="inherit"
        sx={{
          py: "1px",
        }}
      >
        People
      </Button>
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        {uniqueUserZuids.map((userZuid) => (
          <MenuItem onClick={() => handleChange(userZuid)}>{userZuid}</MenuItem>
        ))}
      </Menu>
    </>
  );
};
