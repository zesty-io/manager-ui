import TextField from "@mui/material/TextField";
import { FC, useState, useRef, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import Autocomplete from "@mui/material/Autocomplete";
import { HTMLAttributes } from "react";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import PencilIcon from "@mui/icons-material/Create";
import { useMetaKey } from "../../../shell/hooks/useMetaKey";
import { useSearchContentQuery } from "../../services/instance";
import { ContentItem } from "../../services/types";
import { useHistory } from "react-router";
import { useDispatch } from "react-redux";
import { notify } from "../../store/notifications";

const ContentSearch: FC = () => {
  const [value, setValue] = useState("");
  const history = useHistory();
  const dispatch = useDispatch();

  const textfieldRef = useRef<HTMLDivElement>();

  const res = useSearchContentQuery({ query: value }, { skip: !value });
  console.log("rtk response", res);

  const suggestions = res.data;
  const topSuggestions =
    suggestions && value ? [value, ...suggestions.slice(0, 5)] : [];
  console.log({ value, suggestions });

  //@ts-ignore TODO fix typing for useMetaKey
  const shortcutHelpText = useMetaKey("k", () => {
    textfieldRef.current?.querySelector("input").focus();
  });

  return (
    <Autocomplete
      value={value}
      fullWidth
      id="global-search-autocomplete"
      freeSolo
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={topSuggestions}
      filterOptions={(x) => x}
      onInputChange={(event, newVal) => {
        console.log("onInputChange", { event, newVal });
        setValue(newVal);
      }}
      onChange={(event, newVal) => {
        console.log("onChange", { event, newVal });
        // null represents "X" button clicked
        if (!newVal) {
          setValue("");
          return;
        }
        // string represents search term entered
        if (typeof newVal === "string") {
          history.push(`/search?q=${newVal}`);
        } else {
          // ContentItem represents a suggestion being clicked
          if (newVal?.meta) {
            history.push(
              `/content/${newVal.meta.contentModelZUID}/${newVal.meta.ZUID}`
            );
          } else {
            dispatch(
              notify({
                kind: "warn",
                message: "Selected item is missing meta data",
              })
            );
          }
        }
      }}
      getOptionLabel={(option: ContentItem) => {
        console.log("getOptionLabel", { option, suggestions, value });
        // do not change the input value when a suggestion is selected
        return value;
      }}
      renderOption={(props, option) => {
        console.log("renderOption", option, props);
        // type of string represents the top-row search term
        if (typeof option === "string")
          return (
            <Suggestion
              {...props}
              // Hacky: aria-selected is required for accessibility but the underlying component is not setting it correctly for the top row
              aria-selected={false}
              key={"global-search-term"}
              icon="search"
              onClick={() => history.push(`/search?q=${option}`)}
              text={option}
            />
          );
        // type of ContentItem represents a suggestion from the search API
        else {
          return (
            <Suggestion
              {...props}
              key={option.meta.ZUID}
              icon="pencil"
              text={option?.web?.metaTitle || "Missing Meta Title"}
            />
          );
        }
      }}
      renderInput={(params: any) => {
        console.log("renderInput");
        return (
          <TextField
            {...params}
            ref={textfieldRef}
            fullWidth
            type="search"
            variant="outlined"
            size="small"
            placeholder={`Search Instance ${shortcutHelpText}`}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                console.log("Enter pressed", e);
                history.push(`/search?q=${value}`);
              }
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: <SearchIcon fontSize="small" />,
              sx: {
                borderRadius: 1,
                padding: "6px 8px",
                gap: "10px",
                width: "100%",
                backgroundColor: (theme) => theme.palette.background.paper,
              },
            }}
            sx={{
              gap: "10px",
            }}
          />
        );
      }}
    />
  );
};

export default ContentSearch;

type SuggestionProps = HTMLAttributes<HTMLLIElement> & {
  text: string;
  icon: "search" | "pencil";
};
const Suggestion: FC<SuggestionProps> = ({ text, icon, ...props }) => {
  const Icon = icon === "search" ? SearchIcon : PencilIcon;
  return (
    <ListItem
      {...props}
      sx={{
        padding: "4px 16px 4px 16px",
        height: "36px",
        "&.Mui-focused": {
          borderLeft: (theme) => "4px solid " + theme.palette.primary.main,
          padding: "4px 16px 4px 12px",
        },
      }}
    >
      <ListItemIcon sx={{ width: "32px", minWidth: "32px" }}>
        <Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText
        primary={text}
        primaryTypographyProps={{ variant: "body2" }}
      />
    </ListItem>
  );
};
