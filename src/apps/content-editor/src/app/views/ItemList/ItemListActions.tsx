import {
  Button,
  Box,
  InputAdornment,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { Database, IconButton } from "@zesty-io/material";
import {
  MoreHorizRounded,
  Add,
  Search,
  TableViewRounded,
  CheckRounded,
  CodeRounded,
  ContentCopyRounded,
} from "@mui/icons-material";
import { forwardRef, useState, useCallback } from "react";
import { useHistory, useParams as useRouterParams } from "react-router";
import { useFilePath } from "../../../../../../shell/hooks/useFilePath";
import { useParams } from "../../../../../../shell/hooks/useParams";
import { debounce } from "lodash";

export const ItemListActions = forwardRef((props, ref) => {
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);
  const codePath = useFilePath(modelZUID);
  const [isCopied, setIsCopied] = useState(false);
  const [params, setParams] = useParams();
  const [searchTerm, setSearchTerm] = useState(params.get("search") || "");

  const handleCopyClick = (data: string) => {
    navigator?.clipboard
      ?.writeText(data)
      .then(() => {
        setIsCopied(true);

        setTimeout(() => {
          setIsCopied(false);
        }, 5000);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const debouncedSetParams = useCallback(
    debounce((value) => {
      setParams(value, "search");
    }, 500),
    []
  );

  const handleSearchChange = (event: any) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSetParams(value);
  };

  return (
    <Box display="flex" gap={1}>
      <IconButton
        size="small"
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        <MoreHorizRounded />
      </IconButton>
      <Menu
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        open={!!anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={() => {
            history.push(`/content/${modelZUID}/import`);
          }}
        >
          <ListItemIcon>
            <TableViewRounded />
          </ListItemIcon>
          Import CSV
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCopyClick(modelZUID);
          }}
        >
          <ListItemIcon>
            {isCopied ? <CheckRounded /> : <ContentCopyRounded />}
          </ListItemIcon>
          Copy ZUID
        </MenuItem>
        <MenuItem
          onClick={() => {
            history.push(`/schema/${modelZUID}`);
          }}
        >
          <ListItemIcon>
            <Database />
          </ListItemIcon>
          Edit Model
        </MenuItem>
        <MenuItem
          onClick={() => {
            history.push(codePath);
          }}
        >
          <ListItemIcon>
            <CodeRounded />
          </ListItemIcon>
          Edit Template
        </MenuItem>
      </Menu>
      <TextField
        onChange={handleSearchChange}
        value={searchTerm}
        placeholder="Filter Items"
        variant="outlined"
        size="small"
        inputProps={{
          ref,
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          ),
          sx: {
            backgroundColor: "grey.50",
          },
        }}
      />
      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        size="small"
        onClick={() => {
          history.push(`/content/${modelZUID}/new`);
        }}
      >
        Create
      </Button>
    </Box>
  );
});
