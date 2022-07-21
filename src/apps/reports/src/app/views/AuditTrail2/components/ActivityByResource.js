import { useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { Pie } from "react-chartjs-2";
import { startCase } from "lodash";

const resourceTypes = ["content", "schema", "code", "settings"];

const resourceTypeColors = {
  content: "deepPurple",
  schema: "blue",
  code: "pink",
  settings: "green",
};

export const ActivityByResource = (props) => {
  const theme = useTheme();

  const resourceTypePercentages = useMemo(
    () =>
      resourceTypes
        .map((type) => ({
          type,
          percentage: Math.ceil(
            (props.resources.filter(
              (resource) => resource.resourceType === type
            ).length /
              props.resources.length) *
              100
          ),
        }))
        .sort((a, b) => b.percentage - a.percentage),
    [props.resources]
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
            plugins: { legend: { display: false } },
          }}
          data={{
            labels: resourceTypes,
            datasets: [
              {
                data: resourceTypePercentages.map(
                  (resource) => resource.percentage
                ),
                backgroundColor: resourceTypePercentages.map(
                  (resource) =>
                    theme.palette[resourceTypeColors[resource.type]][400]
                ),
              },
            ],
          }}
        />
      </Box>
      {resourceTypePercentages.map((resource) => (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              mr: 1,
              width: 12,
              height: 12,
              backgroundColor: `${resourceTypeColors[resource.type]}.400`,
              borderRadius: 100,
            }}
          ></Box>
          <Typography variant="caption">{startCase(resource.type)}</Typography>
          <Typography variant="caption" sx={{ ml: "auto" }}>
            {resource.percentage}%
          </Typography>
        </Box>
      ))}
    </>
  );
};
