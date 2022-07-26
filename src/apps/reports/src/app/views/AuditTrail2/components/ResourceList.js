import { useMemo } from "react";
import { uniqBy } from "lodash";
import { FixedSizeList as List } from "react-window";
import { ResourceListItem } from "./ResourceListItem";
import { useParams } from "shell/hooks/useParams";
import { useWindowSize } from "react-use";
import { Skeleton } from "@mui/material";
import { ListItem } from "./ResourceListItem/ListItem";

export const ResourceList = (props) => {
  const [params] = useParams();
  const { width, height } = useWindowSize();
  const sortBy = params.get("sortBy");
  const sortOrder = sortBy?.startsWith("+") ? "desc" : "asc";

  const sortedResources = useMemo(
    () =>
      uniqBy(props.actions, "affectedZUID").sort((a, b) => {
        if (sortOrder === "asc") {
          return new Date(a?.[sortBy]) - new Date(b?.[sortBy]);
        } else {
          return new Date(b?.[sortBy]) - new Date(a?.[sortBy]);
        }
      }),
    [props.actions, sortBy, sortOrder]
  );

  const Row = ({ index, data, style }) => {
    if (props.showSkeletons) {
      return (
        <div style={style}>
          <ListItem showSkeletons divider />
        </div>
      );
    }
    const resource = data[index];
    return (
      <div style={style}>
        <ResourceListItem resource={resource} divider clickable />
      </div>
    );
  };

  return (
    <List
      height={height - 292}
      itemCount={props.showSkeletons ? 10 : sortedResources.length}
      itemSize={94}
      width={"100%"}
      itemData={sortedResources}
    >
      {Row}
    </List>
  );
};
