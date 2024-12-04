import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormGroup,
  FormControlLabel,
  Switch,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import { Search } from "@mui/icons-material";

import { useWorkflowStatus } from "./WorkflowsContext";
import ActiveLabels from "./ActiveLabels";
import DeactivatedLabels from "./DeactivatedLabels";

const AuthorizedPage = () => {
  // const [searchValue, setSearchValue] = useState<string>("");
  const [showDeactivated, setShowDeactivated] = useState<boolean>(false);
  const { openStatusLabelForm, searchValue, setSearchValue } =
    useWorkflowStatus();

  return (
    <>
      <Box
        px={4}
        pt={4}
        pb={1.5}
        bgcolor="background.paper"
        borderBottom="2px solid"
        borderColor="border"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="baseline"
        flexGrow={0}
      >
        <Typography variant="h3" fontWeight={700} color="text.primary">
          Workflows
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
            openStatusLabelForm()
          }
          sx={{ mr: 1 }}
          size="small"
          startIcon={<AddIcon />}
        >
          Create Status
        </Button>
      </Box>
      <Box
        px={4}
        py={2}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        flexGrow={0}
      >
        <TextField
          placeholder="Search Statuses"
          variant="outlined"
          size="small"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            // inputRef: searchInputRef,
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: "background.paper",
              minWidth: "320px",
            },
          }}
        />
        <FormGroup>
          <FormControlLabel
            defaultChecked
            control={
              <Switch
                size="small"
                value="deactivated"
                onChange={(e) => setShowDeactivated(e.target.checked)}
              />
            }
            label={
              <Typography variant="subtitle2">Show Deactivated</Typography>
            }
          />
        </FormGroup>
      </Box>

      <Box
        px={0}
        pt={0}
        pb={1}
        display="block"
        width="100%"
        position="relative"
        boxSizing="border-box"
        flexGrow={1}
        overflow="auto"
      >
        <ActiveLabels visibleHeader={showDeactivated} />
        <DeactivatedLabels isVisible={showDeactivated} />
      </Box>
    </>
  );
};
export default AuthorizedPage;
