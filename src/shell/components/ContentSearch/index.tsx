import TextField from "@mui/material/TextField";
import { FC, useState, useRef } from "react";
import SearchIcon from "@mui/icons-material/SearchRounded";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { HTMLAttributes } from "react";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import PencilIcon from "@mui/icons-material/Create";
import { useMetaKey } from "../../../shell/hooks/useMetaKey";
import { useSearchContentQuery } from "../../services/instance";
import { ContentItem } from "../../services/types";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { notify } from "../../store/notifications";

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

  return (
    <Autocomplete
      value={value}
      fullWidth
      open={true} // TODO remove; for testing only
      id="global-search-autocomplete"
      freeSolo
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={topSuggestions}
      filterOptions={(x) => x}
      sx={{
        height: "40px",
        width: "288px",
        borderWidth: "0px 1px 1px 0px",
        borderStyle: "solid",
        borderColor: "grey.100",
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
            type="search"
            variant="outlined"
            placeholder={`Search Instance ${shortcutHelpText}`}
            sx={{
              height: "40px",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                history.push(`/search?q=${value}`);
              }
            }}
            inputProps={{
              ...params.inputProps,
              sx: {
                "::-webkit-search-cancel-button": {
                  display: "none",
                },
              },
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <Stack
                  direction="column"
                  sx={{
                    width: "28px",
                    height: "28px",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SearchIcon fontSize="small" color="action" />
                </Stack>
              ),
              sx: {
                borderRadius: 1,
                borderWidth: "0px 1px 1px 0px",
                borderStyle: "solid",
                borderColor: "border",
                padding: "6px 8px!important",
                gap: "4px",
                width: "100%",
                backgroundColor: (theme) => theme.palette.background.paper,
              },
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
        padding: "4px 16px 4px 16px!important",
        minHeight: "36px",
        "&.Mui-focused": {
          borderLeft: (theme) => "4px solid " + theme.palette.primary.main,
          padding: "4px 16px 4px 12px!important",
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
