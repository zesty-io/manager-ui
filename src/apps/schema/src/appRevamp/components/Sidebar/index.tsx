import {
  Box,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useGetContentModelsQuery } from "../../../../../../shell/services/instance";
import { ModelList } from "./ModelList";
import SchemaRoundedIcon from "@mui/icons-material/SchemaRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useHistory } from "react-router";
import { useParams } from "../../../../../../shell/hooks/useParams";
import { useEffect, useState } from "react";

export const Sidebar = () => {
  const { data: models } = useGetContentModelsQuery();
  const history = useHistory();
  const [params, setParams] = useParams();
  const [search, setSearch] = useState(params.get("term") || "");

  useEffect(() => {
    setSearch(params.get("term") || "");
  }, [params.get("term")]);

  return (
    <Box
      width={240}
      height="100%"
      display="flex"
      flexDirection="column"
      sx={{
        borderRight: (theme) => "1px solid " + theme.palette.border,
      }}
    >
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="h4" fontWeight={600}>
          Schema
        </Typography>
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          sx={{
            backgroundColor: "grey.50",
            mt: 1.5,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          placeholder="Search Models"
          onKeyPress={(event) =>
            event.key === "Enter" &&
            search &&
            history.push("/schema/search?term=" + search)
          }
        />
        <ListItemButton
          onClick={() => history.push("/schema")}
          sx={{
            mt: 2,
            borderRadius: "4px",
            "&.Mui-selected .MuiListItemIcon-root ": {
              color: "primary.main",
            },
            "&.Mui-selected .MuiTypography-root": {
              color: "primary.dark",
            },
          }}
          selected={location.pathname === "/schema"}
        >
          <ListItemIcon sx={{ minWidth: "36px" }}>
            <SchemaRoundedIcon />
          </ListItemIcon>
          <ListItemText
            primary="All Models"
            primaryTypographyProps={{
              // @ts-expect-error need body 3 module augmentation
              variant: "body3",
              color: "text.secondary",
            }}
          />
        </ListItemButton>
      </Box>
      <Box
        sx={{
          borderStyle: "solid",
          borderWidth: 0,
          borderTopWidth: 1,
          borderColor: "border",
          px: 2,
          py: 1,
          overflowY: "scroll",
          height: "100%",
        }}
      >
        <ModelList
          title="single page"
          models={models?.filter((model) => model.type === "templateset") || []}
        />
        <Box sx={{ mt: 1 }}>
          <ModelList
            title="multi page"
            models={models?.filter((model) => model.type === "pageset") || []}
          />
        </Box>
        <Box sx={{ mt: 1 }}>
          <ModelList
            title="headless dataset"
            models={models?.filter((model) => model.type === "dataset") || []}
          />
        </Box>
      </Box>
    </Box>
  );
};
