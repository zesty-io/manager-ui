import React from "react";
import { useTranslation } from "react-i18next";

import { Box, Select, MenuItem } from "@mui/material";

import { formatName } from "utility/formatName";

export default function Columns(props) {
  const { t } = useTranslation();
  const filterDeactivated = props.fields.filter((field) => !field.deletedAt);

  return (
    <Box
      component="header"
      style={props.style}
      sx={{ display: "flex", zIndex: 1 }}
    >
      <Box
        component="span"
        sx={{
          bgcolor: "grey.600",
          color: "blue.50",
          display: "flex",
          flex: 1,
          height: "100%",
          alignItems: "center",
          minHeight: 60,
        }}
      >
        {props.cols.map((col, index) => {
          // Handles empty columns
          const colName = `${formatName(col)}-${index}`;
          return (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
                minWidth: 250,
                maxWidth: 250,
                py: 0.5,
                px: 2,
                mb: 1,
              }}
            >
              <Box
                component="span"
                sx={{ display: "inline-block", minWidth: 250, py: 1 }}
              >
                {col.toUpperCase()}
              </Box>
              <Select
                name={colName}
                value={props.fieldMaps[col] || "none"}
                onChange={(evt) => {
                  props.handleMap(evt.target.value, col);
                }}
                size="small"
              >
                <MenuItem value="none">{t("content.csvImportNone")}</MenuItem>
                {filterDeactivated.map((field) => (
                  <MenuItem key={field.name} value={field.name}>
                    {field.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
