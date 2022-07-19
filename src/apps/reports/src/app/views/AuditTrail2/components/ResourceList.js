import { useMemo } from "react";
import { uniqBy } from "lodash";
import { FixedSizeList as List } from "react-window";
import { ResourceListItem } from "./ResourceListItem";
import { useParams } from "utility/useParams";
import { useWindowSize } from "react-use";

export const ResourceList = (props) => {
  const [params] = useParams();
  const { width, height } = useWindowSize();

  const sortBy = useMemo(() => params.get("sortBy"), [params]);
  const sortOrder = useMemo(
    () => (params.get("sortBy")?.startsWith("+") ? "desc" : "asc"),
    [params]
  );

  const uniqueResources = useMemo(
    () =>
      uniqBy(props.resources, "affectedZUID").sort((a, b) => {
        if (sortOrder === "asc") {
          return new Date(a?.[sortBy]) - new Date(b?.[sortBy]);
        } else {
          return new Date(b?.[sortBy]) - new Date(a?.[sortBy]);
        }
      }),
    [props.resources, sortBy, sortOrder]
  );

  const Row = ({ index, data, style }) => {
    const resource = data[index];
    return (
      <div style={style}>
        <ResourceListItem resource={resource} divider />
      </div>
    );
  };

  return (
    <List
      height={height - 282}
      itemCount={uniqueResources.length}
      itemSize={94}
      width={"100%"}
      itemData={uniqueResources}
    >
      {Row}
    </List>
  );
};
