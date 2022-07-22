import React from "react";
import { Box } from "@mui/material";

import { ResourceList } from "../components/ResourceList";
import { ActivityByResource } from "../components/ActivityByResource";
import { useParams } from "shell/hooks/useParams";
import { UsersList } from "../components/UsersList";
import { Top5Users } from "../components/Top5Users";

export const Users = (props) => {
  const [params] = useParams();

  let filteredResources = props.resources;

  // for (const [key, value] of params.entries()) {
  //   // from, to and sortBy params are ignored for filtering
  //   if (key !== "from" && key !== "to" && key !== "sortBy") {
  //     filteredResources = filteredResources.filter(
  //       (resource) => resource?.[key] === value
  //     );
  //   }
  // }

  return (
    <Box
      sx={{
        px: 3,
      }}
    >
      {/* <ResourceListFilters resources={props.resources} /> */}
      <Box sx={{ display: "flex", gap: 17 }}>
        <UsersList actions={filteredResources} />
        <Box sx={{ px: 4, py: 2.5, minWidth: 298, boxSizing: "border-box" }}>
          <Top5Users actions={filteredResources} />
        </Box>
      </Box>
    </Box>
  );
};
