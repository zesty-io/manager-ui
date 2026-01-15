import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { List, RowComponentProps } from "react-window";
import Typography from "@mui/material/Typography";
import { Box, Paper, createFilterOptions, Skeleton } from "@mui/material";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

import SearchIcon from "@mui/icons-material/Search";
import { ContentItemProps, TARGET_ERRORS } from "../constants";
import { InputAdornment } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import { debounce } from "lodash";

export const ListOption: React.FC<
  ContentItemProps & { isListItem?: boolean }
> = ({
  label,
  path,
  ZUID,
  langCode,
  isPublished,
  isListItem = true,
  type,
  onDelete = () => {},
  ...props
}) => {
  return (
    <Box
      key={ZUID}
      {...props}
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      flexGrow={1}
      columnGap="12px"
      {...(isListItem
        ? { px: "16px", py: "8px" }
        : { pl: "8px", width: "100%", height: "52px" })}
    >
      {type === "pageset" ? (
        <DescriptionIcon fontSize="small" color="action" />
      ) : (
        <FormatListBulletedIcon fontSize="small" color="action" />
      )}
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="stretch"
        flexGrow={1}
        sx={{
          overflow: "hidden",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <Typography
          variant="body2"
          color="text.primary"
          noWrap
          textOverflow="ellipsis"
          overflow="hidden"
          fontWeight={500}
          px="2px"
        >
          {`(${langCode}) ${label?.trim()}`}
        </Typography>
        <Typography
          variant="body2"
          color="info.dark"
          noWrap
          textOverflow="ellipsis"
          maxWidth="100%"
          overflow="hidden"
          px="2px"
        >
          {path}
        </Typography>
      </Box>
    </Box>
  );
};

const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const items = React.Children.toArray(children);

  const rowHeight = 56;

  const Row = ({ index, style, data }: any) => {
    return <li style={style}>{data[index]}</li>;
  };

  return (
    <div
      ref={ref}
      data-cy="RedirectsTargetOptionsContainer"
      style={{ width: "100%", height: `${rowHeight * 5}px` }}
      {...other}
    >
      <ul>
        <List
          rowCount={items.length}
          rowHeight={rowHeight}
          overscanCount={5}
          rowProps={{ data: items }}
          rowComponent={Row}
        />
      </ul>
    </div>
  );
});

type SearchFieldProps = {
  options: ContentItemProps[];
  loading?: boolean;
  value: ContentItemProps;
  defaultValue?: string;
  onChange: (value: ContentItemProps) => void;
  readOnly?: boolean;
  onSearch?: (term: string) => void;
};

const SearchField: React.FC<SearchFieldProps> = ({
  options,
  loading = false,
  value,
  defaultValue,
  onChange,
  readOnly = false,
  onSearch,
}) => {
  const textInputRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);

  const defaultFilter = createFilterOptions<ContentItemProps>({
    matchFrom: "any",
    stringify: (option: ContentItemProps) =>
      `${option?.label}\n${option?.path}\n${option?.ZUID}`,
  });

  const filterOptions = (
    opts: ContentItemProps[],
    state: Parameters<typeof defaultFilter>[1]
  ) => {
    const filtered = defaultFilter(opts, state);

    /*
      Limit the rendered items to 100 items max to avoid performance issues
      and require the user to type more to narrow down results
     */
    return filtered.slice(0, 100);
  };

  const handleDebouncedInput = React.useCallback(
    debounce((value: string) => {
      if (value && onSearch) {
        onSearch(value);
      }
    }, 500),
    []
  );

  React.useEffect(() => {
    if (!defaultValue) return;
    if (!loading && !!options) {
      const foundValue = options?.find((item) => item?.ZUID === defaultValue);
      onChange(foundValue);
    }
  }, [defaultValue, options, loading]);

  return (
    <>
      {loading && !!defaultValue ? (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            px: "12px",
            py: "8px",
            width: "100%",
            height: "64px",
            borderRadius: "8px",
            borderColor: "border",
          }}
        >
          <ListOptionSkeleton count={1} />
        </Paper>
      ) : (
        <Autocomplete
          data-cy="RedirectsSearchFieldInput"
          readOnly={readOnly}
          disabled={readOnly}
          open={readOnly ? false : open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          limitTags={1}
          options={loading ? [] : options}
          size="small"
          fullWidth
          loading={loading}
          loadingText={<ListOptionSkeleton count={4} />}
          value={value}
          filterOptions={filterOptions}
          onInputChange={(evt, value) => handleDebouncedInput(value)}
          onClickCapture={(e) => {
            if (!!value) {
              setOpen(true);
            }
          }}
          noOptionsText="No results found"
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                data-cy="RedirectsSearchFieldInputField"
                inputRef={textInputRef}
                slotProps={{
                  input: {
                    ...params.InputProps,
                    placeholder: "Search for item",
                    readOnly: !!value,
                    ...(!!value
                      ? {}
                      : {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }),
                  },
                }}
                sx={{
                  "& .MuiInputBase-root .MuiAutocomplete-endAdornment": {
                    right: "16px!important",
                  },
                  "& .MuiInputBase-root": {
                    paddingRight: "56px!important",
                  },
                }}
              />
            );
          }}
          renderValue={(data: ContentItemProps | null) => (
            <ListOption
              label={data?.label}
              path={data?.path}
              ZUID={data?.ZUID}
              langCode={data?.langCode}
              isPublished={data?.isPublished}
              type={data?.type}
              isListItem={false}
            />
          )}
          onChange={(_: any, newValue: ContentItemProps | null) =>
            onChange(newValue)
          }
          renderOption={(props, option) => (
            <ListOption
              {...props}
              key={option.ZUID}
              label={option.label}
              path={option.path}
              ZUID={option.ZUID}
              langCode={option.langCode}
              isPublished={option.isPublished}
              type={option.type}
            />
          )}
          slotProps={{
            listbox: {
              component: ListboxComponent,
            },
          }}
          sx={{
            "& .MuiInputBase-root input": {
              width: !!value ? "5px" : "auto",
              minWidth: "0!important",
            },
            "& .MuiAutocomplete-popupIndicator": {
              display: "none",
            },
          }}
        />
      )}

      {value && !value?.isPublished && (
        <Typography
          variant="body2"
          color="warning.dark"
          mt="4px"
          data-cy="RedirectsSearchFieldError"
        >
          {TARGET_ERRORS.unpublished}
        </Typography>
      )}
    </>
  );
};

export const ListOptionSkeleton = ({ count = 4 }: { count: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          data-cy="RedirectsTargetListLoadingSkeleton"
          key={index}
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          columnGap="12px"
          py="8px"
        >
          <Skeleton
            variant="circular"
            sx={{
              width: "20px",
              height: "20px",
              flexShrink: 0,
            }}
          />

          <Box
            display="flex"
            flexDirection="column"
            justifyContent="cennter"
            alignItems="flex-start"
            width="100%"
            flexGrow={1}
            rowGap="6px"
          >
            <Skeleton width="45%" height="12px" variant="rounded" />
            <Skeleton width="90%" height="12px" variant="rounded" />
          </Box>
        </Box>
      ))}
    </>
  );
};

export default SearchField;
