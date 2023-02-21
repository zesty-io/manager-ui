import { FC, useState } from "react";
import { Button, Box, MenuItem, Menu } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { AppState } from "../../../store/types";
import { useParams } from "../../../hooks/useParams";
import { useSearchContentQuery } from "../../../services/instance";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/SearchRounded";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import { accountsApi } from "../../../services/accounts";
import { MD5 } from "../../../../utility/md5";

export const UserFilter: FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const [params, setParams] = useParams();
  const [userFilterTerm, setUserFilterTerm] = useState<string>("");
  const query = params.get("q") || "";
  const { data: results, isLoading } = useSearchContentQuery(
    { query, order: "created", dir: "desc" },
    { skip: !query }
  );

  const { data: allUsers } = accountsApi.useGetUsersQuery();

  const handleClose = () => {
    setUserFilterTerm("");
    setAnchorEl(null);
  };
  const handleChange = (userZuid: string) => {
    setParams(userZuid, "user");
    handleClose();
  };

  const userZuids = results
    .map((result) => result.web.createdByUserZUID)
    .filter((zuid) => zuid);

  const uniqueUserZuids = new Set(userZuids);
  const users = allUsers
    ? allUsers.filter((user) => uniqueUserZuids.has(user.ZUID))
    : [];
  console.log(users);
  const filteredUsers = users.filter((user) => {
    const filterTerm = userFilterTerm.toLowerCase().trim();
    if (!filterTerm) {
      return true;
    }
    return (
      user.email.toLowerCase().includes(filterTerm) ||
      user.firstName.toLowerCase().includes(filterTerm) ||
      user.lastName.toLowerCase().includes(filterTerm)
    );
  });

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
        <MenuItem
          onKeyDown={
            (e) =>
              e.stopPropagation() /* prevent selection from jumping to user list */
          }
        >
          <TextField
            type="search"
            variant="outlined"
            fullWidth
            placeholder="Search Users"
            value={userFilterTerm}
            onChange={(e) => setUserFilterTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {" "}
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </MenuItem>
        {filteredUsers.map((user) => (
          <MenuItem onClick={() => handleChange(user.ZUID)}>
            <ListItemAvatar>
              <Avatar
                alt={`${user.firstName} ${user.lastName} Avatar`}
                src={`https://www.gravatar.com/avatar/${MD5(
                  user.email
                )}?d=mm&s=40`}
              />
            </ListItemAvatar>
            {user.firstName} {user.lastName}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
