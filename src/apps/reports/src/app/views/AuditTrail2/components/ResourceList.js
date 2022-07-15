import React from "react";
import { uniqBy } from "lodash";
import { FixedSizeList as List } from "react-window";
import { ResourceListItem } from "./ResourceListItem";

export const ResourceList = (props) => {
  const uniqueResources = uniqBy(props.resources, "affectedZUID");

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
      // TODO: Listen to height changes and adjust
      height={window.innerHeight - 282}
      itemCount={uniqueResources.length}
      itemSize={94}
      width={"100%"}
      itemData={uniqueResources}
    >
      {Row}
    </List>
  );
};
