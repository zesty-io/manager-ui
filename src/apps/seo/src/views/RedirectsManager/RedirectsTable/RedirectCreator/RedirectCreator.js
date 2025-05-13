import { useState } from "react";
import {
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  InputAdornment,
  Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { createRedirect } from "../../../../store/redirects";
import ContentSearch from "shell/components/LegacyContentSearch";
import { Box } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

const optionTypes = [
  { label: "Internal", value: "page" },
  { label: "External", value: "external" },
  { label: "Wildcard", value: "path" },
];

export function RedirectCreator(props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [code, setCode] = useState(301); // Toggle defaults to 301
  const [contentSearchValue, setContentSearchValue] = useState("");
  const [type, setType] = useState(optionTypes[0]); // Set initial type as full object
  const [isLoading, setIsLoading] = useState(false);

  const determineTerm = (term) => {
    // ContentSearch return Object while Search return string
    let contentSearchValue = term?.meta ? term.web.path : term;
    setContentSearchValue(contentSearchValue);

    term = term.meta ? term.meta.ZUID : term;
    setTo(term);
  };

  const handleCreateRedirect = () => {
    setIsLoading(true);
    props
      .dispatch(
        createRedirect({
          path: from,
          targetType: type?.value,
          target: to,
          code, // API expects a 301/302 value
        })
      )
      .then(() => {
        setFrom("");
        setContentSearchValue("");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleToggle = (val) => {
    if (val === null) return;
    setCode(val);
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      py={2}
      px={2}
      width="100%"
      boxSizing="border-box"
      columnGap={1}
      bgcolor="grey.100"
      borderRadius={2}
    >
      <Box flexGrow={1} flexShrink={0}>
        <TextField
          name="redirectFrom"
          type="text"
          value={from}
          placeholder="URL path to redirect from"
          onChange={(evt) => setFrom(evt.target.value)}
          error={!!from.length && !from.startsWith("/")}
          size="small"
          variant="outlined"
          color="primary"
          fullWidth
        />
      </Box>
      <Box flexGrow={0} width="fit-content">
        <ToggleButtonGroup
          color="primary"
          value={code}
          size="small"
          exclusive
          onChange={(evt, val) => handleToggle(val)}
          sx={{
            "& button": {
              padding: "4px 4px",
            },
          }}
        >
          <ToggleButton value={302}>302</ToggleButton>
          <ToggleButton value={301}>301</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box width={150} flexGrow={0}>
        <Autocomplete
          fullWidth
          size="small"
          disablePortal
          name="selectType"
          autoHighlight
          onChange={(event, newValue) => {
            setType(newValue || null);
          }}
          disableClearable
          value={type}
          options={optionTypes}
          getOptionLabel={(option) => option?.label || ""}
          isOptionEqualToValue={(option, value) =>
            option?.value === value?.value
          }
          renderInput={(params) => (
            <TextField {...params} size="small" placeholder="Type" />
          )}
        />
      </Box>

      <Box flexGrow={1} flexShrink={0}>
        {type?.value === "page" ? (
          <ContentSearch
            placeholder="Search for item"
            onSelect={determineTerm}
            filterResults={(results) =>
              results.filter((result) => result.web.path !== null)
            }
            sx={{ width: "100%" }}
            value={contentSearchValue}
          />
        ) : (
          <TextField
            placeholder={
              type?.value === "external" ? "Add URL" : "Add File Path"
            }
            type="search"
            variant="outlined"
            size="small"
            sx={{ width: "100%" }}
            value={to}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            onChange={(evt) => {
              const term = evt.target.value;
              determineTerm(term);
            }}
          />
        )}
      </Box>
      <Box width="fit-content" flexGrow={0}>
        <LoadingButton
          loading={isLoading}
          variant="contained"
          color="primary"
          size="small"
          onClick={handleCreateRedirect}
          disabled={!from.length || !from.startsWith("/")}
          startIcon={<AddIcon />}
          fullWidth
          sx={{ whiteSpace: "nowrap", boxSizing: "border-box" }}
        >
          Create Redirect
        </LoadingButton>
      </Box>
    </Box>
  );
}
