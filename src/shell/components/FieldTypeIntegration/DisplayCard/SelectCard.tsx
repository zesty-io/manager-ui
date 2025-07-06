import { FC } from "react";
import Box from "@mui/material/Box";

import { Checkbox, IconButton, Paper, alpha } from "@mui/material";

import DataObjectIcon from "@mui/icons-material/DataObject";

import DisplayCard from ".";
import { IntegrationKeyPaths, IntegrationTypes } from "../../../services/types";
import Skeleton from "@mui/material/Skeleton";

type SelectCardProps = IntegrationKeyPaths & {
  id: string;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onViewJson?: (data: any) => void;
  data?: any;
  loading?: boolean;
  propertyPaths?: IntegrationKeyPaths;
  type?: IntegrationTypes;
  disabled?: boolean;
};

const SelectCard: FC<SelectCardProps> = ({
  id,
  heading,
  subHeading,
  thumbnail,
  detail,
  details,
  isSelected,
  onSelect,
  onViewJson,
  data,
  type,
  loading = false,
  disabled = false,
}) => {
  return (
    <Paper
      className={isSelected ? "select-card" : ""}
      elevation={0}
      sx={{
        py: 1,
        pl: "54px",
        pr: "58px",
        width: "100%",
        height: "fit-content",
        borderRadius: 0,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid",
        borderColor: "border",
        boxShadow: "none",
        backgroundColor: "background.paper",

        "&.select-card": {
          backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.04),
          boxShadow: (theme) =>
            `0px -2px 0px 0px ${theme.palette.primary.light} inset`,
        },
        "& *": {
          boxSizing: "border-box",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: "8px",
          display: "grid",
          placeContent: "center",
        }}
      >
        {loading ? (
          <Skeleton
            animation="wave"
            variant="rounded"
            height="20px"
            width="20px"
            sx={{ m: "8px" }}
          />
        ) : (
          <Checkbox
            disabled={!isSelected && disabled}
            checked={isSelected}
            onChange={(e) => {
              onSelect(e.target.checked);
            }}
            sx={{
              color: "action.active",
            }}
          />
        )}
      </Box>

      <Box
        width="100%"
        height="100%"
        position="relative"
        boxSizing="border-box"
        overflow="hidden"
        sx={{
          "& .media-thumbnail": {
            borderRadius: "8px",
          },
        }}
      >
        <DisplayCard
          type={type}
          heading={heading}
          subHeading={subHeading}
          thumbnail={thumbnail}
          detail={detail}
          details={details}
          data={data}
          showPlayIcon={true}
          loading={loading}
        />
      </Box>

      <Box
        position="absolute"
        right={0}
        width="58px"
        height="100%"
        pr={2}
        sx={{
          display: "grid",
          placeContent: "center",
        }}
      >
        {loading ? (
          <Skeleton
            animation="wave"
            variant="rounded"
            height="20px"
            width="20px"
          />
        ) : (
          <IconButton
            sx={{
              borderRadius: 1,
              color: "action.active",
            }}
            onClick={onViewJson}
          >
            <DataObjectIcon />
          </IconButton>
        )}
      </Box>
    </Paper>
  );
};

export default SelectCard;
