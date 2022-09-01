import { useMemo } from "react";
import { List } from "@mui/material";
import { useParams } from "shell/hooks/useParams";
import { UserListItem } from "./UserListItem";

export const UsersList = (props) => {
  const [params] = useParams();
  const sortBy = params.get("sortByUsers");

  const sortedUserActions = useMemo(() => {
    if (sortBy === "happenedAt") {
      return props.uniqueUserActions.sort(
        (a, b) => new Date(b?.[sortBy]) - new Date(a?.[sortBy])
      );
    } else if (sortBy === "leastActive") {
      return props.uniqueUserActions.sort(
        (a, b) =>
          props.actions?.filter(
            (action) => action.actionByUserZUID === a?.actionByUserZUID
          ).length -
          props.actions?.filter(
            (action) => action.actionByUserZUID === b?.actionByUserZUID
          ).length
      );
    } else {
      return props.uniqueUserActions.sort(
        (a, b) =>
          props.actions?.filter(
            (action) => action.actionByUserZUID === b?.actionByUserZUID
          ).length -
          props.actions?.filter(
            (action) => action.actionByUserZUID === a?.actionByUserZUID
          ).length
      );
    }
  }, [props.uniqueUserActions]);

  return (
    <List
      sx={{
        padding: 0,
        overflowY: "scroll",
        width: "100%",
        height: "calc(100vh - 280px)",
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
