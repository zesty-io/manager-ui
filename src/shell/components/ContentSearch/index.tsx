import TextField from "@mui/material/TextField";
import { FC, useState, useRef } from "react";
import SearchIcon from "@mui/icons-material/SearchRounded";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import { HTMLAttributes } from "react";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import PencilIcon from "@mui/icons-material/Create";
import { useMetaKey } from "../../../shell/hooks/useMetaKey";
import { useSearchContentQuery } from "../../services/instance";
import { ContentItem } from "../../services/types";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { notify } from "../../store/notifications";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Collapse from "@mui/material/Collapse";
import { useTheme } from "@mui/material/styles";

const ContentSearch: FC = () => {
  const [value, setValue] = useState("");
  const history = useHistory();
  const dispatch = useDispatch();

  const textfieldRef = useRef<HTMLDivElement>();

  const res = useSearchContentQuery({ query: value }, { skip: !value });

  const suggestions = res.data;
  const topSuggestions =
    suggestions && value ? [value, ...suggestions.slice(0, 5)] : [];

  //@ts-ignore TODO fix typing for useMetaKey
  const shortcutHelpText = useMetaKey("k", () => {
    textfieldRef.current?.querySelector("input").focus();
  });
  const languages = useSelector((state: any) => state.languages);
  const [open, setOpen] = useState(false);

  const theme = useTheme();
  return (
    <Collapse
      in={open}
      collapsedSize="288px"
      orientation="horizontal"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer - 1,
        height: "40px",
        position: "relative",
        width: "500px",
        "& .MuiCollapse-entered": {
          width: "500px",
        },
      }}
    >
      <Autocomplete
        value={value}
        open={open}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        PaperComponent={(props) => {
          return (
            <Paper
              {...props}
              elevation={0}
              sx={{
                borderStyle: "solid",
                borderWidth: "0px 1px 1px 1px",
                borderColor: "border",
                //borderColor: "#FF0000",
                borderRadius: "0px 0px 4px 4px",
              }}
            />
          );
        }}
        PopperComponent={(props) => {
          return (
            <Popper
              {...props}
              modifiers={[
                {
                  name: "offset",
                  options: {
                    offset: [-1, 0],
                  },
                },
                {
                  name: "width",
                  enabled: true,
                  phase: "beforeWrite",
                  requires: ["computeStyles"],
                  fn: ({ state }) => {
                    state.styles.popper.width = "502px";
                  },
                },
              ]}
              style={{
                ...props.style,
                // default z-index is too high, we want it to be BELOW the side nav close button
                zIndex: theme.zIndex.drawer - 1,
              }}
            />
          );
        }}
        id="global-search-autocomplete"
        freeSolo
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        options={topSuggestions}
        filterOptions={(x) => x}
        sx={{
          height: "40px",
          //width: "288px",
          width: open ? "500px" : "288px",
          //width: "500px",
          //width: "100%",
          //borderWidth: "0px 1px 1px 0px",
          //borderStyle: "solid",
          //borderColor: "grey.100",
          boxSizing: "border-box",
          "& .MuiFormControl-root": {
            gap: "10px",
          },
        }}
        onInputChange={(event, newVal) => {
          setValue(newVal);
        }}
        onChange={(event, newVal) => {
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
          // do not change the input value when a suggestion is selected
          return value;
        }}
        renderOption={(props, option) => {
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
            const getText = () => {
              const title = option?.web?.metaTitle || "Missing Meta Title";
              const langCode = languages.find(
                (lang: any) => lang.ID === option?.meta?.langID
              )?.code;
              const langDisplay = langCode ? `(${langCode}) ` : null;
              return langDisplay ? `${langDisplay}${title}` : title;
            };
            return (
              <Suggestion
                {...props}
                key={option.meta.ZUID}
                icon="pencil"
                text={getText()}
              />
            );
          }
        }}
        renderInput={(params: any) => {
          return (
            <TextField
              {...params}
              ref={textfieldRef}
              fullWidth
              data-cy="global-search-textfield"
              variant="outlined"
              placeholder={`Search Instance ${shortcutHelpText}`}
              sx={{
                height: "40px",
                "& .Mui-focused": {
                  width: "500px",
                },
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  history.push(`/search?q=${value}`);
                }
              }}
              inputProps={{
                ...params.inputProps,
                style: {
                  ...params.inputProps.style,
                  paddingLeft: "4px",
                },
              }}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start" sx={{ marginRight: 0 }}>
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                sx: {
                  "&.MuiAutocomplete-inputRoot": {
                    py: "2px",
                  },

                  borderRadius: "4px 4px 0px 0px",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderWidth: "1px",
                  },
                  boxSizing: "border-box",
                  width: "100%",
                  backgroundColor: (theme) => theme.palette.background.paper,
                },
              }}
            />
          );
        }}
      />
    </Collapse>
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
        "&.MuiAutocomplete-option": {
          padding: "4px 16px 4px 16px",
        },
        minHeight: "36px",
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
        primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
      />
    </ListItem>
  );
};
