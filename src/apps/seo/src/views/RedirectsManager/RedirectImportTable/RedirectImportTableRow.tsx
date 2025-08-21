import React, { useState } from "react";
import {
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  TextField,
  SelectChangeEvent,
  Grid,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { createRedirect } from "../../../store/redirects";
import { importTarget } from "../../../store/imports";
import { importQuery } from "../../../store/imports";
import { importCode } from "../../../store/imports";
import { importTargetType } from "../../../store/imports";

interface RedirectImportTableRowProps {
  index: number;
  path: string;
  code: number;
  targetType?: string;
  target?: string;
  target_zuid?: string;
  query_string?: string;
  isLoading?: boolean;
  dispatch: (action: any) => void;
}

const RedirectImportTableRow = ({
  index,
  path,
  code,
  target,
  targetType,
  target_zuid,
  query_string,
  isLoading,
  dispatch,
}: RedirectImportTableRowProps) => {
  const [loading, setLoading] = useState(false);

  const handleCode = (val: string) => {
    dispatch(importCode(path, val));
  };

  const handlePathTarget = (
    evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    dispatch(importTarget(path, evt.target.value, ""));
  };

  const handleTargetType = (evt: SelectChangeEvent<string>) => {
    dispatch(importTargetType(path, evt.target.value));
  };

  const handleQuery = (
    evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    dispatch(importQuery(path, evt.target.value));
  };

  const handleAddRedirect = async (
    evt: React.MouseEvent<HTMLButtonElement>
  ) => {
    setLoading(true);
    await dispatch(
      createRedirect({
        path: path,
        query_string: query_string,
        targetType: targetType,
        target: target_zuid || target,
        code: Number(code),
      })
    );
    setLoading(false);
  };

  const handleToggle = (val: string | null) => {
    if (val === null) return;
    handleCode(val);
  };

  return (
    <Grid
      container
      spacing={3}
      width="100%"
      py={2.5}
      pl={2}
      pr={1}
      direction="row"
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "nowrap",
        color: "text.secondary",
        backgroundColor: index % 2 === 0 ? "transparent" : "grey.50",
      }}
    >
      <Grid size="grow" minWidth="200px">
        <Typography variant="body2" fontWeight={400}>
          {path}
        </Typography>
      </Grid>

      <Grid minWidth="115px">
        <ToggleButtonGroup
          color="primary"
          value={code}
          size="small"
          exclusive
          onChange={(evt, val) => handleToggle(val)}
        >
          <ToggleButton value={"302"}>302</ToggleButton>
          <ToggleButton value={"301"}>301</ToggleButton>
        </ToggleButtonGroup>
      </Grid>
      <Grid minWidth="130px">
        <Select
          onChange={handleTargetType}
          size="small"
          fullWidth
          value={targetType}
        >
          <MenuItem value={"path"}>Wildcard</MenuItem>
          <MenuItem value={"page"}>Internal</MenuItem>
          <MenuItem value={"external"}>External</MenuItem>
        </Select>
      </Grid>

      <Grid size="grow" minWidth="200px">
        <TextField
          onChange={handlePathTarget}
          defaultValue={target}
          size="small"
          variant="outlined"
          color="primary"
          fullWidth
        />
        {targetType === "path" && (
          <TextField
            onChange={handleQuery}
            placeholder="Redirect query string"
            defaultValue={query_string}
            size="small"
            variant="outlined"
            color="primary"
            fullWidth
          />
        )}
      </Grid>

      <Grid width="115px" sx={{ textAlign: "center" }}>
        <Button
          variant="contained"
          onClick={handleAddRedirect}
          startIcon={<AddIcon />}
          size="small"
          loading={isLoading || loading}
        >
          Redirect
        </Button>
      </Grid>
    </Grid>
  );
};

export default RedirectImportTableRow;
