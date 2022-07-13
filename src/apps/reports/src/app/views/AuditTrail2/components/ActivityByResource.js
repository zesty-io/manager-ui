import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { Pie } from "react-chartjs-2";
import { startCase } from "lodash";

const resourceTypes = ["content", "schema", "code", "settings"];

const resourceColorMap = {
  content: "deepPurple",
  schema: "blue",
  code: "pink",
  settings: "green",
};

export const ActivityByResource = (props) => {
  const theme = useTheme();

  const pieData = resourceTypes.map((type) =>
    Math.ceil(
      (props.resources.filter((resource) => resource.resourceType === type)
        .length /
        props.resources.length) *
        100
    )
  );

  return (
    <>
      <Typography variant="overline">ACTIVITY BY RESOURCE</Typography>
      <Typography variant="h4">{props.resources.length}</Typography>
      <Typography variant="subtitle2">Actions</Typography>
      <Box sx={{ width: 160, height: 160, mt: 3, mb: 4 }}>
        <Pie
          width={"100%"}
          height={"100%"}
          options={{
            legend: {
              display: false,
            },
          }}
          data={{
            labels: ["Content", "Schema", "Code", "Settings"],
            datasets: [
              {
                data: pieData,
                backgroundColor: Object.values(resourceColorMap).map(
                  (color) => theme.palette[color][400]
                ),
              },
            ],
          }}
        />
      </Box>
      {resourceTypes.map((type) => (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              mr: 1,
              width: 12,
              height: 12,
              backgroundColor: `${resourceColorMap[type]}.400`,
              borderRadius: 100,
            }}
          ></Box>
          <Typography variant="caption">{startCase(type)}</Typography>
          <Typography variant="caption" sx={{ ml: "auto" }}>
            {Math.ceil(
              (props.resources.filter(
                (resource) => resource.resourceType === type
              ).length /
                props.resources.length) *
                100
            )}
            %
          </Typography>
        </Box>
      ))}
    </>
  );
};
