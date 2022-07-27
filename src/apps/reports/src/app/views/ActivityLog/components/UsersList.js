import { useMemo } from "react";
import { List } from "@mui/material";
import { useParams } from "shell/hooks/useParams";
import { UserListItem } from "./UserListItem";

export const UsersList = (props) => {
  const [params] = useParams();
  const sortBy = params.get("sortBy");
  const sortOrder = sortBy?.startsWith("+") ? "desc" : "asc";

  const sortedUserActions = useMemo(
    () =>
      props.uniqueUserActions.sort((a, b) => {
        if (sortOrder === "asc") {
          return new Date(a?.[sortBy]) - new Date(b?.[sortBy]);
        } else {
          return new Date(b?.[sortBy]) - new Date(a?.[sortBy]);
        }
      }),
    [props.uniqueUserActions]
  );

  return (
    <List
      sx={{
        padding: 0,
        overflowY: "scroll",
        width: "100%",
        height: "calc(100vh - 292px)",
      }}
    >
      {props.showSkeletons
        ? Array(10)
            .fill({})
            .map((_, idx) => {
              return <UserListItem key={idx} divider showSkeletons />;
            })
        : sortedUserActions.map((action) => {
            return (
              <UserListItem
                key={action.actionByUserZUID}
                action={action}
                actions={props.actions}
                clickable
                divider
              />
            );
          })}
    </List>
  );
};
