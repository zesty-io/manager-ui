import { useMemo } from "react";
import { Box, Typography, useTheme, Skeleton } from "@mui/material";
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
            (props.actions.filter((resource) => resource.resourceType === type)
              .length /
              props.actions.length) *
              100
          ),
        }))
        .sort((a, b) => b.percentage - a.percentage),
    [props.actions]
  );

  return (
    <>
      <Typography variant="overline">
        {props.showSkeletons ? (
          <Skeleton
            variant="reactangular"
            width={159}
            height={16}
            sx={{ mb: 2.75 }}
          />
        ) : (
          "ACTIVITY BY RESOURCE"
        )}
      </Typography>
      <Typography variant="h4">
        {props.showSkeletons ? (
          <Skeleton
            variant="reactangular"
            width={44}
            height={20}
            sx={{ mb: 1.75 }}
          />
        ) : (
          props.actions.length
        )}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary">
        {props.showSkeletons ? (
          <Skeleton variant="reactangular" width={52} height={12} />
        ) : (
          "Actions"
        )}
      </Typography>
      {props.showSkeletons ? (
        <Skeleton
          variant="circular"
          width={160}
          height={160}
          sx={{ mt: 3, mb: 4 }}
        />
      ) : (
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
      )}
      {resourceTypePercentages.map((resource, idx) => (
        <Box key={idx} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {props.showSkeletons ? (
            <>
              <Skeleton
                variant="circular"
                height={12}
                width={12}
                sx={{ mr: 1 }}
              />
              <Skeleton variant="reactangular" height={8} width={85} />
              <Skeleton
                variant="reactangular"
                height={8}
                width={26}
                sx={{ ml: "auto" }}
              />
            </>
          ) : (
            <>
              <Box
                sx={{
                  mr: 1,
                  width: 12,
                  height: 12,
                  backgroundColor: `${resourceTypeColors[resource.type]}.400`,
                  borderRadius: 100,
                }}
              ></Box>
              <Typography variant="caption">
                {startCase(resource.type)}
              </Typography>
              <Typography variant="caption" sx={{ ml: "auto" }}>
                {resource.percentage}%
              </Typography>
            </>
          )}
        </Box>
      ))}
    </>
  );
};
