import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { FixedSizeList as ListBox } from "react-window";
import Typography from "@mui/material/Typography";
import { Box, Paper, createFilterOptions, Skeleton } from "@mui/material";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

import SearchIcon from "@mui/icons-material/Search";
import { ContentItemProps, TARGET_ERRORS } from "../constants";
import { InputAdornment } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import AutoSizer from "react-virtualized-auto-sizer";

const ListOption: React.FC<ContentItemProps & { isListItem?: boolean }> = ({
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
      component={isListItem ? "li" : "div"}
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

  return (
    <div
      ref={ref}
      style={{ width: "100%", height: `${rowHeight * 6}px` }}
      {...other}
    >
      <AutoSizer>
        {({ width, height }: { width: number; height: number }) => (
          <ListBox
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={rowHeight}
            overscanCount={5}
          >
            {({ index, style }) => <div style={style}>{items[index]}</div>}
          </ListBox>
        )}
      </AutoSizer>
    </div>
  );
});

type SearchFieldProps = {
  options: ContentItemProps[];
  loading: boolean;
  value: ContentItemProps;
  defaultValue?: string;
  onChange: (value: ContentItemProps) => void;
};

const SearchField: React.FC<SearchFieldProps> = ({
  options,
  loading,
  value,
  defaultValue,
  onChange,
}) => {
  const textInputRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const filterOptions = createFilterOptions({
    matchFrom: "any",
    stringify: (option: any) =>
      `${option?.label}\n${option?.path}\n${option?.ZUID}`,
  });

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
          open={open}
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
